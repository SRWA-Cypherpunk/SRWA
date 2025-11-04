import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Vault, Info } from 'lucide-react';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { useProgramsSafe } from '@/contexts';
import { BN } from '@coral-xyz/anchor';
import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
  getExtraAccountMetaAddress,
  getExtraAccountMetas,
  resolveExtraAccountMeta
} from '@solana/spl-token';

export function TokenEscrowManager() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { programs } = useProgramsSafe();
  const { tokens } = useDeployedTokens();

  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = async () => {
    if (!selectedMint || !depositAmount || !connected || !publicKey || !programs?.purchaseOrder) {
      toast.error('Please select a token, enter amount and connect wallet');
      return;
    }

    try {
      setDepositing(true);

      const amount = parseFloat(depositAmount);

      // Get mint info to get decimals and check for transfer hooks
      const mintInfo = await getMint(connection, selectedMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
      const decimals = mintInfo.decimals;
      const amountInAtomicUnits = Math.floor(amount * Math.pow(10, decimals));

      // Derive escrow authority PDA
      const [escrowAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('token_escrow'), selectedMint.toBuffer()],
        programs.purchaseOrder.programId
      );

      // Get token accounts
      const adminTokenAccount = await getAssociatedTokenAddress(
        selectedMint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const escrowTokenAccount = await getAssociatedTokenAddress(
        selectedMint,
        escrowAuthority,
        true, // allowOwnerOffCurve = true for PDA
        TOKEN_2022_PROGRAM_ID
      );

      console.log('[TokenEscrowManager] Depositing:', {
        mint: selectedMint.toBase58(),
        amount: amountInAtomicUnits,
        escrowAuthority: escrowAuthority.toBase58(),
        adminTokenAccount: adminTokenAccount.toBase58(),
        escrowTokenAccount: escrowTokenAccount.toBase58(),
      });

      // Check if escrow token account exists, create if not
      let accountExists = false;
      try {
        await getAccount(connection, escrowTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        accountExists = true;
        console.log('[TokenEscrowManager] Escrow account already exists');
      } catch (error) {
        console.log('[TokenEscrowManager] Escrow account does not exist, will create');
      }

      // Derive transfer hook accounts (always needed for Token-2022 with hooks)
      console.log('[TokenEscrowManager] Deriving transfer hook accounts');

      // 1. Transfer hook program
      const transferHookProgram = programs.srwaController.programId;

      // 2. Extra account metas PDA
      const [extraAccountMetasPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('extra-account-metas'), selectedMint.toBuffer()],
        programs.srwaController.programId
      );

      // 3. Sender KYC registry (admin)
      const [senderKycRegistry] = PublicKey.findProgramAddressSync(
        [Buffer.from('kyc'), publicKey.toBuffer()],
        programs.srwaController.programId
      );

      // 4. Recipient KYC registry (escrow authority)
      const [recipientKycRegistry] = PublicKey.findProgramAddressSync(
        [Buffer.from('kyc'), escrowAuthority.toBuffer()],
        programs.srwaController.programId
      );

      console.log('[TokenEscrowManager] Transfer hook accounts:', {
        transferHookProgram: transferHookProgram.toBase58(),
        extraAccountMetas: extraAccountMetasPda.toBase58(),
        senderKycRegistry: senderKycRegistry.toBase58(),
        recipientKycRegistry: recipientKycRegistry.toBase58(),
      });

      const tx = programs.purchaseOrder.methods
        .depositTokens(new BN(amountInAtomicUnits))
        .accounts({
          admin: publicKey,
          mint: selectedMint,
          escrowAuthority,
          adminTokenAccount,
          escrowTokenAccount,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .remainingAccounts([
          {
            pubkey: transferHookProgram,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: extraAccountMetasPda,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: senderKycRegistry,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: recipientKycRegistry,
            isSigner: false,
            isWritable: false,
          },
        ]);

      // If account doesn't exist, add instruction to create it
      if (!accountExists) {
        const createIx = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          escrowTokenAccount, // ata
          escrowAuthority, // owner
          selectedMint, // mint
          TOKEN_2022_PROGRAM_ID
        );
        tx.preInstructions([createIx]);
      }

      const signature = await tx.rpc();

      toast.success('✅ Tokens deposited to escrow!', {
        description: `${amount} tokens now available for instant purchase`,
        action: {
          label: 'View TX',
          onClick: () => window.open(
            `https://explorer.solana.com/tx/${signature}?cluster=localnet`,
            '_blank'
          ),
        },
      });

      setDepositAmount('');

    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error('Failed to deposit tokens', {
        description: error.message,
      });
    } finally {
      setDepositing(false);
    }
  };

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vault className="h-5 w-5" />
          Token Escrow Manager
        </CardTitle>
        <CardDescription>
          Deposit tokens to escrow for instant automated purchases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tokens deposited here will be sold automatically when investors buy. The escrow is controlled by a PDA.
          </AlertDescription>
        </Alert>

        <div>
          <Label>Select Token</Label>
          <select
            className="w-full mt-2 p-2 bg-muted rounded border border-border"
            value={selectedMint?.toBase58() || ''}
            onChange={(e) => setSelectedMint(e.target.value ? new PublicKey(e.target.value) : null)}
          >
            <option value="">-- Select a token --</option>
            {tokens.map((token) => (
              <option key={token.mint.toBase58()} value={token.mint.toBase58()}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {selectedMint && (
          <div className="space-y-3">
            <div>
              <Label>Amount to Deposit</Label>
              <Input
                type="number"
                step="1"
                placeholder="Enter token amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleDeposit}
              disabled={!depositAmount || depositing}
              className="w-full"
            >
              {depositing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Depositing...
                </>
              ) : (
                <>
                  <Vault className="mr-2 h-4 w-4" />
                  Deposit to Escrow
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
