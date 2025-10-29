import { useCallback, useEffect, useState } from 'react';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@/contexts/wallet/WalletContext';

export interface WalletTokenBalance {
  accountAddress: string;
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface UseWalletTokenBalancesOptions {
  includeZeroBalances?: boolean;
}

type ParsedSplTokenAmount = {
  amount?: string;
  decimals?: number;
  uiAmount?: number | null;
  uiAmountString?: string;
};

type ParsedSplTokenAccount = {
  parsed?: {
    info?: {
      mint?: string;
      tokenAmount?: ParsedSplTokenAmount;
    };
  };
};

export function useWalletTokenBalances(options: UseWalletTokenBalancesOptions = {}) {
  const { includeZeroBalances = false } = options;
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [tokens, setTokens] = useState<WalletTokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch tokens from both Token Program and Token-2022 Program
      const [legacyResponse, token2022Response] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);

      // Combine both responses
      const allAccounts = [...legacyResponse.value, ...token2022Response.value];

      const balances: WalletTokenBalance[] = allAccounts
        .map(({ pubkey, account }) => {
          const parsed = account.data as ParsedSplTokenAccount;
          const info = parsed.parsed?.info;
          const tokenAmount = info?.tokenAmount;

          const decimals = Number(tokenAmount?.decimals ?? 0);
          const uiAmountString =
            tokenAmount?.uiAmountString ??
            (tokenAmount?.amount
              ? (Number(tokenAmount.amount) / Math.pow(10, decimals)).toString()
              : '0');

          const uiAmount =
            typeof tokenAmount?.uiAmount === 'number'
              ? tokenAmount.uiAmount
              : parseFloat(uiAmountString);

          return {
            accountAddress: pubkey.toBase58(),
            mint: info?.mint ?? '',
            amount: tokenAmount?.amount ?? '0',
            decimals,
            uiAmount: Number.isFinite(uiAmount) ? uiAmount : 0,
            uiAmountString,
          };
        })
        .filter((token) => includeZeroBalances || token.uiAmount > 0);

      console.log('[useWalletTokenBalances] Found tokens:', {
        legacy: legacyResponse.value.length,
        token2022: token2022Response.value.length,
        total: balances.length,
      });

      setTokens(balances);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wallet tokens';
      console.error('[useWalletTokenBalances] Failed to fetch tokens:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [connection, includeZeroBalances, publicKey]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    tokens,
    loading,
    error,
    refresh: fetchBalances,
  };
}

export default useWalletTokenBalances;
