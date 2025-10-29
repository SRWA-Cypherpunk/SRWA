use anchor_lang::prelude::*;
use crate::{state::*, events::*};

#[derive(Accounts)]
pub struct CreateSRWA<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// CHECK: The SRWA token mint
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,

    /// SRWA Configuration PDA
    #[account(
        init,
        payer = issuer,
        space = 8 + SRWAConfig::INIT_SPACE,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump
    )]
    pub srwa_config: Account<'info, SRWAConfig>,

    /// Offering State PDA
    #[account(
        init,
        payer = issuer,
        space = 8 + OfferingState::INIT_SPACE,
        seeds = [b"offering", mint.key().as_ref()],
        bump
    )]
    pub offering_state: Account<'info, OfferingState>,

    /// Valuation Data PDA
    #[account(
        init,
        payer = issuer,
        space = 8 + ValuationData::INIT_SPACE,
        seeds = [b"valuation", mint.key().as_ref()],
        bump
    )]
    pub valuation_data: Account<'info, ValuationData>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateSRWA>,
    config_init: SRWAConfigInit,
    offering_init: OfferingInit,
) -> Result<()> {
    let mint = &ctx.accounts.mint;
    let srwa_config = &mut ctx.accounts.srwa_config;
    let offering_state = &mut ctx.accounts.offering_state;
    let valuation_data = &mut ctx.accounts.valuation_data;
    let clock = Clock::get()?;

    // Initialize SRWA Config
    srwa_config.version = 1;
    srwa_config.mint = mint.key();
    srwa_config.roles = config_init.roles.clone();
    srwa_config.required_topics = config_init.required_topics.clone();
    srwa_config.trusted_issuers_data = vec![];
    srwa_config.modules_enabled = vec![];
    srwa_config.params_by_module = vec![];
    srwa_config.token_controls = TokenControls {
        default_frozen: config_init.default_frozen,
        permanent_delegate: config_init.permanent_delegate,
    };
    srwa_config.oracle_cfg = OracleConfig {
        pyth_feeds: vec![],
        heartbeat: 3600,
        max_dev_bps: 500,
        nav_feeder: ctx.accounts.issuer.key(),
        base_ccy: Currency::USD,
    };
    srwa_config.compliance_version = 1;
    srwa_config.metadata_uri = config_init.metadata_uri.clone();
    srwa_config.paused = false;
    srwa_config.bump = ctx.bumps.srwa_config;

    // Initialize Offering State
    offering_state.mint = mint.key();
    offering_state.phase = OfferingPhase::Draft;
    offering_state.window = offering_init.window.clone();
    offering_state.target = offering_init.target.clone();
    offering_state.pricing = offering_init.pricing.clone();
    offering_state.rules = offering_init.rules.clone();
    offering_state.distribution = Distribution {
        oversub_policy: offering_init.oversub_policy,
        lockups_data: vec![],
    };
    offering_state.funding = Funding {
        raised: 0,
        investors: 0,
    };
    offering_state.pool_vault = Pubkey::default();
    offering_state.idle_strategy = IdleStrategy::None;
    offering_state.fees_bps = offering_init.fees_bps.clone();
    offering_state.settlement = Settlement {
        issuer_treasury: offering_init.issuer_treasury,
        fee_treasury: offering_init.fee_treasury,
    };
    offering_state.bump = ctx.bumps.offering_state;

    // Initialize Valuation Data
    valuation_data.mint = mint.key();
    valuation_data.last_nav = NAVData {
        total: 0,
        per_token: 0,
        ccy: Currency::USD,
        ts: clock.unix_timestamp,
        signer: Pubkey::default(),
    };
    valuation_data.pyth_refs = vec![];
    valuation_data.final_price = PriceData {
        usd: 0,
        conf_bps: 0,
        ts: clock.unix_timestamp,
    };
    valuation_data.guards = PriceGuards {
        heartbeat: 3600,
        max_dev_bps: 500,
    };
    valuation_data.bump = ctx.bumps.valuation_data;

    // Emit event
    emit!(TokenCreated {
        mint: mint.key(),
        issuer_admin: config_init.roles.issuer_admin,
        compliance_officer: config_init.roles.compliance_officer,
        transfer_agent: config_init.roles.transfer_agent,
        metadata_uri: config_init.metadata_uri,
        timestamp: clock.unix_timestamp,
    });

    emit!(OfferingOpened {
        mint: mint.key(),
        start_ts: offering_init.window.start_ts,
        end_ts: offering_init.window.end_ts,
        soft_cap: offering_init.target.soft_cap,
        hard_cap: offering_init.target.hard_cap,
        min_ticket: offering_init.rules.min_ticket,
    });

    msg!("SRWA Token created: {}", mint.key());
    msg!("Config PDA: {}", srwa_config.key());
    msg!("Offering PDA: {}", offering_state.key());

    Ok(())
}
