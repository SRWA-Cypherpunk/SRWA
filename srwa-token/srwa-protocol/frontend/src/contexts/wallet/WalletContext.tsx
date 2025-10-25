import React, { ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';
// Import custom SRWA wallet styles
import '@/styles/features/wallet.css';

/**
 * WalletProvider - Real Solana wallet integration
 *
 * Wraps the application with Solana wallet adapter providers
 * Supports: Phantom, Backpack, Solflare, Torus
 */

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Get network from environment
  const network = (import.meta.env.VITE_SOLANA_NETWORK || 'localnet') as
    | 'devnet'
    | 'testnet'
    | 'mainnet-beta'
    | 'localnet';

  // Get RPC endpoint from environment or fallback to appropriate endpoints
  const endpoint = useMemo(() => {
    // First, try to get from environment
    const envUrl = import.meta.env.VITE_SOLANA_RPC_URL;
    if (envUrl) {
      return envUrl;
    }

    // Try network-specific environment variable
    const envKey = `VITE_SOLANA_RPC_URL_${network.toUpperCase().replace('-', '_')}`;
    const networkEnvUrl = import.meta.env[envKey];
    if (networkEnvUrl) {
      return networkEnvUrl;
    }

    // Default to localnet for development
    if (network === 'localnet' || import.meta.env.DEV) {
      return 'http://127.0.0.1:8899';
    }

    // Fallback to Solana public RPC endpoints for other networks
    return clusterApiUrl(network as 'devnet' | 'testnet' | 'mainnet-beta');
  }, [network]);

  // Configure supported wallets (web wallets only - no hardware wallets)
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // Log connection info
  console.log('[WalletProvider] Configuration:', {
    network,
    endpoint,
    isDev: import.meta.env.DEV,
  });

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

/**
 * useWallet - Custom hook for wallet state
 *
 * Wraps @solana/wallet-adapter-react's useWallet
 * Provides backward compatibility with previous implementation
 */
export function useWallet() {
  const wallet = useSolanaWallet();

  return {
    address: wallet.publicKey?.toBase58() || null,
    connected: wallet.connected,
    connecting: wallet.connecting,
    error: null, // wallet.error is not exposed in the same way
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    publicKey: wallet.publicKey,
    wallet: wallet.wallet,
    wallets: wallet.wallets,
    select: wallet.select,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    signMessage: wallet.signMessage,
  };
}

// Re-export types for convenience
export type { WalletContextState } from '@solana/wallet-adapter-react';
