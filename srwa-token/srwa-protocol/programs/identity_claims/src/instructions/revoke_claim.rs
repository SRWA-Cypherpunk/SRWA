use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
#[instruction(topic: u32)]
pub struct RevokeClaim<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// CHECK: User whose claim is being revoked
    pub holder: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"claim", holder.key().as_ref(), &topic.to_le_bytes()],
        bump = claim.bump,
        constraint = claim.issuer == issuer.key() @ IdentityError::UnauthorizedIssuer
    )]
    pub claim: Account<'info, ClaimAccount>,
}

pub fn handler(
    ctx: Context<RevokeClaim>,
    topic: u32,
) -> Result<()> {
    let claim = &mut ctx.accounts.claim;
    let clock = Clock::get()?;

    claim.revoked = true;

    emit!(ClaimRevoked {
        user: ctx.accounts.holder.key(),
        topic,
        timestamp: clock.unix_timestamp,
    });

    msg!("Claim {} revoked for user {}", topic, ctx.accounts.holder.key());

    Ok(())
}
