// ===== DEFINDEX INTEGRATION TYPES =====

export interface DefIndexPoolData {
  address: string;
  name: string;
  totalValueLocked: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apy: number;
  apyHistory: Array<{ timestamp: number; apy: number }>;
  participants: number;
  transactionCount: number;
  lastUpdated: number;
}

export interface DefIndexPosition {
  account: string;
  pool: string;
  collateral: string;
  debt: string;
  healthFactor: number;
  liquidationThreshold: number;
  createdAt: number;
  lastUpdated: number;
}

export interface DefIndexAnalytics {
  totalTVL: number;
  totalVolume24h: number;
  totalFees24h: number;
  averageAPY: number;
  activeUsers: number;
  totalTransactions: number;
  topPoolsByTVL: DefIndexPoolData[];
  topPoolsByAPY: DefIndexPoolData[];
  tvlHistory: Array<{ timestamp: number; tvl: number }>;
  volumeHistory: Array<{ timestamp: number; volume: number }>;
}

// ===== REFLECTOR ORACLE TYPES =====

export interface PriceData {
  asset: string;
  price: number;
  priceUSD: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  timestamp: number;
  source: string;
  degraded?: boolean; // Oracle-specific field
}

// Oracle contract response types
export interface OracleContractState {
  reflectorPair: string;
  twap: string;
  twapTs: number;
  staleSecs: number;
  nav: string;
  navValidUntil: number;
  haircutBps: number;
  bandBps: number;
  effectivePrice: string;
  degraded: boolean;
}

export interface AssetPriceFromOracle {
  asset: string;
  price: number;
  timestamp: number;
  source: 'reflector-oracle' | 'reflector-api' | 'coingecko';
  degraded: boolean;
  oracleData?: OracleContractState;
}

// Oracle contract addresses configuration
export interface OracleContractConfig {
  stellarDex: string;
  externalDexs: string;
  fiatRates: string;
}

// Enhanced oracle feed with contract data
export interface EnhancedOracleFeed {
  reflectorPair: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  effectivePrice: number;
  twap: number;
  twapTimestamp: number;
  staleSecs: number;
  degraded: boolean;
  lastUpdated: number;
  confidence: number;
  contractAddress: string;
  navValidUntil: number;
  haircutBps: number;
  bandBps: number;
}

export interface OracleFeed {
  reflectorPair: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  twap: number;
  twapTimestamp: number;
  staleSecs: number;
  degraded: boolean;
  lastUpdated: number;
  confidence: number;
  deviation: number;
}

export interface ReflectorState {
  feeds: OracleFeed[];
  totalFeeds: number;
  healthyFeeds: number;
  averageConfidence: number;
  lastGlobalUpdate: number;
  networkStatus: 'Healthy' | 'Degraded' | 'Offline';
}

// ===== COMBINED MARKET DATA =====

export interface EnhancedPoolData {
  // Core pool info (from Blend)
  address: string;
  name: string;
  class: 'TBill' | 'Receivables' | 'CRE';
  status: 'Active' | 'Paused' | 'Degraded';
  
  // Financial metrics (combined)
  tvl: number;
  suppliedAmount: number;
  borrowedAmount: number;
  availableLiquidity: number;
  utilizationRate: number;
  
  // APY data (from Blend + DefIndex)
  supplyAPY: number;
  borrowAPY: number;
  netAPY: number;
  apyTrend: 'up' | 'down' | 'stable';
  
  // Volume data (from DefIndex)
  volume24h: number;
  volume7d: number;
  volumeChange24h: number;
  
  // User metrics
  activeUsers: number;
  totalPositions: number;
  
  // Risk metrics
  averageHealthFactor: number;
  liquidationRate: number;
  riskScore: number;
  
  // Price data (from Reflector)
  assetPrices: Record<string, PriceData>;
  
  // Performance
  performance24h: number;
  performance7d: number;
  performance30d: number;
  
