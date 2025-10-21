use anchor_lang::prelude::*;

/// Jurisdiction module configuration
#[account]
#[derive(InitSpace)]
pub struct JurisdictionConfig {
    pub mint: Pubkey,
    #[max_len(50)]
    pub allow_list: Vec<u16>, // ISO country codes
    #[max_len(50)]
    pub deny_list: Vec<u16>,
    pub flags: u8, // Additional config flags
    pub bump: u8,
}

/// Sanctions list
#[account]
#[derive(InitSpace)]
pub struct SanctionsList {
    pub mint: Pubkey,
    #[max_len(1000)]
    pub sanctioned_addresses: Vec<Pubkey>,
    pub bump: u8,
}

/// Accreditation requirement
#[account]
#[derive(InitSpace)]
pub struct AccreditedConfig {
    pub mint: Pubkey,
    pub required: bool,
    pub bump: u8,
}

/// Lockup schedule for a user
#[account]
#[derive(InitSpace)]
pub struct LockupAccount {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub schedule: LockupSchedule,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct LockupSchedule {
    pub start_ts: i64,
    pub end_ts: i64,
    pub cliff_ts: i64,
    pub linear_vesting: bool,
}

/// Volume caps configuration
#[account]
#[derive(InitSpace)]
pub struct VolumeCapsConfig {
    pub mint: Pubkey,
    pub daily_cap: u64,
    pub monthly_cap: u64,
    pub max_tx: u64,
    pub bump: u8,
}

/// Transfer window configuration
#[account]
#[derive(InitSpace)]
pub struct TransferWindowConfig {
    pub mint: Pubkey,
    #[max_len(24)]
    pub allowed_hours: Vec<u8>, // 0-23
    #[max_len(7)]
    pub blocked_days: Vec<u8>, // 0-6 (0=Sunday)
    pub bump: u8,
}

/// Program allowlist (DEX/lending programs)
#[account]
#[derive(InitSpace)]
pub struct ProgramAllowlist {
    pub mint: Pubkey,
    #[max_len(20)]
    pub programs: Vec<Pubkey>,
    pub bump: u8,
}

/// Account allowlist (vaults/pools)
#[account]
#[derive(InitSpace)]
pub struct AccountAllowlist {
    pub mint: Pubkey,
    #[max_len(50)]
    pub accounts: Vec<Pubkey>,
    pub bump: u8,
}

/// Investor profile with limits
#[account]
#[derive(InitSpace)]
pub struct InvestorProfile {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub investor_class: InvestorClass,
    pub limits: InvestorLimits,
    pub kyc_match_cache: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum InvestorClass {
    Senior,
    Junior,
    Mezz,
    RetailQualified,
    Institutional,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct InvestorLimits {
    pub daily_volume: u64,
    pub position_cap: u64,
    pub concentration_bps: u16,
}
