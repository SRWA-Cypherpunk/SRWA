use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CompleteKYC<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user_registry", user.key().as_ref()],
        bump = user_registry.bump,
        constraint = user_registry.user == user.key() @ ErrorCode::Unauthorized
    )]
    pub user_registry: Account<'info, UserRegistry>,
}

pub fn handler(ctx: Context<CompleteKYC>) -> Result<()> {
    let user_registry = &mut ctx.accounts.user_registry;

    // Mark KYC as completed
    user_registry.kyc_completed = true;

    msg!("KYC completed for user: {}", ctx.accounts.user.key());

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: You can only update your own KYC status")]
    Unauthorized,
}
