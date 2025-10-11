// Address type - using string for Solana addresses
type Address = string;

// ===== CORE BLEND TYPES =====

export interface BlendAsset {
  code: string;
  issuer?: string;
  contractAddress: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
}

export interface BlendReserve {
  asset: BlendAsset;
  totalSupply: bigint;
  totalBorrowed: bigint;
  availableLiquidity: bigint;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
  collateralFactor: number;
  liquidationFactor: number;
  lastUpdated: number;
  enabled: boolean;
  borrowable: boolean;
  collateralCap?: bigint;
  borrowCap?: bigint;
}

export interface BlendPool {
  address: string;
  name: string;
  class: 'TBill' | 'Receivables' | 'CRE';
  reserves: BlendReserve[];
  backstopRate: number;
  status: 'Active' | 'Paused' | 'Degraded';
  totalSupply: bigint;
  totalBorrowed: bigint;
  totalLiquidity: bigint;
  averageSupplyAPY: number;
  averageBorrowAPY: number;
  utilizationRate: number;
  createdAt: number;
  lastUpdated: number;
  
  // Community pool metadata (optional)
  poolType?: 'official' | 'community';
  creator?: string;
  description?: string;
  category?: 'DeFi' | 'RWA' | 'Experimental' | 'Gaming' | 'Other';
  tags?: string[];
  verified?: boolean;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Experimental';
  website?: string;
  twitter?: string;
  github?: string;
}

// ===== USER POSITIONS =====

export interface AssetPosition {
  asset: BlendAsset;
  supplied: bigint;
  borrowed: bigint;
  suppliedUSD: number;
  borrowedUSD: number;
  netAPY: number;
  healthContribution: number;
}

export interface UserPosition {
  pool: BlendPool;
  user: Address;
  positions: AssetPosition[];
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  totalCollateralUSD: number;
  healthFactor: number;
  liquidationThreshold: number;
  netAPY: number;
  isAtRisk: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastUpdated: number;
}

// ===== TRANSACTION TYPES =====

export interface TransactionPreview {
  type: 'supply' | 'withdraw' | 'borrow' | 'repay';
  asset: BlendAsset;
  amount: bigint;
  amountUSD: number;
  newHealthFactor?: number;
  newUtilizationRate: number;
  estimatedGasFee: bigint;
  slippage?: number;
  warnings: string[];
  canProceed: boolean;
}

export interface BlendTransaction {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay';
  pool: string;
  asset: BlendAsset;
  amount: bigint;
  amountUSD: number;
  user: Address;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  gasFee?: bigint;
  blockNumber?: number;
}

// ===== ANALYTICS TYPES =====

export interface PoolAnalytics {
  pool: BlendPool;
  tvlHistory: Array<{ timestamp: number; tvl: number }>;
  apyHistory: Array<{ 
    timestamp: number; 
    supplyAPY: number; 
    borrowAPY: number; 
  }>;
  utilizationHistory: Array<{ timestamp: number; utilization: number }>;
  volumeHistory: Array<{ 
    timestamp: number; 
    supplyVolume: number; 
    borrowVolume: number; 
  }>;
  activeUsers: number;
  totalTransactions: number;
  averageTransactionSize: number;
  topSuppliers: Array<{ address: string; amount: number; percentage: number }>;
  topBorrowers: Array<{ address: string; amount: number; percentage: number }>;
}

export interface MarketOverview {
  totalTVL: number;
  totalSupplied: number;
  totalBorrowed: number;
  averageSupplyAPY: number;
  averageBorrowAPY: number;
  activeUsers: number;
  totalPools: number;
  volume24h: number;
  topGainers: Array<{ pool: string; apy: number; change: number }>;
  topLosers: Array<{ pool: string; apy: number; change: number }>;
  riskDistribution: Array<{ level: string; count: number; percentage: number }>;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ===== ERROR TYPES =====

export interface BlendError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export type BlendErrorCode =
  | 'INSUFFICIENT_LIQUIDITY'
  | 'INSUFFICIENT_COLLATERAL'
  | 'POOL_PAUSED'
  | 'ASSET_DISABLED'
  | 'HEALTH_FACTOR_TOO_LOW'
  | 'LIQUIDATION_THRESHOLD_EXCEEDED'
  | 'TRANSACTION_FAILED'
  | 'NETWORK_ERROR'
  | 'USER_REJECTED'
  | 'UNKNOWN_ERROR';

// ===== HOOKS RETURN TYPES =====

export interface UseBlendPoolsReturn {
  pools: BlendPool[];
  loading: boolean;
  error: BlendError | null;
  refetch: () => Promise<void>;
  lastUpdated: number;
}

export interface UseLendingOperationsReturn {
  supply: (asset: string, amount: bigint) => Promise<string>;
  withdraw: (asset: string, amount: bigint) => Promise<string>;
  borrow: (asset: string, amount: bigint) => Promise<string>;
  repay: (asset: string, amount: bigint) => Promise<string>;
  previewTransaction: (
    type: TransactionPreview['type'],
    asset: string,
    amount: bigint
  ) => Promise<TransactionPreview>;
  isLoading: boolean;
  error: BlendError | null;
}

export interface UseUserPositionsReturn {
  positions: UserPosition[];
  totalValue: number;
  totalPnL: number;
  averageHealthFactor: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  loading: boolean;
  error: BlendError | null;
  refetch: () => Promise<void>;
}

// ===== UTILITY TYPES =====

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  assetTypes?: string[];
  poolClasses?: Array<'TBill' | 'Receivables' | 'CRE'>;
  minAPY?: number;
  maxAPY?: number;
  minTVL?: number;
  maxTVL?: number;
  riskLevels?: Array<'Low' | 'Medium' | 'High' | 'Critical'>;
}

export interface SearchConfig {
  query: string;
  fields: string[];
}