import { useCallback, useMemo } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useProgramsSafe } from '@/contexts/ProgramContext';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface RaydiumPoolAccount {
  publicKey: PublicKey;
  admin: PublicKey;
  poolId: PublicKey;
  tokenMint: PublicKey;
  baseMint: PublicKey;
  createdAt: number;
  isActive: boolean;
}

export function useRaydiumPools() {
  const { programs } = useProgramsSafe();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    const programId = programs?.yieldAdapter?.programId?.toBase58?.() ?? 'unknown';
    return ['raydiumPools', programId];
  }, [programs?.yieldAdapter]);

  const fetchPools = useCallback(async (): Promise<RaydiumPoolAccount[]> => {
    if (!programs?.yieldAdapter) {
      return [];
    }

    try {
      const allPools = await programs.yieldAdapter.account.raydiumPoolAccount.all();

      console.log('[useRaydiumPools] Fetched pools:', allPools.length);

      const mappedPools: RaydiumPoolAccount[] = allPools.map((pool: any) => ({
        publicKey: pool.publicKey,
        admin: pool.account.admin,
        poolId: pool.account.poolId,
        tokenMint: pool.account.tokenMint,
        baseMint: pool.account.baseMint,
        createdAt: pool.account.createdAt?.toNumber?.() ?? 0,
        isActive: pool.account.isActive,
      }));

      const activePools = mappedPools.filter(pool => pool.isActive);
      console.log('[useRaydiumPools] Active pools:', activePools.length);

      // Log detailed info for each pool
      activePools.forEach((pool, index) => {
        console.log(`[useRaydiumPools] Pool ${index + 1}:`, {
          poolId: pool.poolId.toBase58(),
          tokenMint: pool.tokenMint.toBase58(),
          baseMint: pool.baseMint.toBase58(),
          admin: pool.admin.toBase58(),
          isActive: pool.isActive,
        });
      });

      return activePools;
    } catch (err: any) {
      console.error('[useRaydiumPools] Failed to fetch pools:', err);
      throw err;
    }
  }, [programs?.yieldAdapter]);

  const {
    data: pools = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<RaydiumPoolAccount[], Error>({
    queryKey,
    queryFn: fetchPools,
    enabled: !!programs?.yieldAdapter,
    staleTime: 0,
    retry: 1,
  });

  const registerPool = useCallback(
    async (poolId: PublicKey, tokenMint: PublicKey, baseMint: PublicKey) => {
      if (!programs?.yieldAdapter || !publicKey) {
        throw new Error('Wallet not connected or program not loaded');
      }

      try {
        // Derive PDA for the pool account
        const [poolAccountPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('raydium_pool'), tokenMint.toBuffer()],
          programs.yieldAdapter.programId
        );

        console.log('[useRaydiumPools] Registering pool:', {
          poolId: poolId.toBase58(),
          tokenMint: tokenMint.toBase58(),
          baseMint: baseMint.toBase58(),
          poolAccountPda: poolAccountPda.toBase58(),
        });

        const tx = await programs.yieldAdapter.methods
          .registerRaydiumPool(poolId, baseMint)
          .accounts({
            poolAccount: poolAccountPda,
            tokenMint: tokenMint,
            admin: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('[useRaydiumPools] Pool registered! Tx:', tx);

        // Refresh pools list
        await queryClient.invalidateQueries({ queryKey });

        return { signature: tx, poolAccountPda };
      } catch (err: any) {
        console.error('[useRaydiumPools] Failed to register pool:', err);
        throw err;
      }
    },
    [programs?.yieldAdapter, publicKey, queryClient, queryKey]
  );

  const updatePoolStatus = useCallback(
    async (tokenMint: PublicKey, isActive: boolean) => {
      if (!programs?.yieldAdapter || !publicKey) {
        throw new Error('Wallet not connected or program not loaded');
      }

      try {
        // Derive PDA for the pool account
        const [poolAccountPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('raydium_pool'), tokenMint.toBuffer()],
          programs.yieldAdapter.programId
        );

        const tx = await programs.yieldAdapter.methods
          .updatePoolStatus(isActive)
          .accounts({
            poolAccount: poolAccountPda,
            admin: publicKey,
          })
          .rpc();

        console.log('[useRaydiumPools] Pool status updated! Tx:', tx);

        // Refresh pools list
        await queryClient.invalidateQueries({ queryKey });

        return tx;
      } catch (err: any) {
        console.error('[useRaydiumPools] Failed to update pool status:', err);
        throw err;
      }
    },
    [programs?.yieldAdapter, publicKey, queryClient, queryKey]
  );

  const deactivatePool = useCallback(
    async (tokenMint: PublicKey) => {
      console.log('[useRaydiumPools] Deactivating pool for token:', tokenMint.toBase58());
      return await updatePoolStatus(tokenMint, false);
    },
    [updatePoolStatus]
  );

  return {
    pools,
    loading: isLoading || (isFetching && pools.length === 0),
    error: error?.message ?? null,
    refresh: refetch,
    registerPool,
    updatePoolStatus,
    deactivatePool,
  };
}
