use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct GetUserRegistry<'info> {
    pub user: Signer<'info>,

    #[account(
        seeds = [b"user_registry", user.key().as_ref()],
        bump = user_registry.bump,
    )]
    pub user_registry: Account<'info, UserRegistry>,
}

pub fn handler(ctx: Context<GetUserRegistry>) -> Result<UserRole> {
    let user_registry = &ctx.accounts.user_registry;

    msg!("User {} has role: {:?}", ctx.accounts.user.key(), user_registry.role);

    Ok(user_registry.role)
}
