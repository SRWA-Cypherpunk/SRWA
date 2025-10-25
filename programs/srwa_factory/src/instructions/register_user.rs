use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserRegistry::INIT_SPACE,
        seeds = [b"user_registry", user.key().as_ref()],
        bump
    )]
    pub user_registry: Account<'info, UserRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterUser>, role: UserRole) -> Result<()> {
    let user_registry = &mut ctx.accounts.user_registry;
    let clock = Clock::get()?;

    user_registry.user = ctx.accounts.user.key();
    user_registry.role = role;
    user_registry.registered_at = clock.unix_timestamp;
    user_registry.kyc_completed = false;
    user_registry.is_active = true;
    user_registry.bump = ctx.bumps.user_registry;

    msg!("User registered: {} with role: {:?}", ctx.accounts.user.key(), role);

    Ok(())
}
