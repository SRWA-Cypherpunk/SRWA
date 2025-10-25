use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
pub struct SetOracleConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = srwa_config.bump,
        has_one = mint,
        constraint = authority.key() == srwa_config.roles.issuer_admin @ SRWAError::Unauthorized
    )]
    pub srwa_config: Account<'info, SRWAConfig>,
}

pub fn handler(
    ctx: Context<SetOracleConfig>,
    pyth_feeds: Vec<Pubkey>,
    heartbeat: u32,
    max_dev_bps: u32,
    nav_feeder: Pubkey,
) -> Result<()> {
    let srwa_config = &mut ctx.accounts.srwa_config;

    srwa_config.oracle_cfg.pyth_feeds = pyth_feeds.clone();
    srwa_config.oracle_cfg.heartbeat = heartbeat;
    srwa_config.oracle_cfg.max_dev_bps = max_dev_bps;
    srwa_config.oracle_cfg.nav_feeder = nav_feeder;

    emit!(OracleConfigUpdated {
        mint: ctx.accounts.mint.key(),
        nav_feeder,
        num_pyth_feeds: pyth_feeds.len() as u8,
    });

    msg!("Oracle config updated");

    Ok(())
}
