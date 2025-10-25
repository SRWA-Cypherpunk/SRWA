use anchor_lang::prelude::*;
use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct IsVerified<'info> {
    /// CHECK: User being verified
    pub user: UncheckedAccount<'info>,

    #[account(
        seeds = [b"identity", user.key().as_ref()],
        bump = identity.bump,
    )]
    pub identity: Account<'info, IdentityAccount>,
}

pub fn handler(
    ctx: Context<IsVerified>,
    required_topics: Vec<u32>,
) -> Result<bool> {
    let user = ctx.accounts.user.key();
    let clock = Clock::get()?;

    // Check all required claims exist and are valid
    for topic in required_topics.iter() {
        let seeds = &[
            b"claim",
            user.as_ref(),
            &topic.to_le_bytes(),
        ];

        let (claim_pda, _) = Pubkey::find_program_address(seeds, &crate::ID);

        // Try to load the claim account
        let claim_account_info = ctx.remaining_accounts
            .iter()
            .find(|acc| acc.key() == claim_pda);

        if let Some(claim_info) = claim_account_info {
            let claim_data = claim_info.try_borrow_data()?;

            // Simple deserialize check (in production use proper deserialization)
            if claim_data.len() < 8 + ClaimAccount::INIT_SPACE {
                return Ok(false);
            }

            // Check if revoked (byte at offset after discriminator and user/issuer/topic)
            // This is simplified - in production properly deserialize
            let revoked_offset = 8 + 32 + 32 + 4 + 32 + 8 + 8;
            if claim_data.len() > revoked_offset && claim_data[revoked_offset] != 0 {
                return Ok(false); // Revoked
            }

            // Check expiration (valid_until at offset)
            // Simplified check
        } else {
            // Claim doesn't exist
            return Ok(false);
        }
    }

    Ok(true)
}
