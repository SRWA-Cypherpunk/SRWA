use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeKYCRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + KYCProviderRegistry::INIT_SPACE,
        seeds = [b"kyc_registry"],
        bump
    )]
    pub kyc_registry: Account<'info, KYCProviderRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeKYCRegistry>) -> Result<()> {
    let kyc_registry = &mut ctx.accounts.kyc_registry;

    kyc_registry.authority = ctx.accounts.authority.key();
    kyc_registry.providers = vec![];
    kyc_registry.bump = ctx.bumps.kyc_registry;

    msg!("KYC Provider Registry initialized");

    Ok(())
}
