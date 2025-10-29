import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getConfig, MarginfiClient } from '@mrgnlabs/marginfi-client-v2';
import { toast } from 'sonner';

// HARDCODED: wSOL (Wrapped SOL) para testes na devnet
const WSOL_MINT_DEVNET = new PublicKey('So11111111111111111111111111111111111111112');

/**
 * Hook para depositar SOL no MarginFi (pool USD/SOL)
 *
 * Usado pelo admin quando aprova purchase requests:
 * - Admin recebe SOL do investor
 * - Admin deposita SOL no MarginFi para gerar yield
 * - Admin transfere SRWA tokens para investor
 */
export function useMarginFiDeposit() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  /**
   * Deposita SOL no banco MarginFi (wSOL)
   * @param amount Quantidade de SOL a depositar
   * @returns Promise com resultado da operação
   */
  const depositToMarginFi = useCallback(
    async (amount: number): Promise<{ success: boolean; error?: string; signature?: string }> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        return { success: false, error: 'Wallet não conectada' };
      }

      if (amount <= 0) {
        return { success: false, error: 'Valor inválido' };
      }

      try {
        setLoading(true);

        console.log('[useMarginFiDeposit] Initializing MarginFi client...');

        // 1. Initialize MarginFi client
        const config = getConfig('dev'); // devnet
        const client = await MarginfiClient.fetch(config, wallet as any, connection);

        console.log('[useMarginFiDeposit] Client initialized');

        // 2. Get or create MarginFi account for the wallet
        let accounts = await client.getMarginfiAccountsForAuthority(wallet.publicKey);
        let marginfiAccount;

        if (accounts.length === 0) {
          console.log('[useMarginFiDeposit] No account found, creating new one...');
          toast.info('Criando conta MarginFi...');

          marginfiAccount = await client.createMarginfiAccount();
          console.log('[useMarginFiDeposit] Account created:', marginfiAccount.address.toBase58());
        } else {
          marginfiAccount = accounts[0];
          console.log('[useMarginFiDeposit] Using existing account:', marginfiAccount.address.toBase58());
        }

        // 3. Find the wSOL bank
        const banks = Array.from(client.banks.values());
        const solBank = banks.find((bank) => bank.mint.equals(WSOL_MINT_DEVNET));

        if (!solBank) {
          throw new Error('Banco wSOL não encontrado no MarginFi');
        }

        console.log('[useMarginFiDeposit] wSOL Bank found:', solBank.address.toBase58());

        // 4. Deposit SOL to MarginFi
        console.log(`[useMarginFiDeposit] Depositing ${amount} SOL...`);
        console.log('[useMarginFiDeposit] Using account:', marginfiAccount.address.toBase58());
        console.log('[useMarginFiDeposit] Bank:', solBank.address.toBase58());

        toast.info(`Depositando ${amount.toFixed(4)} SOL no MarginFi...`);

        let signature;
        try {
          signature = await marginfiAccount.deposit(amount, solBank.address);
        } catch (depositError: any) {
          console.error('[useMarginFiDeposit] Deposit transaction error:', depositError);

          // Se for erro "AlreadyProcessed", pode ser que a transação já foi enviada
          // Vamos tentar pegar a signature do erro
          if (depositError.message?.includes('AlreadyProcessed')) {
            throw new Error('Esta transação já foi processada. Recarregue a página e tente novamente.');
          }

          throw depositError;
        }

        console.log('[useMarginFiDeposit] Deposit successful, signature:', signature);

        toast.success(`✅ ${amount.toFixed(4)} SOL depositado no MarginFi!`, {
          description: 'O SOL está agora gerando yield no pool USD/SOL',
        });

        return { success: true, signature };
      } catch (error: any) {
        console.error('[useMarginFiDeposit] Error:', error);

        let errorMsg = 'Erro ao depositar no MarginFi';

        if (error.message?.includes('User rejected')) {
          errorMsg = 'Transação cancelada pelo usuário';
        } else if (error.message?.includes('insufficient')) {
          errorMsg = 'Saldo insuficiente na wallet';
        } else if (error.message) {
          errorMsg = error.message;
        }

        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection]
  );

  return {
    depositToMarginFi,
    loading,
  };
}
