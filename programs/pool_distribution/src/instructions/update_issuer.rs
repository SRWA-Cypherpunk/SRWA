use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct UpdateIssuer<'info> {
    /// Apenas o admin pode atualizar issuer
    #[account(
        constraint = authority.key() == distribution_config.authority @ DistributionError::Unauthorized
    )]
    pub authority: Signer<'info>,

    /// Configuração de distribuição
    #[account(
        mut,
        seeds = [
            DistributionConfig::SEED_PREFIX,
            distribution_config.mint.as_ref(),
        ],
        bump = distribution_config.bump,
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
}

pub fn handler(ctx: Context<UpdateIssuer>, new_issuer: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.distribution_config;
    let clock = Clock::get()?;
    let old_issuer = config.issuer;

    config.issuer = new_issuer;

    emit!(ConfigUpdated {
        config: config.key(),
        mint: config.mint,
        field: format!("issuer: {} → {}", old_issuer, new_issuer),
        timestamp: clock.unix_timestamp,
    });

    msg!("Issuer updated: {} → {}", old_issuer, new_issuer);

    Ok(())
}
