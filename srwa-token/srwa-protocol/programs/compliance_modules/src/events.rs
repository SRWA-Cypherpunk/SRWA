use anchor_lang::prelude::*;

#[event]
pub struct JurisdictionConfigured {
    pub mint: Pubkey,
    pub num_allowed: u16,
    pub num_denied: u16,
}

#[event]
pub struct SanctionsUpdated {
    pub mint: Pubkey,
    pub num_sanctioned: u16,
}

#[event]
pub struct AccreditedConfigured {
    pub mint: Pubkey,
    pub required: bool,
}

#[event]
pub struct LockupSet {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub end_ts: i64,
}

#[event]
pub struct VolumeCapsSet {
    pub mint: Pubkey,
    pub daily: u64,
    pub monthly: u64,
}

#[event]
pub struct TransferWindowSet {
    pub mint: Pubkey,
    pub num_hours: u8,
    pub num_blocked_days: u8,
}

#[event]
pub struct ProgramAllowlistSet {
    pub mint: Pubkey,
    pub num_programs: u8,
}

#[event]
pub struct AccountAllowlistSet {
    pub mint: Pubkey,
    pub num_accounts: u16,
}
