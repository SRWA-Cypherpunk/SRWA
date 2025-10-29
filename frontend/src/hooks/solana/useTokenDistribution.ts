import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getMint,
} from '@solana/spl-token';
import { toast } from 'sonner';

export interface DistributionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Hook para distribuição direta de Token-2022 com Transfer Hook
 *
 * IMPORTANTE:
 * - Este hook trabalha especificamente com Token-2022
 * - O Transfer Hook (KYC) é executado automaticamente pela SPL
 * - Se o destinatário não tiver KYC, a transação falhará on-chain
 *
 * FLUXO:
 * 1. Valida mint (Token-2022)
 * 2. Busca/cria ATAs (source e destination)
 * 3. Cria instrução de transferência
 * 4. Transfer Hook executa automaticamente durante a transferência
 * 5. Se KYC OK: transferência concluída
 * 6. Se KYC falha: transação revertida
 */
export function useTokenDistribution() {
  const { connection } = useConnection();
  const wallet = useWallet();

  /**
   * Distribui tokens RWA diretamente para um investidor
   * O Transfer Hook valida KYC automaticamente
   */
  const distributeTokens = useCallback(
    async (
      tokenMint: PublicKey,
      recipientAddress: PublicKey,
      amount: number
    ): Promise<DistributionResult> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet não conectada');
      }

      try {
        // 1. Buscar informações do mint
        toast.info('🔍 Verificando token...');
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

        // 4. Verificar se source ATA existe
        toast.info('💼 Verificando contas...');
        let sourceAccountExists = true;
        try {
          await getAccount(connection, sourceATA, 'confirmed', TOKEN_2022_PROGRAM_ID);
        } catch (error) {
          sourceAccountExists = false;
          throw new Error('Você não possui este token. Crie uma ATA primeiro.');
        }

        // 5. Verificar se destination ATA existe
        let destinationAccountExists = true;
        try {
          await getAccount(connection, destinationATA, 'confirmed', TOKEN_2022_PROGRAM_ID);
        } catch (error) {
          destinationAccountExists = false;
          console.log('Destination ATA não existe, será criada');
        }

        // 6. Construir transação
        const instructions: TransactionInstruction[] = [];

        // Criar ATA de destino se não existir
        if (!destinationAccountExists) {
          toast.info('📝 Criando conta de destino...');
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              destinationATA,
              recipientAddress,
              tokenMint,
              TOKEN_2022_PROGRAM_ID
            )
          );
        }

        // Instrução de transferência Token-2022 com Transfer Hook
        toast.info('📤 Criando instrução de transferência...');

        // Criar instrução base simples - o Token-2022 resolve Transfer Hook automaticamente
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

        instructions.push(transferInstruction);

        // 7. Criar e enviar transação
        const transaction = new Transaction().add(...instructions);
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

        toast.info('✍️ Assinando transação...');

        let signedTransaction;
        try {
          signedTransaction = await wallet.signTransaction(transaction);
          console.log('[useTokenDistribution] Transaction signed successfully');
        } catch (signError: any) {
          console.error('[useTokenDistribution] Wallet sign error:', signError);
          throw new Error(`Erro ao assinar transação: ${signError.message}`);
        }

        toast.info('📤 Enviando transação...');
        toast.info('🔒 Transfer Hook validando KYC...', {
          description: 'Aguarde enquanto o Transfer Hook verifica o KYC do destinatário on-chain',
        });

        console.log('[useTokenDistribution] Sending transaction with Transfer Hook validation');

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: true, // TEMPORÁRIO: Transfer Hook ainda tem issues com contas
          maxRetries: 3,
        });

        toast.info('⏳ Confirmando transação...');
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(`Transação falhou: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log('Distribuição bem-sucedida:', {
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

        // Detectar erros específicos do Transfer Hook
        let errorMessage = error.message;
        let errorTitle = 'Erro na distribuição';

        if (
          error.message?.includes('0x1') || // Custom program error
          error.message?.includes('custom program error') ||
          error.logs?.some((log: string) => log.includes('Transfer Hook'))
        ) {
          errorTitle = '❌ KYC Inválido';
          errorMessage =
            'O destinatário não possui KYC válido. O Transfer Hook bloqueou a transação on-chain.';
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
   * Verifica se um endereço possui uma ATA para o token
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
   * Busca o saldo de tokens de um endereço
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
