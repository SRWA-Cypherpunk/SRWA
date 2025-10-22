use anchor_lang::prelude::*;

/// Identity PDA for a user
#[account]
#[derive(InitSpace)]
pub struct IdentityAccount {
    pub user: Pubkey,
    pub verified_cache: bool,
    pub level: u8,
    pub last_update: i64,
    #[max_len(20)]
    pub tags: Vec<u8>,
    pub bump: u8,
}

/// Claim PDA for a specific topic
#[account]
#[derive(InitSpace)]
pub struct ClaimAccount {
    pub user: Pubkey,
    pub issuer: Pubkey,
    pub topic: u32,
    pub data_hash: [u8; 32],
    pub issued_at: i64,
    pub valid_until: i64,
    pub revoked: bool,
    pub bump: u8,
}

/// Claim topics constants
pub mod topics {
    pub const KYC: u32 = 1;
    pub const AML: u32 = 2;
    pub const ACCREDITED: u32 = 3;
    pub const RESIDENCY: u32 = 4;
    pub const PEP: u32 = 5;
    pub const SANCTIONS_CLEAR: u32 = 6;
    pub const KYB: u32 = 7;
}
