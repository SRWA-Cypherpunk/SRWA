import { useCallback } from 'react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useProgramsSafe } from '@/contexts/ProgramContext';

export interface TransferParams {
  mint: PublicKey;
  destination: PublicKey;
  amount: number;
  decimals: number;
}

export interface TransferHookAccounts {
  config: PublicKey;
  offering: PublicKey;
  fromRegistry: PublicKey;
  toRegistry?: PublicKey;
}

/**
 * Hook for transferring SRWA tokens (Token-2022 with transfer hook)
 *
 * This hook handles:
 * - Creating destination ATA if needed
 * - Invoking transfer hook validation via srwa_controller
 * - Proper error handling for compliance failures
 */
export function useSRWATransfer() {
  const { programs } = useProgramsSafe();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  /**
   * Transfer SRWA tokens with compliance checks
   */
  const transferSRWA = useCallback(
    async (params: TransferParams): Promise<string> => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }
      if (!programs?.srwaController || !programs?.srwaFactory) {
        throw new Error('Programs not loaded');
      }

      const { mint, destination, amount, decimals } = params;

      // Calculate PDAs
      const [srwaConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('srwa_config'), mint.toBuffer()],
        programs.srwaFactory.programId
      );

      const [offeringStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('offering'), mint.toBuffer()],
        programs.srwaFactory.programId
      );

      const [fromRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_registry'), wallet.publicKey.toBuffer()],
        programs.srwaFactory.programId
      );

      const [toRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_registry'), destination.toBuffer()],
        programs.srwaFactory.programId
      );

      // Get token accounts
      const sourceAta = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const destinationAta = getAssociatedTokenAddressSync(
        mint,
        destination,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const instructions: TransactionInstruction[] = [];

      // Verify source account exists and has balance
      try {
        const sourceAccount = await getAccount(
          connection,
          sourceAta,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );

        const transferAmount = BigInt(Math.floor(amount * 10 ** decimals));

        if (sourceAccount.amount < transferAmount) {
          throw new Error(
            `Insufficient balance. Required: ${transferAmount.toString()}, Available: ${sourceAccount.amount.toString()}`
          );
        }
      } catch (err: any) {
        if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
          throw new Error('Source token account not found. You may not have any tokens.');
        }
        throw err;
      }

      // Create destination ATA if needed
      const destinationAtaInfo = await connection.getAccountInfo(destinationAta);
      if (!destinationAtaInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            destinationAta,
            destination,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
        console.log('[useSRWATransfer] Creating destination ATA:', destinationAta.toBase58());
      }

      // Call transfer hook validation BEFORE the actual transfer
      // This validates compliance without modifying state
      try {
        await programs.srwaController.methods
          .onTransfer(new anchor.BN(Math.floor(amount * 10 ** decimals)))
          .accounts({
            mint,
            from: sourceAta,
            to: destinationAta,
            authority: wallet.publicKey,
            config: srwaConfigPda,
            offering: offeringStatePda,
            fromRegistry: fromRegistryPda,
            toRegistry: toRegistryPda, // Optional - may be undefined
          })
          .simulate();

        console.log('[useSRWATransfer] Transfer hook validation passed');
      } catch (err: any) {
        // Parse compliance errors
        if (err.toString().includes('TransferPaused')) {
          throw new Error('Transfers are currently paused by the admin');
        } else if (err.toString().includes('KYCFailed')) {
          throw new Error('KYC verification failed for sender or recipient');
        } else if (err.toString().includes('WindowClosed')) {
          throw new Error('Transfer window is closed');
        } else if (err.toString().includes('OfferingRulesViolated')) {
          throw new Error('Transfer violates offering rules (min ticket, max investors, etc.)');
        } else if (err.toString().includes('InvestorLimitExceeded')) {
          throw new Error('Transfer exceeds per-investor cap');
        }

        // Re-throw with original error if not a known compliance error
        throw new Error(`Transfer validation failed: ${err.message || err.toString()}`);
      }

      // Execute the actual transfer
      // Note: Token-2022 will automatically invoke the transfer hook during execution
      const transferAmount = BigInt(Math.floor(amount * 10 ** decimals));
      const maxU64 = (1n << 64n) - 1n;

      if (transferAmount > maxU64) {
        throw new Error('Transfer amount exceeds supported range');
      }

      instructions.push(
        createTransferCheckedInstruction(
          sourceAta,
          mint,
          destinationAta,
          wallet.publicKey,
          Number(transferAmount),
          decimals,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const tx = new Transaction().add(...instructions);

      // Send transaction
      const signature = await wallet.signAndSendTransaction(tx);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('[useSRWATransfer] Transfer completed', {
        from: wallet.publicKey.toBase58(),
        to: destination.toBase58(),
        amount: transferAmount.toString(),
        signature,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      });

      return signature;
    },
    [wallet, programs, connection]
  );

  /**
   * Check if a transfer would pass compliance checks (simulation only)
   */
  const validateTransfer = useCallback(
    async (params: TransferParams): Promise<{ valid: boolean; error?: string }> => {
      try {
        await transferSRWA(params); // Use simulate mode
        return { valid: true };
      } catch (err: any) {
        return {
          valid: false,
          error: err.message || err.toString(),
        };
      }
    },
    [transferSRWA]
  );

  return {
    transferSRWA,
    validateTransfer,
  };
}
