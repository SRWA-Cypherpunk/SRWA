use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct UpdateThreshold<'info> {
    /// Apenas o admin pode atualizar threshold
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

pub fn handler(ctx: Context<UpdateThreshold>, new_threshold: u64) -> Result<()> {
    require!(new_threshold > 0, DistributionError::InvalidThreshold);

    let config = &mut ctx.accounts.distribution_config;
    let clock = Clock::get()?;
    let old_threshold = config.threshold;

    config.threshold = new_threshold;

    emit!(ConfigUpdated {
        config: config.key(),
        mint: config.mint,
        field: format!("threshold: {} → {}", old_threshold, new_threshold),
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Threshold updated: {} SOL → {} SOL",
        old_threshold as f64 / 1_000_000_000.0,
        new_threshold as f64 / 1_000_000_000.0
    );

    Ok(())
}
