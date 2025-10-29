use anchor_lang::prelude::*;

/// Main configuration for an SRWA token
#[account]
#[derive(InitSpace)]
pub struct SRWAConfig {
    pub version: u8,
    pub mint: Pubkey,
    pub roles: Roles,
    #[max_len(10)]
    pub required_topics: Vec<u32>,
    #[max_len(50)]
    pub trusted_issuers_data: Vec<TrustedIssuerEntry>,
    #[max_len(20)]
    pub modules_enabled: Vec<ModuleId>,
    #[max_len(1000)]
    pub params_by_module: Vec<u8>,
    pub token_controls: TokenControls,
    pub oracle_cfg: OracleConfig,
    pub compliance_version: u16,
    #[max_len(200)]
    pub metadata_uri: String,
    pub paused: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Roles {
    pub issuer_admin: Pubkey,
    pub compliance_officer: Pubkey,
    pub transfer_agent: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TrustedIssuerEntry {
    pub topic: u32,
    pub issuer: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ModuleId {
    Jurisdiction,
    Sanctions,
    Accredited,
    Lockup,
    MaxHolders,
    VolumeCaps,
    TransferWindow,
    ProgramAllowlist,
    AccountAllowlist,
    OfferingRules,
    InvestorLimits,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TokenControls {
    pub default_frozen: bool,
    pub permanent_delegate: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct OracleConfig {
    #[max_len(5)]
    pub pyth_feeds: Vec<Pubkey>,
    pub heartbeat: u32,
    pub max_dev_bps: u32,
    pub nav_feeder: Pubkey,
    pub base_ccy: Currency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Currency {
    USD,
    BRL,
    EUR,
}

/// Initialization parameters for SRWA creation
#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct SRWAConfigInit {
    pub roles: Roles,
    #[max_len(10)]
    pub required_topics: Vec<u32>,
    #[max_len(200)]
    pub metadata_uri: String,
    pub default_frozen: bool,
    pub permanent_delegate: Pubkey,
    pub mint_decimals: u8,
}

/// Offering state PDA
#[account]
#[derive(InitSpace)]
pub struct OfferingState {
    pub mint: Pubkey,
    pub phase: OfferingPhase,
    pub window: TimeWindow,
    pub target: Target,
    pub pricing: Pricing,
    pub rules: OfferingRules,
    pub distribution: Distribution,
    pub funding: Funding,
    pub pool_vault: Pubkey,
    pub idle_strategy: IdleStrategy,
    pub fees_bps: Fees,
    pub settlement: Settlement,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum OfferingPhase {
    Draft,
    PreOffer,
    OfferOpen,
    OfferLocked,
    OfferClosed,
    Settlement,
    Refund,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TimeWindow {
    pub start_ts: i64,
    pub end_ts: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Target {
    pub soft_cap: u64,
    pub hard_cap: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Pricing {
    pub model: PricingModel,
    pub unit_price: u64,
    pub currency: Currency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PricingModel {
    Fixed,
    NAV,
    Hybrid,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct OfferingRules {
    pub min_ticket: u64,
    pub per_investor_cap: u64,
    pub max_investors: u32,
    pub eligibility: Eligibility,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Eligibility {
    #[max_len(20)]
    pub jurisdictions_allow: Vec<u16>,
    #[max_len(10)]
    pub investor_types: Vec<InvestorType>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum InvestorType {
    RetailQualified,
    Accredited,
    Institutional,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Distribution {
    pub oversub_policy: OversubPolicy,
    #[max_len(100)]
    pub lockups_data: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum OversubPolicy {
    ProRata,
    FCFS,
    PriorityBuckets,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Funding {
    pub raised: u64,
    pub investors: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum IdleStrategy {
    None,
    Marginfi,
    Solend,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Fees {
    pub origination_bps: u16,
    pub platform_bps: u16,
    pub success_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Settlement {
    pub issuer_treasury: Pubkey,
    pub fee_treasury: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct OfferingInit {
    pub window: TimeWindow,
    pub target: Target,
    pub pricing: Pricing,
    pub rules: OfferingRules,
    pub oversub_policy: OversubPolicy,
    pub fees_bps: Fees,
    pub issuer_treasury: Pubkey,
    pub fee_treasury: Pubkey,
}

/// Valuation PDA
#[account]
#[derive(InitSpace)]
pub struct ValuationData {
    pub mint: Pubkey,
    pub last_nav: NAVData,
    #[max_len(5)]
    pub pyth_refs: Vec<Pubkey>,
    pub final_price: PriceData,
    pub guards: PriceGuards,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct NAVData {
    pub total: u128,
    pub per_token: u64,
    pub ccy: Currency,
    pub ts: i64,
    pub signer: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PriceData {
    pub usd: u64,
    pub conf_bps: u32,
    pub ts: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PriceGuards {
    pub heartbeat: u32,
    pub max_dev_bps: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RoleType {
    IssuerAdmin,
    ComplianceOfficer,
    TransferAgent,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum YieldProtocol {
    Marginfi,
    Solend,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct YieldConfig {
    pub protocol: YieldProtocol,
    pub target_apy_bps: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RequestStatus {
    Pending,
    Rejected,
    Deployed,
}

impl Default for RequestStatus {
    fn default() -> Self {
        RequestStatus::Pending
    }
}

#[account]
#[derive(InitSpace)]
pub struct SRWARequest {
    pub bump: u8,
    pub request_id: u64,
    pub issuer: Pubkey,
    pub mint: Pubkey,
    #[max_len(40)]
    pub name: String,
    #[max_len(12)]
    pub symbol: String,
    pub decimals: u8,
    pub status: RequestStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub config: SRWAConfigInit,
    pub offering: OfferingInit,
    pub yield_config: YieldConfig,
    pub approval_admin: Option<Pubkey>,
    pub srwa_config: Option<Pubkey>,
    pub offering_state: Option<Pubkey>,
    pub valuation_data: Option<Pubkey>,
    #[max_len(200)]
    pub reject_reason: Option<String>,
}

/// Platform Admin Registry - Global PDA que controla quem pode aprovar tokens/pools
#[account]
#[derive(InitSpace)]
pub struct PlatformAdminRegistry {
    pub super_admin: Pubkey,
    #[max_len(50)]
    pub authorized_admins: Vec<Pubkey>,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

/// KYC Provider Entry
#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct KYCProviderInfo {
    pub provider_pubkey: Pubkey,
    #[max_len(50)]
    pub name: String,
    #[max_len(200)]
    pub metadata_uri: String,
    pub active: bool,
    pub added_at: i64,
}

/// KYC Provider Registry - Lista global de KYC providers disponíveis
#[account]
#[derive(InitSpace)]
pub struct KYCProviderRegistry {
    pub authority: Pubkey,
    #[max_len(100)]
    pub providers: Vec<KYCProviderInfo>,
    pub bump: u8,
}

/// Issuer KYC Configuration - Configuração de KYC específica por issuer/token
#[account]
#[derive(InitSpace)]
pub struct IssuerKYCConfig {
    pub mint: Pubkey,
    pub issuer: Pubkey,
    #[max_len(10)]
    pub approved_providers: Vec<Pubkey>,
    #[max_len(10)]
    pub required_claim_topics: Vec<u32>,
    pub require_kyc: bool,
    pub bump: u8,
}

/// User Role Type - Define o tipo de usuário na plataforma
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum UserRole {
    Issuer,
    Investor,
    Admin,
}

/// User Registry - PDA individual para cada usuário
#[account]
#[derive(InitSpace)]
pub struct UserRegistry {
    pub user: Pubkey,
    pub role: UserRole,
    pub registered_at: i64,
    pub kyc_completed: bool,
    pub is_active: bool,
    pub bump: u8,
}
