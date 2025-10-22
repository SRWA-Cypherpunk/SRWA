/**
 * Application Configuration Constants
 * Central repository for app-wide configuration values
 */

/**
 * APPLICATION INFO
 */
export const APP_INFO = {
  name: 'SRWA Platform',
  fullName: 'Solana Real-World Asset Platform',
  version: '1.0.0',
  description: 'Institutional-grade DeFi for Real-World Assets on Solana with on-chain compliance, permissioned markets, and hybrid oracles.',
  author: 'SRWA Platform',
  website: 'https://srwa.platform',
  twitter: '@srwa_platform',
} as const;

/**
 * SOCIAL LINKS
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/srwa_platform',
  github: 'https://github.com/srwa',
  discord: 'https://discord.gg/srwa',
  telegram: 'https://t.me/srwa',
  medium: 'https://medium.com/@srwa',
} as const;

/**
 * PARTNERS & INTEGRATIONS
 */
export const PARTNERS = [
  {
    name: 'Pyth Network',
    logo: '/partners/pyth-network.webp',
    website: 'https://pyth.network',
  },
  {
    name: 'Solend',
    logo: '/partners/solend-logo.webp',
    website: 'https://solend.fi',
  },
  {
    name: 'MarginFi',
    logo: '/partners/marginfi-logo.webp',
    website: 'https://marginfi.com',
  },
  {
    name: 'Solana Foundation',
    logo: '/partners/solana-foundation.svg',
    website: 'https://solana.org',
  },
  {
    name: 'Solana Superteam',
    logo: '/partners/superteam-logo.png',
    website: 'https://superteam.fun',
  },
  {
    name: 'Inteli',
    logo: '/partners/inteli-logo.png',
    website: 'https://inteli.edu.br',
  },
] as const;

/**
 * POOL CLASSES
 */
export const POOL_CLASSES = {
  TBILL: {
    name: 'T-Bill',
    description: 'U.S. Treasury Bills',
    icon: 'Shield',
    riskLevel: 'Low',
  },
  RECEIVABLES: {
    name: 'Receivables',
    description: 'Trade Receivables',
    icon: 'Activity',
    riskLevel: 'Medium',
  },
  CRE: {
    name: 'Commercial Real Estate',
    description: 'Commercial Real Estate',
    icon: 'DollarSign',
    riskLevel: 'Medium',
  },
} as const;

/**
 * RISK LEVELS
 */
export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EXPERIMENTAL: 'Experimental',
} as const;

/**
 * POOL STATUS
 */
export const POOL_STATUS = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  DEGRADED: 'Degraded',
} as const;

/**
 * POOL TYPES
 */
export const POOL_TYPES = {
  OFFICIAL: 'official',
  COMMUNITY: 'community',
  SRWA: 'srwa',
} as const;

/**
 * DATA FRESHNESS
 */
export const DATA_FRESHNESS = {
  FRESH: 'Fresh',
  STALE: 'Stale',
  OUTDATED: 'Outdated',
} as const;

/**
 * APY TRENDS
 */
export const APY_TRENDS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
} as const;

/**
 * TRANSACTION TYPES
 */
export const TRANSACTION_TYPES = {
  SUPPLY: 'supply',
  WITHDRAW: 'withdraw',
  BORROW: 'borrow',
  REPAY: 'repay',
} as const;

/**
 * WALLET STATUS
 */
export const WALLET_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  ERROR: 'error',
} as const;

/**
 * LOCAL STORAGE KEYS
 */
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'srwa_wallet_address',
  THEME: 'srwa_theme',
  LANGUAGE: 'srwa_language',
  USER_PREFERENCES: 'srwa_user_preferences',
  ACCEPTED_TERMS: 'srwa_accepted_terms',
  KYC_STATUS: 'srwa_kyc_status',
} as const;

/**
 * API ENDPOINTS
 */
export const API_ENDPOINTS = {
  POOLS: '/api/pools',
  MARKETS: '/api/markets',
  USER_POSITIONS: '/api/user/positions',
  TRANSACTIONS: '/api/transactions',
  PRICES: '/api/prices',
  ANALYTICS: '/api/analytics',
} as const;

/**
 * QUERY CACHE TIMES (in milliseconds)
 */
export const CACHE_TIMES = {
  FAST: 30000,      // 30 seconds
  NORMAL: 60000,    // 1 minute
  SLOW: 120000,     // 2 minutes
  SLOW_5MIN: 300000, // 5 minutes
  STATIC: Infinity,  // Never refetch
} as const;

/**
 * PAGINATION
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

/**
 * LIMITS
 */
export const LIMITS = {
  MAX_POOL_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TAG_LENGTH: 20,
  MAX_TAGS: 5,
  MIN_SUPPLY_AMOUNT: 100,
  MIN_BORROW_AMOUNT: 100,
  DEFAULT_SLIPPAGE_BPS: 50,
  MAX_SLIPPAGE_BPS: 1000,
} as const;

/**
 * FORMATS
 */
export const FORMATS = {
  DATE: 'MMM dd, yyyy',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm:ss',
  PERCENTAGE: '0.00',
  CURRENCY: '$0,0.00',
  LARGE_CURRENCY: '$0.0a', // $1.2M, $3.4K
} as const;

/**
 * HEALTH FACTOR THRESHOLDS
 */
export const HEALTH_FACTOR = {
  HEALTHY: 2.0,
  MODERATE_RISK: 1.5,
  HIGH_RISK: 1.2,
  LIQUIDATION: 1.0,
} as const;

/**
 * UTILIZATION RATE THRESHOLDS
 */
export const UTILIZATION_RATE = {
  LOW: 0.5,
  MODERATE: 0.8,
  HIGH: 0.95,
} as const;

/**
 * ANIMATION CONFIG
 */
export const ANIMATION_CONFIG = {
  REDUCE_MOTION_THRESHOLD: 'prefers-reduced-motion',
  DEFAULT_STAGGER_DELAY: 0.1,
  DEFAULT_FADE_DURATION: 0.6,
  DEFAULT_SLIDE_DURATION: 0.8,
} as const;

/**
 * ERROR MESSAGES
 */
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  POOL_PAUSED: 'This pool is currently paused',
  POOL_DEGRADED: 'This pool is experiencing issues',
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_LOW: 'Amount is below minimum threshold',
  AMOUNT_TOO_HIGH: 'Amount exceeds available balance',
  KYC_REQUIRED: 'KYC verification required for this action',
} as const;

/**
 * SUCCESS MESSAGES
 */
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

/**
 * FEATURES FLAGS (for toggling features on/off)
 */
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_COMMUNITY_POOLS: true,
  ENABLE_SRWA_TOKENS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_KYC: true,
  SHOW_DEBUG_INFO: import.meta.env.DEV,
} as const;

/**
 * DEFAULT VALUES
 */
export const DEFAULTS = {
  THEME: 'dark',
  LANGUAGE: 'en',
  CURRENCY: 'USD',
  SLIPPAGE_BPS: 50,
  DEADLINE_MINUTES: 20,
} as const;
