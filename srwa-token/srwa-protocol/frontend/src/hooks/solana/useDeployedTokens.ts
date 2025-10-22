import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgramsSafe } from '@/contexts/ProgramContext';

export interface DeployedToken {
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  issuer: PublicKey;
  tvl: number;
  supplyAPY: number;
  config: any;
  offering: any;
  yieldConfig: any;
  createdAt: number;
}

export function useDeployedTokens() {
  const { programs } = useProgramsSafe();
  const [tokens, setTokens] = useState<DeployedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployedTokens = useCallback(async () => {
    if (!programs?.srwaFactory) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allRequests = await programs.srwaFactory.account.srwaRequest.all();

      const deployedTokens = allRequests
        .filter((req: any) => req.account.status?.deployed !== undefined)
        .map((req: any) => {
          const yieldProtocol = req.account.yieldConfig?.protocol?.marginfi !== undefined
            ? 'marginfi'
            : 'solend';
          const targetApy = Number(req.account.yieldConfig?.targetApyBps ?? 0) / 100;

          return {
            mint: req.account.mint,
            name: req.account.name,
            symbol: req.account.symbol,
            decimals: req.account.decimals,
            issuer: req.account.issuer,
            tvl: req.account.offering?.target?.hardCap?.toNumber?.() ?? 0,
            supplyAPY: targetApy,
            config: req.account.config,
            offering: req.account.offering,
            yieldConfig: {
              protocol: yieldProtocol,
              targetApy: targetApy,
            },
            createdAt: req.account.createdAt?.toNumber?.() ?? Date.now() / 1000,
          };
        });

      setTokens(deployedTokens);
    } catch (err: any) {
      console.error('Failed to fetch deployed tokens:', err);
      setError(err.message ?? 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  }, [programs?.srwaFactory]);

  useEffect(() => {
    fetchDeployedTokens();
  }, [fetchDeployedTokens]);

  return {
    tokens,
    loading,
    error,
    refresh: fetchDeployedTokens,
  };
}
