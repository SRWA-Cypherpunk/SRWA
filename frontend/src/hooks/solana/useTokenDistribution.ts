import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getMint,
  getTransferHook,
  getExtraAccountMetaAddress,
  getExtraAccountMetas,
  resolveExtraAccountMeta,
} from '@solana/spl-token';
import { toast } from 'sonner';

export interface DistributionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Hook for direct Token-2022 distribution with Transfer Hook
 *
 * IMPORTANT:
 * - This hook works specifically with Token-2022
 * - Transfer Hook (KYC) is executed automatically by SPL
 * - If recipient doesn't have KYC, transaction will fail on-chain
 *
 * FLOW:
 * 1. Validate mint (Token-2022)
 * 2. Fetch/create ATAs (source and destination)
 * 3. Create transfer instruction
 * 4. Transfer Hook executes automatically during transfer
 * 5. If KYC OK: transfer completed
 * 6. If KYC fails: transaction reverted
 */
export function useTokenDistribution() {
  const { connection } = useConnection();
  const wallet = useWallet();

  /**
   * Distribute RWA tokens directly to an investor
   * Transfer Hook validates KYC automatically
   */
  const distributeTokens = useCallback(
    async (
      tokenMint: PublicKey,
      recipientAddress: PublicKey,
      amount: number
    ): Promise<DistributionResult> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // 1. Fetch mint information
        const mintInfo = await getMint(
          connection,
          tokenMint,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );

        console.log('Mint Info:', {
          address: tokenMint.toBase58(),
          decimals: mintInfo.decimals,
          supply: mintInfo.supply.toString(),
          extensions: mintInfo.tlvData.length > 0 ? 'Has Extensions' : 'No Extensions',
        });

        // 2. Calcular quantidade com decimais
        const amountWithDecimals = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

        // 3. Buscar ATAs
        const sourceATA = getAssociatedTokenAddressSync(
          tokenMint,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const destinationATA = getAssociatedTokenAddressSync(
          tokenMint,
          recipientAddress,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        console.log('ATAs:', {
          source: sourceATA.toBase58(),
          destination: destinationATA.toBase58(),
        });

        // 4. Check if source ATA exists
        let sourceAccountExists = true;
        try {
          await getAccount(connection, sourceATA, 'confirmed', TOKEN_2022_PROGRAM_ID);
        } catch (error) {
          sourceAccountExists = false;
          throw new Error('You do not own this token. Create an ATA first.');
        }

        // 5. Register KYC for sender and recipient (if necessary)
        const TRANSFER_HOOK_PROGRAM_ID = new PublicKey('345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH');

        // Sender KYC
        const [senderKycPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('kyc'), wallet.publicKey.toBuffer()],
          TRANSFER_HOOK_PROGRAM_ID
        );

        const senderKycInfo = await connection.getAccountInfo(senderKycPDA);
        if (!senderKycInfo) {
          console.log('[useTokenDistribution] Registering KYC for sender...');

          // Create discriminator for initialize_kyc_registry
          const encoder = new TextEncoder();
          const data = encoder.encode('global:initialize_kyc_registry');
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const discriminator = new Uint8Array(hashBuffer).slice(0, 8);

          // Args: kyc_completed (bool) + is_active (bool)
          const args = Buffer.alloc(2);
          args.writeUInt8(1, 0); // kyc_completed = true
          args.writeUInt8(1, 1); // is_active = true

          const kycData = Buffer.concat([Buffer.from(discriminator), args]);

          const registerSenderKycIx = new TransactionInstruction({
            programId: TRANSFER_HOOK_PROGRAM_ID,
            keys: [
              { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // authority
              { pubkey: wallet.publicKey, isSigner: false, isWritable: false }, // user
              { pubkey: senderKycPDA, isSigner: false, isWritable: true }, // kyc_registry
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
            ],
            data: kycData,
          });

          const senderKycTx = new Transaction().add(registerSenderKycIx);
          senderKycTx.feePayer = wallet.publicKey;

          const { blockhash: kycBlockhash, lastValidBlockHeight: kycLastValid } = await connection.getLatestBlockhash();
          senderKycTx.recentBlockhash = kycBlockhash;

          const signedSenderKycTx = await wallet.signTransaction(senderKycTx);
          const senderKycSig = await connection.sendRawTransaction(signedSenderKycTx.serialize());
          await connection.confirmTransaction({
            signature: senderKycSig,
            blockhash: kycBlockhash,
            lastValidBlockHeight: kycLastValid,
          });

          console.log('[useTokenDistribution] Sender KYC registered:', senderKycSig);
        }

        // Recipient KYC
        const [recipientKycPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('kyc'), recipientAddress.toBuffer()],
          TRANSFER_HOOK_PROGRAM_ID
        );

        const recipientKycInfo = await connection.getAccountInfo(recipientKycPDA);
        if (!recipientKycInfo) {
          console.log('[useTokenDistribution] Registering KYC for recipient...');

          // Create discriminator for initialize_kyc_registry
          const encoder = new TextEncoder();
          const data = encoder.encode('global:initialize_kyc_registry');
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const discriminator = new Uint8Array(hashBuffer).slice(0, 8);

          // Args: kyc_completed (bool) + is_active (bool)
          const args = Buffer.alloc(2);
          args.writeUInt8(1, 0); // kyc_completed = true
          args.writeUInt8(1, 1); // is_active = true

          const kycData = Buffer.concat([Buffer.from(discriminator), args]);

          const registerRecipientKycIx = new TransactionInstruction({
            programId: TRANSFER_HOOK_PROGRAM_ID,
            keys: [
              { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // authority
              { pubkey: recipientAddress, isSigner: false, isWritable: false }, // user
              { pubkey: recipientKycPDA, isSigner: false, isWritable: true }, // kyc_registry
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
            ],
            data: kycData,
          });

          const recipientKycTx = new Transaction().add(registerRecipientKycIx);
          recipientKycTx.feePayer = wallet.publicKey;

          const { blockhash: kycBlockhash, lastValidBlockHeight: kycLastValid } = await connection.getLatestBlockhash();
          recipientKycTx.recentBlockhash = kycBlockhash;

          const signedRecipientKycTx = await wallet.signTransaction(recipientKycTx);
          const recipientKycSig = await connection.sendRawTransaction(signedRecipientKycTx.serialize());
          await connection.confirmTransaction({
            signature: recipientKycSig,
            blockhash: kycBlockhash,
            lastValidBlockHeight: kycLastValid,
          });

          console.log('[useTokenDistribution] Recipient KYC registered:', recipientKycSig);
        }

        // 6. Check if destination ATA exists
        let destinationAccountExists = true;
        try {
          await getAccount(connection, destinationATA, 'confirmed', TOKEN_2022_PROGRAM_ID);
        } catch (error) {
          destinationAccountExists = false;
          console.log('Destination ATA does not exist, will be created');
        }

        // 7. CRITICAL: Create destination ATA FIRST (separate transaction)
        // This is necessary because resolveExtraAccountMeta needs to read data from destination ATA
        if (!destinationAccountExists) {
          const createAtaTx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              destinationATA,
              recipientAddress,
              tokenMint,
              TOKEN_2022_PROGRAM_ID
            )
          );
          createAtaTx.feePayer = wallet.publicKey;

          const { blockhash: ataBlockhash, lastValidBlockHeight: ataLastValid } = await connection.getLatestBlockhash();
          createAtaTx.recentBlockhash = ataBlockhash;

          const signedAtaTx = await wallet.signTransaction(createAtaTx);
          const ataSig = await connection.sendRawTransaction(signedAtaTx.serialize());
          await connection.confirmTransaction({
            signature: ataSig,
            blockhash: ataBlockhash,
            lastValidBlockHeight: ataLastValid,
          });

          console.log('[useTokenDistribution] Destination ATA created:', ataSig);
        }

        // 8. Build transfer transaction
        // Create simple base instruction - Token-2022 resolves Transfer Hook automatically
        const transferInstruction = createTransferCheckedInstruction(
          sourceATA,
          tokenMint,
          destinationATA,
          wallet.publicKey,
          amountWithDecimals,
          mintInfo.decimals,
          [], // multisigners
          TOKEN_2022_PROGRAM_ID
        );

        console.log('[useTokenDistribution] Transfer instruction created with', transferInstruction.keys.length, 'base accounts');

        // Manually resolve Transfer Hook extra accounts
        try {
          console.log('[useTokenDistribution] Resolving Transfer Hook extra accounts...');

          // Get transfer hook from mint info (not just the address)
          const transferHook = getTransferHook(mintInfo);

          if (transferHook) {
            console.log('[useTokenDistribution] Transfer Hook found:', transferHook.programId.toBase58());

            // Get ExtraAccountMetaList address
            const extraAccountMetaAddress = getExtraAccountMetaAddress(tokenMint, transferHook.programId);
            console.log('[useTokenDistribution] ExtraAccountMetaList PDA:', extraAccountMetaAddress.toBase58());

            // Fetch the account data
            let accountInfo = await connection.getAccountInfo(extraAccountMetaAddress);
            if (!accountInfo) {
              console.log('[useTokenDistribution] ExtraAccountMetaList not initialized, initializing now...');

              // Auto-initialize the ExtraAccountMetaList
              // This is needed for legacy tokens created before auto-initialization was added

              // Create Anchor discriminator using Web Crypto API (browser-compatible)
              const encoder = new TextEncoder();
              const data = encoder.encode('global:initialize_extra_account_meta_list');
              const hashBuffer = await crypto.subtle.digest('SHA-256', data);
              const discriminator = new Uint8Array(hashBuffer).slice(0, 8);

              const initIx = new TransactionInstruction({
                programId: transferHook.programId,
                keys: [
                  { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                  { pubkey: tokenMint, isSigner: false, isWritable: false },
                  { pubkey: extraAccountMetaAddress, isSigner: false, isWritable: true },
                  { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                data: Buffer.from(discriminator),
              });

              const initTx = new Transaction().add(initIx);
              initTx.feePayer = wallet.publicKey;

              const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
              initTx.recentBlockhash = blockhash;

              const signedInitTx = await wallet.signTransaction(initTx);
              const initSig = await connection.sendRawTransaction(signedInitTx.serialize());
              await connection.confirmTransaction({ signature: initSig, blockhash, lastValidBlockHeight });

              console.log('[useTokenDistribution] ExtraAccountMetaList initialized!', initSig);

              // Fetch the account again
              accountInfo = await connection.getAccountInfo(extraAccountMetaAddress);
              if (!accountInfo) {
                throw new Error('Failed to initialize ExtraAccountMetaList');
              }
            }

            console.log('[useTokenDistribution] ExtraAccountMetaList account found, size:', accountInfo.data.length);

            // CRITICAL: Add Transfer Hook program account (required for CPI)
            transferInstruction.keys.push({
              pubkey: transferHook.programId,
              isSigner: false,
              isWritable: false,
            });
            console.log('[useTokenDistribution] Added Transfer Hook program account');

            // CRITICAL: Add ExtraAccountMetaList account (required for account resolution)
            transferInstruction.keys.push({
              pubkey: extraAccountMetaAddress,
              isSigner: false,
              isWritable: false,
            });
            console.log('[useTokenDistribution] Added ExtraAccountMetaList account');

            // Parse extra account metas from account data
            const extraAccountMetas = getExtraAccountMetas(accountInfo);

            console.log('[useTokenDistribution] Found', extraAccountMetas.length, 'extra account metas');

            // Resolve and add each extra account
            for (const extraAccountMeta of extraAccountMetas) {
              const accountMeta = await resolveExtraAccountMeta(
                connection,
                extraAccountMeta,
                transferInstruction.keys,
                Buffer.alloc(0), // instruction data (not needed for our case)
                transferHook.programId
              );
              transferInstruction.keys.push(accountMeta);
              console.log('[useTokenDistribution] Added extra account:', accountMeta.pubkey.toBase58());
            }

            console.log('[useTokenDistribution] Transfer instruction now has', transferInstruction.keys.length, 'accounts total');
          } else {
            console.log('[useTokenDistribution] No Transfer Hook found on mint');
          }
        } catch (extraAccountsError: any) {
          console.error('[useTokenDistribution] Failed to resolve extra accounts:', extraAccountsError);
          throw new Error(`Error resolving Transfer Hook accounts: ${extraAccountsError.message}`);
        }

        // 9. Create and send transfer transaction
        const transaction = new Transaction().add(transferInstruction);
        transaction.feePayer = wallet.publicKey;

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        // Debug: log transaction details
        console.log('[useTokenDistribution] Transaction details:', {
          feePayer: transaction.feePayer?.toBase58(),
          blockhash,
          numInstructions: transaction.instructions.length,
          instructions: transaction.instructions.map((ix, idx) => ({
            index: idx,
            programId: ix.programId?.toBase58() || 'undefined',
            keys: ix.keys.length,
            data: ix.data.length,
          })),
        });

        toast.info('Validating KYC and processing transfer...');

        let signedTransaction;
        try {
          signedTransaction = await wallet.signTransaction(transaction);
          console.log('[useTokenDistribution] Transaction signed successfully');
        } catch (signError: any) {
          console.error('[useTokenDistribution] Wallet sign error:', signError);
          throw new Error(`Error signing transaction: ${signError.message}`);
        }

        console.log('[useTokenDistribution] Sending transaction with Transfer Hook validation');

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false, // Enable preflight to get detailed errors
          maxRetries: 3,
        });

        console.log('[useTokenDistribution] Transaction sent:', signature);
        console.log('[useTokenDistribution] Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          console.error('[useTokenDistribution] Transaction failed:', confirmation.value.err);

          // Try to fetch logs
          try {
            const txDetails = await connection.getTransaction(signature, {
              maxSupportedTransactionVersion: 0,
            });
            if (txDetails?.meta?.logMessages) {
              console.error('[useTokenDistribution] Transaction logs:', txDetails.meta.logMessages);
            }
          } catch (logErr) {
            console.warn('[useTokenDistribution] Could not fetch transaction logs');
          }

          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log('Distribution successful:', {
          signature,
          amount,
          recipient: recipientAddress.toBase58(),
        });

        return {
          success: true,
          signature,
        };
      } catch (error: any) {
        console.error('Distribution error:', error);

        // Detect specific Transfer Hook errors
        let errorMessage = error.message;

        if (
          error.message?.includes('0x1') || // Custom program error
          error.message?.includes('custom program error') ||
          error.logs?.some((log: string) => log.includes('Transfer Hook'))
        ) {
          errorMessage =
            'Recipient does not have valid KYC. Transfer Hook blocked the transaction on-chain.';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [connection, wallet]
  );

  /**
   * Check if an address has an ATA for the token
   */
  const checkTokenAccount = useCallback(
    async (tokenMint: PublicKey, owner: PublicKey): Promise<boolean> => {
      try {
        const ata = getAssociatedTokenAddressSync(
          tokenMint,
          owner,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        await getAccount(connection, ata, 'confirmed', TOKEN_2022_PROGRAM_ID);
        return true;
      } catch {
        return false;
      }
    },
    [connection]
  );

  /**
   * Fetch token balance of an address
   */
  const getTokenBalance = useCallback(
    async (tokenMint: PublicKey, owner: PublicKey): Promise<number> => {
      try {
        const ata = getAssociatedTokenAddressSync(
          tokenMint,
          owner,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const accountInfo = await getAccount(
          connection,
          ata,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );

        const mintInfo = await getMint(
          connection,
          tokenMint,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );

        return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
      } catch {
        return 0;
      }
    },
    [connection]
  );

  return {
    distributeTokens,
    checkTokenAccount,
    getTokenBalance,
  };
}
