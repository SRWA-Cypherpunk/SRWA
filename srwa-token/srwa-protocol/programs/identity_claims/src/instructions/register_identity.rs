use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
pub struct RegisterIdentity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + IdentityAccount::INIT_SPACE,
        seeds = [b"identity", user.key().as_ref()],
        bump
    )]
    pub identity: Account<'info, IdentityAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterIdentity>,
    _metadata: Vec<u8>,
) -> Result<()> {
    let identity = &mut ctx.accounts.identity;
    let clock = Clock::get()?;

    identity.user = ctx.accounts.user.key();
    identity.verified_cache = false;
    identity.level = 0;
    identity.last_update = clock.unix_timestamp;
    identity.tags = vec![];
    identity.bump = ctx.bumps.identity;

    emit!(IdentityRegistered {
        user: ctx.accounts.user.key(),
        timestamp: clock.unix_timestamp,
    });

    msg!("Identity registered for user: {}", ctx.accounts.user.key());

    Ok(())
}
