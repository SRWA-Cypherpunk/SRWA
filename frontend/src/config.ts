/**
 * Centralized Configuration
 *
 * All environment variables and configuration settings in one place
 * Following agarIoCryptoStacksChain best practices
 */

// ===  Network Configuration ===
export const SOLANA_NETWORK = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as
  | 'devnet'
  | 'testnet'
  | 'mainnet-beta';

export const SOLANA_RPC_ENDPOINTS = {
  devnet: import.meta.env.VITE_SOLANA_RPC_URL_DEVNET || 'https://api.devnet.solana.com',
  testnet: import.meta.env.VITE_SOLANA_RPC_URL_TESTNET || 'https://api.testnet.solana.com',
  'mainnet-beta': import.meta.env.VITE_SOLANA_RPC_URL_MAINNET_BETA || 'https://api.mainnet-beta.solana.com',
};

export const SOLANA_RPC_URL = SOLANA_RPC_ENDPOINTS[SOLANA_NETWORK];

// === Stellar Configuration (for backward compatibility) ===
export const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet';

export const HORIZON_ENDPOINTS = {
  testnet: '/api/horizon-testnet',
  mainnet: '/api/horizon-mainnet',
};

export const HORIZON_URL = HORIZON_ENDPOINTS[STELLAR_NETWORK as keyof typeof HORIZON_ENDPOINTS] || HORIZON_ENDPOINTS.testnet;

// === Application Configuration ===
export const APP_NAME = 'SRWA Platform';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Solana Real-World Asset Platform with on-chain compliance';

// === Feature Flags ===
export const FEATURES = {
  enableKYC: import.meta.env.VITE_ENABLE_KYC === 'true',
  enableCompliance: import.meta.env.VITE_ENABLE_COMPLIANCE === 'true',
  enableLending: import.meta.env.VITE_ENABLE_LENDING === 'true',
  enableMarketplace: import.meta.env.VITE_ENABLE_MARKETPLACE === 'true',
  enableOracle: import.meta.env.VITE_ENABLE_ORACLE === 'true',
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
};

// === API Endpoints ===
export const API_ENDPOINTS = {
  backend: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  pyth: import.meta.env.VITE_PYTH_URL || 'https://hermes.pyth.network',
  defindex: import.meta.env.VITE_DEFINDEX_URL || '',
  jupiter: import.meta.env.VITE_JUPITER_URL || 'https://quote-api.jup.ag/v6',
};

// === Contract Addresses ===
export const CONTRACTS = {
  rwaToken: import.meta.env.VITE_RWA_TOKEN_PROGRAM_ID || '',
  compliance: import.meta.env.VITE_COMPLIANCE_PROGRAM_ID || '',
  lending: import.meta.env.VITE_LENDING_PROGRAM_ID || '',
  tokenFactory: import.meta.env.VITE_TOKEN_FACTORY_PROGRAM_ID || '',
};

// === Development Configuration ===
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// === Transaction Configuration ===
export const TX_CONFIG = {
  confirmationCommitment: 'confirmed' as const,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// === Wallet Configuration ===
export const WALLET_CONFIG = {
  autoConnect: true,
  supportedWallets: ['Phantom', 'Backpack', 'Solflare', 'Ledger', 'Torus'],
};

// === Query Configuration ===
export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 10, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 2,
};

// === UI Configuration ===
export const UI_CONFIG = {
  toastDuration: 5000, // 5 seconds
  modalAnimationDuration: 300, // milliseconds
  debounceDelay: 300, // milliseconds
};

// === Compliance Configuration ===
export const COMPLIANCE_CONFIG = {
  requireKYC: import.meta.env.VITE_REQUIRE_KYC === 'true',
  allowedJurisdictions: (import.meta.env.VITE_ALLOWED_JURISDICTIONS || 'US,EU,UK').split(','),
  restrictedCountries: (import.meta.env.VITE_RESTRICTED_COUNTRIES || '').split(',').filter(Boolean),
};

// === Export all as default for convenience ===
export default {
  SOLANA_NETWORK,
  SOLANA_RPC_URL,
  SOLANA_RPC_ENDPOINTS,
  STELLAR_NETWORK,
  HORIZON_URL,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  FEATURES,
  API_ENDPOINTS,
  CONTRACTS,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  TX_CONFIG,
  WALLET_CONFIG,
  QUERY_CONFIG,
  UI_CONFIG,
  COMPLIANCE_CONFIG,
};
