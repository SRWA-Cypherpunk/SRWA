import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useProgramsSafe } from '@/contexts/ProgramContext';

/**
 * usePrefetchDashboard
 *
 * Hook para fazer prefetch de dados importantes do dashboard.
 * Deve ser usado em páginas de entrada (Index.tsx) para carregar
 * dados antes do usuário navegar para o dashboard.
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const { programs } = useProgramsSafe();

  useEffect(() => {
    // Prefetch Raydium pools assim que programs estiverem disponíveis
    if (programs?.yieldAdapter) {
      const queryKey = ['raydiumPools', programs.yieldAdapter.programId.toString()];

      console.log('[usePrefetchDashboard] Prefetching Raydium pools...');

      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          try {
            const allPools = await programs.yieldAdapter!.account.raydiumPoolAccount.all();

            const mappedPools = allPools.map((pool: any) => ({
              publicKey: pool.publicKey,
              admin: pool.account.admin,
              poolId: pool.account.poolId,
              tokenMint: pool.account.tokenMint,
              baseMint: pool.account.baseMint,
              createdAt: pool.account.createdAt?.toNumber?.() ?? 0,
              isActive: pool.account.isActive,
            }));

            const activePools = mappedPools.filter((pool: any) => pool.isActive);
            console.log('[usePrefetchDashboard] Prefetched', activePools.length, 'active pools');
            return activePools;
          } catch (err) {
            console.error('[usePrefetchDashboard] Failed to prefetch pools:', err);
            return [];
          }
        },
        staleTime: 1000 * 60 * 1, // 1 minute
      });
    }

    // Prefetch deployed tokens
    if (programs?.srwaFactory) {
      const queryKey = ['deployedTokens'];

      console.log('[usePrefetchDashboard] Prefetching deployed tokens...');

      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          try {
            const accounts = await programs.srwaFactory!.account.token.all();
            console.log('[usePrefetchDashboard] Prefetched', accounts.length, 'deployed tokens');
            return accounts;
          } catch (err) {
            console.error('[usePrefetchDashboard] Failed to prefetch tokens:', err);
            return [];
          }
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    }
  }, [programs, queryClient]);
}
