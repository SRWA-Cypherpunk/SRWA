use anchor_lang::prelude::*;

use crate::{
    errors::SRWAError,
    state::{OfferingPhase, OfferingState, SRWAConfig},
};

#[derive(Accounts)]
pub struct OpenOffering<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        has_one = mint,
    )]
    pub srwa_config: Account<'info, SRWAConfig>,

    /// CHECK: Mint is validated via srwa_config.has_one
    pub mint: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"offering", mint.key().as_ref()],
        bump = offering_state.bump,
    )]
    pub offering_state: Account<'info, OfferingState>,
}

pub fn handler(ctx: Context<OpenOffering>) -> Result<()> {
    let issuer = ctx.accounts.issuer.key();
    let srwa_config = &ctx.accounts.srwa_config;
    let offering_state = &mut ctx.accounts.offering_state;

    require_keys_eq!(issuer, srwa_config.roles.issuer_admin, SRWAError::Unauthorized);

    require!(
        matches!(
            offering_state.phase,
            OfferingPhase::Draft | OfferingPhase::PreOffer
        ),
        SRWAError::InvalidPhase
    );

    offering_state.phase = OfferingPhase::OfferOpen;

    Ok(())
}
