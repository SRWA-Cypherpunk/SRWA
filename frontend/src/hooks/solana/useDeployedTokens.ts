import { useState, useEffect, useCallback } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { useProgramsSafe } from '@/contexts/ProgramContext';
import { useConnection } from '@solana/wallet-adapter-react';
import { getMint, TOKEN_2022_PROGRAM_ID, getTransferHook } from '@solana/spl-token';

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
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<DeployedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployedTokens = useCallback(async () => {
    if (!programs?.srwaFactory || !programs?.srwaController) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allRequests = await programs.srwaFactory.account.srwaRequest.all();
      const CORRECT_TRANSFER_HOOK = programs.srwaController.programId;

      console.log('[useDeployedTokens] Correct Transfer Hook:', CORRECT_TRANSFER_HOOK.toBase58());

      // Filter and validate tokens
      const deployedRequests = allRequests.filter((req: any) => req.account.status?.deployed !== undefined);

      const validatedTokens = await Promise.all(
        deployedRequests.map(async (req: any) => {
          try {
            const mintPubkey = req.account.mint;

            // Check if mint has correct Transfer Hook
            const mintInfo = await getMint(connection, mintPubkey, 'confirmed', TOKEN_2022_PROGRAM_ID);
            const transferHook = getTransferHook(mintInfo);

            if (!transferHook || !transferHook.programId) {
              console.warn('[useDeployedTokens] Token has no Transfer Hook:', mintPubkey.toBase58());
              return null; // Skip tokens without Transfer Hook
            }

            if (!transferHook.programId.equals(CORRECT_TRANSFER_HOOK)) {
              console.warn('[useDeployedTokens] Token has WRONG Transfer Hook:', {
                mint: mintPubkey.toBase58(),
                current: transferHook.programId.toBase58(),
                expected: CORRECT_TRANSFER_HOOK.toBase58(),
              });
              return null; // Skip tokens with wrong Transfer Hook
            }

            console.log('[useDeployedTokens] Token VALID:', mintPubkey.toBase58());

            return req;
          } catch (err) {
            console.error('[useDeployedTokens] Error validating token:', req.account.mint.toBase58(), err);
            return null; // Skip tokens that fail validation
          }
        })
      );

      const deployedTokens = validatedTokens
        .filter((req: any) => req !== null) // Remove invalid tokens
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
  }, [programs?.srwaFactory, programs?.srwaController, connection]);

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
