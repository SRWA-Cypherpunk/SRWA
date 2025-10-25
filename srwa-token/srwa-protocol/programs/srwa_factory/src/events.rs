use anchor_lang::prelude::*;

#[event]
pub struct TokenCreated {
    pub mint: Pubkey,
    pub issuer_admin: Pubkey,
    pub compliance_officer: Pubkey,
    pub transfer_agent: Pubkey,
    pub metadata_uri: String,
    pub timestamp: i64,
}

#[event]
pub struct OfferingOpened {
    pub mint: Pubkey,
    pub start_ts: i64,
    pub end_ts: i64,
    pub soft_cap: u64,
    pub hard_cap: u64,
    pub min_ticket: u64,
}

#[event]
pub struct OfferingLocked {
    pub mint: Pubkey,
    pub raised: u64,
    pub investors: u32,
    pub timestamp: i64,
}

#[event]
pub struct TrustedIssuerUpdated {
    pub mint: Pubkey,
    pub topic: u32,
    pub issuer: Pubkey,
    pub added: bool,
}

#[event]
pub struct ModuleUpdated {
    pub mint: Pubkey,
    pub module_id: u8,
    pub enabled: bool,
}

#[event]
pub struct OracleConfigUpdated {
    pub mint: Pubkey,
    pub nav_feeder: Pubkey,
    pub num_pyth_feeds: u8,
}

#[event]
pub struct RoleRotated {
    pub mint: Pubkey,
    pub role_type: String,
    pub old_pubkey: Pubkey,
    pub new_pubkey: Pubkey,
}
