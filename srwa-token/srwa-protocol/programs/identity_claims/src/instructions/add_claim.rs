use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
#[instruction(topic: u32)]
pub struct AddClaim<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// CHECK: User receiving the claim
    pub holder: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"identity", holder.key().as_ref()],
        bump = identity.bump,
    )]
    pub identity: Account<'info, IdentityAccount>,

    #[account(
        init,
        payer = issuer,
        space = 8 + ClaimAccount::INIT_SPACE,
        seeds = [b"claim", holder.key().as_ref(), &topic.to_le_bytes()],
        bump
    )]
    pub claim: Account<'info, ClaimAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AddClaim>,
    topic: u32,
    data_hash: [u8; 32],
    valid_until: i64,
) -> Result<()> {
    let claim = &mut ctx.accounts.claim;
    let identity = &mut ctx.accounts.identity;
    let clock = Clock::get()?;

    claim.user = ctx.accounts.holder.key();
    claim.issuer = ctx.accounts.issuer.key();
    claim.topic = topic;
    claim.data_hash = data_hash;
    claim.issued_at = clock.unix_timestamp;
    claim.valid_until = valid_until;
    claim.revoked = false;
    claim.bump = ctx.bumps.claim;

    // Update identity cache
    identity.last_update = clock.unix_timestamp;

    emit!(ClaimAdded {
        user: ctx.accounts.holder.key(),
        issuer: ctx.accounts.issuer.key(),
        topic,
        valid_until,
        timestamp: clock.unix_timestamp,
    });

    msg!("Claim {} added for user {} by issuer {}", topic, ctx.accounts.holder.key(), ctx.accounts.issuer.key());

    Ok(())
}
