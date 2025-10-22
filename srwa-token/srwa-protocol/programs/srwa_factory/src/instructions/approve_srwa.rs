use anchor_lang::prelude::*;

use crate::{errors::*, events::*, state::*};

#[derive(Accounts)]
pub struct ApproveSrwa<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"admin_registry"],
        bump = admin_registry.bump,
    )]
    pub admin_registry: Account<'info, PlatformAdminRegistry>,

    #[account(
        mut,
        seeds = [b"srwa_request", request.issuer.as_ref(), &request.request_id.to_le_bytes()],
        bump = request.bump,
        constraint = request.status == RequestStatus::Pending @ SRWAError::RequestNotPending
    )]
    pub request: Account<'info, SRWARequest>,

    /// CHECK: Mint address tracked in the request; not mutated here.
    #[account(constraint = mint.key() == request.mint @ SRWAError::MintMismatch)]
    pub mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + SRWAConfig::INIT_SPACE,
        seeds = [b"srwa_config", request.mint.as_ref()],
        bump
    )]
    pub srwa_config: Account<'info, SRWAConfig>,

    #[account(
        init,
        payer = admin,
        space = 8 + OfferingState::INIT_SPACE,
        seeds = [b"offering", request.mint.as_ref()],
        bump
    )]
    pub offering_state: Account<'info, OfferingState>,

    #[account(
        init,
        payer = admin,
        space = 8 + ValuationData::INIT_SPACE,
        seeds = [b"valuation", request.mint.as_ref()],
        bump
    )]
    pub valuation_data: Account<'info, ValuationData>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ApproveSrwa>) -> Result<()> {
    let admin_registry = &ctx.accounts.admin_registry;
    let request = &mut ctx.accounts.request;
    let srwa_config = &mut ctx.accounts.srwa_config;
    let offering_state = &mut ctx.accounts.offering_state;
    let valuation_data = &mut ctx.accounts.valuation_data;
    let clock = Clock::get()?;

    // Verifica se o admin está autorizado
    if !admin_registry.authorized_admins.contains(&ctx.accounts.admin.key()) {
        return Err(SRWAError::AdminNotInAllowlist.into());
    }

    let config_init = request.config.clone();
    let offering_init = request.offering.clone();

    // Initialize SRWA Config using data from the request
    srwa_config.version = 1;
    srwa_config.mint = request.mint;
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
        nav_feeder: config_init.roles.issuer_admin,
        base_ccy: Currency::USD,
    };
    srwa_config.compliance_version = 1;
    srwa_config.metadata_uri = config_init.metadata_uri.clone();
    srwa_config.bump = ctx.bumps.srwa_config;

    // Offering state
    offering_state.mint = request.mint;
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

    // Valuation data
    valuation_data.mint = request.mint;
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

    emit!(TokenCreated {
        mint: request.mint,
        issuer_admin: config_init.roles.issuer_admin,
        compliance_officer: config_init.roles.compliance_officer,
        transfer_agent: config_init.roles.transfer_agent,
        metadata_uri: config_init.metadata_uri,
        timestamp: clock.unix_timestamp,
    });

    emit!(OfferingOpened {
        mint: request.mint,
        start_ts: offering_init.window.start_ts,
        end_ts: offering_init.window.end_ts,
        soft_cap: offering_init.target.soft_cap,
        hard_cap: offering_init.target.hard_cap,
        min_ticket: offering_init.rules.min_ticket,
    });

    request.status = RequestStatus::Deployed;
    request.updated_at = clock.unix_timestamp;
    request.approval_admin = Some(ctx.accounts.admin.key());
    request.srwa_config = Some(srwa_config.key());
    request.offering_state = Some(offering_state.key());
    request.valuation_data = Some(valuation_data.key());
    request.reject_reason = None;

    Ok(())
}