  // Timestamps
  lastUpdated: number;
  dataFreshness: 'Fresh' | 'Stale' | 'Outdated';
}

// ===== PORTFOLIO ANALYTICS =====

export interface PortfolioMetrics {
  totalValue: number;
  totalSupplied: number;
  totalBorrowed: number;
  netWorth: number;
  totalAPY: number;
  
  // Performance
  pnl24h: number;
  pnl7d: number;
  pnl30d: number;
  pnlTotal: number;
  
  // Risk
  averageHealthFactor: number;
  worstHealthFactor: number;
  positionsAtRisk: number;
  totalRiskScore: number;
  
  // Distribution
  assetDistribution: Array<{
    asset: string;
    value: number;
    percentage: number;
    apy: number;
  }>;
  
  poolDistribution: Array<{
    pool: string;
    value: number;
    percentage: number;
    apy: number;
  }>;
  
  // Activity
  transactionCount: number;
  lastActivity: number;
  
  // Forecasting
  projectedAPY: number;
  projectedValue30d: number;
  projectedValue90d: number;
}

// ===== RISK ANALYSIS =====

export interface RiskAlert {
  id: string;
  type: 'liquidation' | 'health_factor' | 'utilization' | 'price_impact';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  position: string;
  message: string;
  recommendation: string;
  estimatedTimeToAction?: number;
  actionRequired: boolean;
  createdAt: number;
}

export interface RiskAnalysis {
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  alerts: RiskAlert[];
  recommendations: string[];
  
  // Stress testing
  liquidationPrice: Record<string, number>;
  timeToLiquidation: Record<string, number>;
  worstCaseScenario: {
    scenario: string;
    impact: number;
    probability: number;
  };
  
  // Risk factors
  concentrationRisk: number;
  liquidityRisk: number;
  priceVolatilityRisk: number;
  platformRisk: number;
}

// ===== DASHBOARD STATE =====

export interface MarketsDashboardState {
  // Data
  pools: EnhancedPoolData[];
  userPositions: DefIndexPosition[];
  marketOverview: DefIndexAnalytics;
  priceFeeds: OracleFeed[];
  
  // UI State
  selectedPool: string | null;
  viewMode: 'grid' | 'list';
  sortConfig: {
    field: keyof EnhancedPoolData;
    order: 'asc' | 'desc';
  };
  filterConfig: {
    classes: Array<'TBill' | 'Receivables' | 'CRE'>;
    minAPY: number;
    maxAPY: number;
    minTVL: number;
    onlyUserPools: boolean;
  };
  searchQuery: string;
  
  // Loading states
  loading: {
    pools: boolean;
    positions: boolean;
    analytics: boolean;
    prices: boolean;
  };
  
  // Error states
  errors: {
    pools: string | null;
    positions: string | null;
    analytics: string | null;
    prices: string | null;
  };
  
  // Cache
  lastRefresh: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

// ===== API CONFIGURATIONS =====

export interface MarketDataConfig {
  // Data sources
  blendRpcUrl: string;
  defindexApiUrl: string;
  reflectorApiUrl: string;
  
  // Update intervals
  poolDataInterval: number;
  priceDataInterval: number;
  userPositionInterval: number;
  analyticsInterval: number;
  
  // Cache settings
  cacheTimeout: number;
  maxCacheSize: number;
  
  // Performance
  batchSize: number;
  parallelRequests: number;
  requestTimeout: number;
  
  // Features
  enableRealTimeUpdates: boolean;
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  enableRiskAlerts: boolean;
}

// ===== CHART DATA TYPES =====

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface MultiSeriesChartData {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter';
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  granularity: 'minute' | 'hour' | 'day' | 'week';
  showGrid: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  animated: boolean;
}

export interface PerformanceMetrics {
  data: MultiSeriesChartData[];
  config: ChartConfig;
  summary: {
    total: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    average: number;
  };
}