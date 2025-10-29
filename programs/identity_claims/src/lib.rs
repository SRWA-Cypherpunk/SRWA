use anchor_lang::prelude::*;

declare_id!("AuUzmKAAVyvR6NvDdd56SDjXHSE8dUePEnC5moECw9mE");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use state::*;
use instructions::*;
use errors::*;
use events::*;

#[program]
pub mod identity_claims {
    use super::*;

    /// Register a new identity
    pub fn register_identity(
        ctx: Context<RegisterIdentity>,
        metadata: Vec<u8>,
    ) -> Result<()> {
        instructions::register_identity::handler(ctx, metadata)
    }

    /// Add a claim to an identity
    pub fn add_claim(
        ctx: Context<AddClaim>,
        topic: u32,
        data_hash: [u8; 32],
        valid_until: i64,
    ) -> Result<()> {
        instructions::add_claim::handler(ctx, topic, data_hash, valid_until)
    }

    /// Revoke a claim
    pub fn revoke_claim(
        ctx: Context<RevokeClaim>,
        topic: u32,
    ) -> Result<()> {
        instructions::revoke_claim::handler(ctx, topic)
    }

    /// Check if user is verified for given topics
    pub fn is_verified(
        ctx: Context<IsVerified>,
        required_topics: Vec<u32>,
    ) -> Result<bool> {
        instructions::is_verified::handler(ctx, required_topics)
    }

    /// Update identity metadata
    pub fn update_identity(
        ctx: Context<UpdateIdentity>,
        level: u8,
        tags: Vec<u8>,
    ) -> Result<()> {
        instructions::update_identity::handler(ctx, level, tags)
    }
}
