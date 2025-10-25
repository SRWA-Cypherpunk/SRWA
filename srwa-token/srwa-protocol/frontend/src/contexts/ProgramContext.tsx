import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProvider, loadPrograms } from '@/lib/solana/anchor';
import type { Programs } from '@/lib/solana/anchor';

interface ProgramContextType {
  programs: Programs | null;
  loading: boolean;
}

const ProgramContext = createContext<ProgramContextType>({ programs: null, loading: false });

export function ProgramProvider({ children }: { children: ReactNode }) {
  const wallet = useAnchorWallet();
  const [programs, setPrograms] = useState<Programs | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!wallet) {
        setPrograms(null);
        console.log('[ProgramProvider] No wallet, skipping program load');
        return;
      }

      console.log('[ProgramProvider] Loading programs for wallet', wallet.publicKey?.toBase58());
      setLoading(true);
      try {
        const provider = getProvider(wallet);
        console.log('[ProgramProvider] Provider ready', {
          wallet: provider.wallet?.publicKey?.toBase58?.(),
          connection: provider.connection?._rpcEndpoint,
        });
        const loadedPrograms = await loadPrograms(provider);
        console.log('[ProgramProvider] Programs loaded', {
          keys: loadedPrograms ? Object.keys(loadedPrograms) : [],
          hasFactory: !!loadedPrograms?.srwaFactory,
          hasCoder: !!loadedPrograms?.srwaFactory?.coder,
        });
        setPrograms(loadedPrograms);
      } catch (error) {
        console.error('Error loading programs:', error);
        setPrograms(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [wallet]);

  return (
    <ProgramContext.Provider value={{ programs, loading }}>
      {children}
    </ProgramContext.Provider>
  );
}

export function usePrograms() {
  const context = useContext(ProgramContext);
  if (!context.programs) {
    throw new Error('usePrograms must be used within ProgramProvider and wallet must be connected');
  }
  return context.programs;
}

export function useProgramsSafe() {
  const context = useContext(ProgramContext);
  return {
    programs: context.programs || {},
    loading: context.loading,
    hasPrograms: !!context.programs && Object.keys(context.programs).length > 0
  };
}

export function useProgramsOptional() {
  const context = useContext(ProgramContext);
  return context;
}
