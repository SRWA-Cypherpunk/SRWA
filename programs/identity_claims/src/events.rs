use anchor_lang::prelude::*;

#[event]
pub struct IdentityRegistered {
    pub user: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ClaimAdded {
    pub user: Pubkey,
    pub issuer: Pubkey,
    pub topic: u32,
    pub valid_until: i64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimRevoked {
    pub user: Pubkey,
    pub topic: u32,
    pub timestamp: i64,
}

#[event]
pub struct IdentityUpdated {
    pub user: Pubkey,
    pub level: u8,
    pub timestamp: i64,
}
