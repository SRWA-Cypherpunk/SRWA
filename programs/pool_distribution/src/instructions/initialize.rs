use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(threshold: u64, issuer: Pubkey)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Mint do token SRWA associado a este pool
    /// CHECK: Validado via constraint
    pub mint: UncheckedAccount<'info>,

    /// Pool vault que acumulará SOL das compras
    /// CHECK: Será validado no momento da distribuição
    #[account(mut)]
    pub pool_vault: SystemAccount<'info>,

    /// Configuração de distribuição
    #[account(
        init,
        payer = authority,
        space = DistributionConfig::SIZE,
        seeds = [
            DistributionConfig::SEED_PREFIX,
            mint.key().as_ref(),
        ],
        bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    threshold: u64,
    issuer: Pubkey,
) -> Result<()> {
    require!(threshold > 0, DistributionError::InvalidThreshold);

    let config = &mut ctx.accounts.distribution_config;
    let clock = Clock::get()?;

    config.bump = ctx.bumps.distribution_config;
    config.authority = ctx.accounts.authority.key();
    config.mint = ctx.accounts.mint.key();
    config.pool_vault = ctx.accounts.pool_vault.key();
    config.issuer = issuer;
    config.threshold = threshold;
    config.last_distribution = 0;
    config.total_distributed = 0;
    config.distribution_count = 0;

    emit!(ConfigUpdated {
        config: config.key(),
        mint: config.mint,
        field: "initialized".to_string(),
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Distribution config initialized: mint={}, threshold={} lamports ({} SOL), issuer={}",
        config.mint,
        threshold,
        threshold as f64 / 1_000_000_000.0,
        issuer
    );

    Ok(())
}
