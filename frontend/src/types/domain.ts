// ===== LEGACY TYPES (keep for backward compatibility) =====

export type Rule = {
	id: string;
	name: string;
	description?: string;
};

export type SRWA = {
	address: string;
	symbol: string;
	decimals: number;
	issuer: string;
	jurisdiction: string;
	rulesets: Rule[];
	caps: { perWallet?: number; perIssuer?: number };
};

export type Eligibility = {
	address: string;
	region: string;
	tier: string;
	expiry: number;
	kyc: boolean;
	frozen: boolean;
};

export type OracleState = {
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
};

export type ReserveConfig = {
	token: string;
	decimals: number;
	cFactor?: number;
	lFactor?: number;
	borrowable?: boolean;
	irm?: { base: number; slope1: number; slope2: number; kink: number };
	util?: number;
	maxUtil?: number;
	collateralCap?: number;
	enabled: boolean;
};

export type Pool = {
	address: string;
	class: 'TBill' | 'Receivables' | 'CRE';
	reserves: ReserveConfig[];
	backstopRate: number;
	status: 'Active' | 'Paused' | 'Degraded';
};

export type Position = {
	account: string;
	collateral: string;
	debt: string;
	hf: number;
	lltv: number;
};

// ===== RE-EXPORTS FOR NEW ENHANCED TYPES =====

export type {
	BlendPool,
	BlendReserve,
	BlendAsset,
	UserPosition,
	AssetPosition,
	TransactionPreview,
	BlendTransaction,
	PoolAnalytics,
	MarketOverview,
	BlendError,
	BlendErrorCode
} from './blend';

export type {
	DefIndexPoolData,
	DefIndexPosition,
	DefIndexAnalytics,
	PriceData,
	OracleFeed,
	ReflectorState,
	EnhancedPoolData,
	PortfolioMetrics,
	RiskAlert,
	RiskAnalysis,
	MarketsDashboardState,
	PerformanceMetrics
} from './markets';
