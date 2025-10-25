export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

export type SolanaConfig = {
  network: SolanaNetwork;
  rpcUrl: string;
  pythPriceFeed: string;
  solendMarkets: string;
  jupiterRouter: string;
  appName: string;
  defaultSlippageBps: number;
};

const env = import.meta.env as unknown as Record<string, string | undefined>;

export function loadSolanaConfig(): SolanaConfig {
  return {
    network: (env.VITE_SOLANA_NETWORK as SolanaNetwork) ?? 'devnet',
    rpcUrl: env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
    pythPriceFeed: env.VITE_PYTH_PRICE_FEED ?? '',
    solendMarkets: env.VITE_SOLEND_MARKETS ?? '',
    jupiterRouter: env.VITE_JUPITER_ROUTER ?? '',
    appName: env.VITE_APP_NAME ?? 'SRWA Platform',
    defaultSlippageBps: Number(env.VITE_DEFAULT_SLIPPAGE_BPS ?? '50'),
  };
}

// Default configuration
export const SOLANA_CONFIG = loadSolanaConfig();
