import { useCallback } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';
import { useProgramsSafe } from '@/contexts/ProgramContext';

export interface PurchaseInput {
  mint: PublicKey;
  issuer: PublicKey;
  adminWallet: PublicKey;
  decimals: number;
  pricePerToken: number; // SOL por token
  quantity: number; // quantidade de tokens SRWA
}

export function useInvestorPurchase() {
  const wallet = useAnchorWallet();
  const walletAdapter = useWallet();
  const { connection } = useConnection();
  const { programs } = useProgramsSafe();

  /**
   * Compra direta de tokens SRWA com SOL (temporário para devnet)
   * Fluxo:
   * 1. Investidor transfere SOL para admin
   * 2. Issuer transfere tokens SRWA para investidor
   */
  const purchaseWithSOL = useCallback(
    async (input: PurchaseInput) => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }
      if (!walletAdapter?.sendTransaction) {
        throw new Error('Wallet adapter not ready');
      }

      const { mint, issuer, adminWallet, decimals, pricePerToken, quantity } = input;

      // Calcular valor total em SOL
      const totalSol = pricePerToken * quantity;
      const lamports = Math.floor(totalSol * LAMPORTS_PER_SOL);

      console.log('[useInvestorPurchase.purchaseWithSOL] Purchase details:', {
        investor: wallet.publicKey.toBase58(),
        mint: mint.toBase58(),
        issuer: issuer.toBase58(),
        admin: adminWallet.toBase58(),
        quantity,
        pricePerToken,
        totalSol,
        lamports,
      });

      const tx = new Transaction();

      // 1. Transferir SOL do investidor para o admin
      const solTransferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: adminWallet,
        lamports,
      });
      tx.add(solTransferIx);

      // 2. Preparar recebimento de tokens SRWA
      const investorAta = await getAssociatedTokenAddress(mint, wallet.publicKey);

      // Verificar se investidor já tem ATA
      let investorAtaExists = false;
      try {
        await getAccount(connection, investorAta);
        investorAtaExists = true;
      } catch (err: any) {
        if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
          investorAtaExists = false;
        } else {
          throw err;
        }
      }

      // Criar ATA do investidor se não existir
      if (!investorAtaExists) {
        const createAtaIx = createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          investorAta, // ata
          wallet.publicKey, // owner
          mint // mint
        );
        tx.add(createAtaIx);
        console.log('[useInvestorPurchase.purchaseWithSOL] Creating investor ATA:', investorAta.toBase58());
      }

      // 3. Transferir tokens SRWA do issuer para o investidor
      const issuerAta = await getAssociatedTokenAddress(mint, issuer);

      // Verificar saldo do issuer
      try {
        const issuerAccount = await getAccount(connection, issuerAta);
        const tokenAmount = BigInt(Math.floor(quantity * 10 ** decimals));

        console.log('[useInvestorPurchase.purchaseWithSOL] Issuer balance:', {
          issuerAta: issuerAta.toBase58(),
          balance: issuerAccount.amount.toString(),
          required: tokenAmount.toString(),
        });

        if (issuerAccount.amount < tokenAmount) {
          throw new Error(
            `Insufficient issuer balance. Required: ${tokenAmount.toString()}, Available: ${issuerAccount.amount.toString()}`
          );
        }

        // IMPORTANTE: O issuer precisa aprovar esta transação ou delegar autoridade
        // Para simplificar no devnet, vamos assumir que o issuer delegou autoridade para o programa
        // OU esta transação precisa ser assinada pelo issuer também

        // Por enquanto, vamos criar a instrução mas ela vai falhar se o issuer não assinar
        // Uma solução seria usar um programa intermediário ou exigir assinatura do issuer

        console.warn('[useInvestorPurchase.purchaseWithSOL] ATENÇÃO: Esta transação requer que o issuer aprove a transferência de tokens.');
        console.warn('[useInvestorPurchase.purchaseWithSOL] Implementação atual: o investidor NÃO pode mover tokens do issuer diretamente.');
        console.warn('[useInvestorPurchase.purchaseWithSOL] Solução: criar um programa que gerencie isso OU issuer precisa fazer a transferência separadamente.');

        // Para o POC na devnet, vamos criar uma mensagem clara
        throw new Error(
          'Compra direta ainda não implementada. O issuer precisa transferir os tokens manualmente após receber o SOL. Em breve implementaremos um sistema de escrow ou aprovação automática.'
        );

      } catch (err: any) {
        if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
          throw new Error('Issuer não possui tokens. Verifique se o token foi mintado corretamente para o issuer.');
        }
        throw err;
      }

      // Enviar apenas a transferência de SOL por enquanto
      // const signature = await walletAdapter.sendTransaction(tx, connection, {
      //   preflightCommitment: 'confirmed',
      // });
      // await connection.confirmTransaction(signature, 'confirmed');

      // return signature;
    },
    [wallet?.publicKey, walletAdapter, connection]
  );

  /**
   * Versão simplificada: apenas transfere SOL para admin
   * Issuer precisa fazer transferência manual dos tokens
   */
  const requestPurchaseWithSOL = useCallback(
    async (input: Omit<PurchaseInput, 'issuer' | 'decimals'>) => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }
      if (!walletAdapter?.sendTransaction) {
        throw new Error('Wallet adapter not ready');
      }

      const { mint, adminWallet, pricePerToken, quantity } = input;

      // Calcular valor total em SOL
      const totalSol = pricePerToken * quantity;
      const lamports = Math.floor(totalSol * LAMPORTS_PER_SOL);

      console.log('[useInvestorPurchase.requestPurchaseWithSOL] Purchase request:', {
        investor: wallet.publicKey.toBase58(),
        mint: mint.toBase58(),
        admin: adminWallet.toBase58(),
        quantity,
        pricePerToken,
        totalSol,
        lamports,
      });

      const tx = new Transaction();

      // Transferir SOL do investidor para o admin
      const solTransferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: adminWallet,
        lamports,
      });
      tx.add(solTransferIx);

      // Enviar transação
      const signature = await walletAdapter.sendTransaction(tx, connection, {
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(signature, 'confirmed');

      console.log('[useInvestorPurchase.requestPurchaseWithSOL] SOL transferred to admin:', {
        signature,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      });

      return signature;
    },
    [wallet?.publicKey, walletAdapter, connection]
  );

  return {
    purchaseWithSOL,
    requestPurchaseWithSOL,
  };
}
