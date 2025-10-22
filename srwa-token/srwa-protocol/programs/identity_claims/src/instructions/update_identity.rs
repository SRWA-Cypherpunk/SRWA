use anchor_lang::prelude::*;
use crate::{state::*, events::*};

#[derive(Accounts)]
pub struct UpdateIdentity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"identity", user.key().as_ref()],
        bump = identity.bump,
    )]
    pub identity: Account<'info, IdentityAccount>,
}

pub fn handler(
    ctx: Context<UpdateIdentity>,
    level: u8,
    tags: Vec<u8>,
) -> Result<()> {
    let identity = &mut ctx.accounts.identity;
    let clock = Clock::get()?;

    identity.level = level;
    identity.tags = tags;
    identity.last_update = clock.unix_timestamp;

    emit!(IdentityUpdated {
        user: ctx.accounts.user.key(),
        level,
        timestamp: clock.unix_timestamp,
    });

    msg!("Identity updated for user {}", ctx.accounts.user.key());

    Ok(())
}
