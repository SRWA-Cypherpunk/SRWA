export type Address = string;

// Token Templates disponíveis
export enum TokenTemplate {
  RwaEquity = "RwaEquity",
  RwaDebt = "RwaDebt", 
  FundShare = "FundShare",
  PermissionedStable = "PermissionedStable"
}

// Configuração do Token
export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initial_supply: string; // i128 as string
  admin: Address;
  compliance_modules: Address[];
  claim_topics: number[];
  trusted_issuers: TrustedIssuer[];
  max_holders?: number;
  allowed_jurisdictions: string[];
  denied_jurisdictions: string[];
}

// Trusted Issuer
export interface TrustedIssuer {
  issuer: Address;
  topic_id: number;
}

// Token deployado pelo Factory
export interface DeployedToken {
  token_address: Address;
  compliance_address: Address;
  identity_registry_address: Address;
  identity_storage_address: Address;
  claim_topics_registry_address: Address;
  trusted_issuers_reg: Address;
  deployed_at: number;
  deployer: Address;
  config: TokenConfig;
}

// Contexto de Transfer para Compliance
export interface TransferContext {
  from: Address;
  to: Address;
  amount: string;
  token: Address;
}

// Claim de Identidade
export interface IdentityClaim {
  subject: Address;
  issuer: Address;
  topic_id: number;
  data: string; // hex string
  valid_until: number; // timestamp
}

// Tópico de Claim
export interface ClaimTopic {
  id: number;
  name: string;
  description?: string;
}

// Estados predefinidos de compliance modules
export interface ComplianceModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  params: Record<string, any>;
}

// Configurações específicas dos módulos
export interface JurisdictionModuleConfig {
  allowed_jurisdictions: string[];
  denied_jurisdictions: string[];
}

export interface LockupModuleConfig {
  lockup_periods: Array<{
    holder: Address;
    amount: string;
    unlock_time: number;
  }>;
}

export interface MaxHoldersModuleConfig {
  max_holders: number;
  current_holders?: number;
}

export interface PauseFreezeModuleConfig {
  paused: boolean;
  frozen_addresses: Array<{
    address: Address;
    frozen_amount: string;
  }>;
}

// Dados de posição do usuário (para integrations)
export interface UserPosition {
  supplied: Record<Address, string>;
  borrowed: Record<Address, string>;
}

// Request para operações de Blend/SoroSwap
export interface BlendRequest {
  request_type: BlendRequestType;
  address: Address;
  amount: string;
}

export enum BlendRequestType {
  SupplyCollateral = 0,
  WithdrawCollateral = 1,
  SupplyLiability = 2,
  WithdrawLiability = 3,
  Borrow = 4,
  Repay = 5,
  FillUserLiquidationAuction = 6,
  FillBadDebtAuction = 7,
  FillInterestAuction = 8,
  DeleteLiquidationAuction = 9,
}

// Informações de Pool do Blend
export interface BlendPoolInfo {
  pool_address: Address;
  name: string;
  oracle: Address;
  backstop_take_rate: number;
  max_positions: number;
}

// Configuração de Reserve para pools
export interface ReserveConfig {
  index: number;
  decimals: number;
  c_factor: number;
  l_factor: number;
  util: number;
  max_util: number;
  r_one: number;
  r_two: number;
  r_three: number;
  reactivity: number;
}

// Template padrões para diferentes tipos de RWA
export const TOKEN_TEMPLATE_DEFAULTS: Record<TokenTemplate, Partial<TokenConfig>> = {
  [TokenTemplate.RwaEquity]: {
    decimals: 18,
    claim_topics: [1, 2, 3], // KYC, AML, Accredited
    max_holders: 2000,
    allowed_jurisdictions: ["US", "CA", "GB"],
    denied_jurisdictions: ["IR", "KP"],
  },
  [TokenTemplate.RwaDebt]: {
    decimals: 6,
    claim_topics: [1, 2], // KYC, AML
    max_holders: undefined, // No limit for debt
    allowed_jurisdictions: [],
    denied_jurisdictions: [],
  },
  [TokenTemplate.FundShare]: {
    decimals: 18,
    claim_topics: [1, 2, 3], // KYC, AML, Accredited
    max_holders: 500,
    allowed_jurisdictions: [],
    denied_jurisdictions: [],
  },
  [TokenTemplate.PermissionedStable]: {
    decimals: 6,
    claim_topics: [1, 2], // KYC, AML
    max_holders: undefined,
    allowed_jurisdictions: [],
    denied_jurisdictions: [],
  },
};

// Tópicos de Claims padrão
export const DEFAULT_CLAIM_TOPICS: ClaimTopic[] = [
  { id: 1, name: "KYC", description: "Know Your Customer verification" },
  { id: 2, name: "AML", description: "Anti-Money Laundering verification" },
  { id: 3, name: "Accredited", description: "Accredited Investor status" },
  { id: 4, name: "Jurisdiction", description: "Jurisdiction verification" },
];

// Estados de operação
export interface OperationState {
  loading: boolean;
  error?: string;
  success?: boolean;
}

// Response de deploy do Token Factory
export interface TokenDeployResponse {
  deployed_token: DeployedToken;
  transaction_hash: string;
  gas_used?: string;
}

// Eventos emitidos pelos contratos
export interface TokenEvent {
  event_type: 'Transfer' | 'Mint' | 'Burn' | 'Approve' | 'Clawback' | 'Frozen' | 'Paused';
  from?: Address;
  to?: Address;
  amount?: string;
  timestamp: number;
  transaction_hash: string;
}

// Status de compliance de uma address
export interface ComplianceStatus {
  address: Address;
  is_compliant: boolean;
  required_claims: ClaimTopic[];
  current_claims: IdentityClaim[];
  missing_claims: number[];
  jurisdiction?: string;
  is_frozen: boolean;
  frozen_amount?: string;
}

// Form data para wizard de criação
export interface TokenCreationForm {
  // Step 1: Template & Basics
  template: TokenTemplate;
  name: string;
  symbol: string;
  decimals: number;
  admin: Address;

  // Step 2: Compliance
  claim_topics: number[];
  trusted_issuers: TrustedIssuer[];
  compliance_modules: ComplianceModuleConfig[];

  // Step 3: Advanced
  max_holders?: number;
  allowed_jurisdictions: string[];
  denied_jurisdictions: string[];
  initial_supply: string;
  initial_distribution: Array<{
    to: Address;
    amount: string;
  }>;

  // Step 4: Integration
  enable_blend_integration: boolean;
  enable_soroswap_integration: boolean;
}