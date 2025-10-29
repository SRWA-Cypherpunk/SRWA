import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WalletProvider } from './wallet/WalletContext';
import { ProgramProvider } from './ProgramContext';

/**
 * CombinedProvider - Aggregates all context providers
 *
 * This pattern follows the agarIoCryptoStacksChain architecture
 * for cleaner App.tsx and easier context management.
 *
 * All global context providers should be added here.
 */

interface CombinedProviderProps {
  children: ReactNode;
}

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,        // 2 minutes (mais agressivo)
      gcTime: 1000 * 60 * 10,          // 10 minutes cache (mantém dados em cache)
      retry: 3,                         // Mais tentativas em caso de falha
      refetchOnWindowFocus: true,       // Re-fetch ao voltar para aba
      refetchOnReconnect: true,         // Re-fetch ao reconectar internet
      refetchOnMount: 'always',         // Sempre buscar ao montar (mas usa cache se disponível)
    },
  },
});

export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <ProgramProvider>
            {children}
          </ProgramProvider>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
