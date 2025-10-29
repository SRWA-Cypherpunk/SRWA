use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke,
    system_instruction,
    system_program,
    sysvar::rent::Rent,
};
use spl_token_2022::{
    extension::{
        default_account_state,
        metadata_pointer,
        transfer_hook,
        ExtensionType,
    },
    instruction as token_2022_ix,
    state::AccountState,
};

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

    /// CHECK: token-2022 mint account that will be created during approval.
    #[account(mut, signer)]
    pub mint: AccountInfo<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + SRWAConfig::INIT_SPACE,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump
    )]
    pub srwa_config: Account<'info, SRWAConfig>,

    #[account(
        init,
        payer = admin,
        space = 8 + OfferingState::INIT_SPACE,
        seeds = [b"offering", mint.key().as_ref()],
        bump
    )]
    pub offering_state: Account<'info, OfferingState>,

    #[account(
        init,
        payer = admin,
        space = 8 + ValuationData::INIT_SPACE,
        seeds = [b"valuation", mint.key().as_ref()],
        bump
    )]
    pub valuation_data: Account<'info, ValuationData>,

    pub system_program: Program<'info, System>,

    /// CHECK: Token-2022 program for mint initialization
    pub token_program: AccountInfo<'info>,
}

pub fn handler(ctx: Context<ApproveSrwa>) -> Result<()> {
    let admin_registry = &ctx.accounts.admin_registry;
    let srwa_config = &mut ctx.accounts.srwa_config;
    let offering_state = &mut ctx.accounts.offering_state;
    let valuation_data = &mut ctx.accounts.valuation_data;
    let mint_account = &ctx.accounts.mint;
    let clock = Clock::get()?;

    // Ensure admin is authorized
    if !admin_registry
        .authorized_admins
        .contains(&ctx.accounts.admin.key())
    {
        return Err(SRWAError::AdminNotInAllowlist.into());
    }

    // Clone data we need before taking mutable borrow of request
    let config_init = ctx.accounts.request.config.clone();
    let offering_init = ctx.accounts.request.offering.clone();
    let mint_key = mint_account.key();
    let decimals = config_init.mint_decimals.max(ctx.accounts.request.decimals);

    if ctx.accounts.request.mint != Pubkey::default() && ctx.accounts.request.mint != mint_key {
        return Err(SRWAError::MintMismatch.into());
    }

    initialise_token_2022_mint(
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.admin.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        &config_init,
        decimals,
    )?;

    // Now take mutable borrow of request
    let request = &mut ctx.accounts.request;
    request.mint = mint_key;

    // Initialize SRWA Config using data from the request
    srwa_config.version = 1;
    srwa_config.mint = mint_key;
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
    srwa_config.paused = false;
    srwa_config.bump = ctx.bumps.srwa_config;

    // Offering state
    offering_state.mint = mint_key;
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
    valuation_data.mint = mint_key;
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
        mint: mint_key,
        issuer_admin: config_init.roles.issuer_admin,
        compliance_officer: config_init.roles.compliance_officer,
        transfer_agent: config_init.roles.transfer_agent,
        metadata_uri: config_init.metadata_uri,
        timestamp: clock.unix_timestamp,
    });

    emit!(OfferingOpened {
        mint: mint_key,
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

fn initialise_token_2022_mint<'info>(
    mint_info: AccountInfo<'info>,
    admin_info: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    _token_program_info: AccountInfo<'info>,
    config: &SRWAConfigInit,
    decimals: u8
) -> Result<()> {

    // If the mint already exists and is owned by token-2022 we consider it initialized
    if mint_info.owner == &spl_token_2022::id() && !mint_info.data_is_empty() {
        return Ok(());
    }

    require!(
        mint_info.owner == &system_program::ID || mint_info.data_is_empty(),
        SRWAError::MintInvalidOwner
    );

    // allocate space with required extensions
    let mut extensions = vec![
        ExtensionType::TransferHook,
        ExtensionType::DefaultAccountState,
    ];

    // Add PermanentDelegate only if configured
    if config.permanent_delegate != Pubkey::default() {
        extensions.push(ExtensionType::PermanentDelegate);
    }

    // Add MetadataPointer for on-chain metadata support
    if !config.metadata_uri.is_empty() {
        extensions.push(ExtensionType::MetadataPointer);
    }
    let mint_size = ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(&extensions[..])
        .map_err(|_| SRWAError::MintInitializationFailed)?;
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(mint_size);

    invoke(
        &system_instruction::create_account(
            admin_info.key,
            mint_info.key,
            lamports,
            mint_size as u64,
            &spl_token_2022::id(),
        ),
        &[admin_info.clone(), mint_info.clone(), system_program],
    )?;

    // Configure MetadataPointer if metadata_uri is provided
    if !config.metadata_uri.is_empty() {
        invoke(
            &metadata_pointer::instruction::initialize(
                &spl_token_2022::id(),
                mint_info.key,
                Some(config.roles.issuer_admin),
                Some(*mint_info.key), // Points to itself for Token Metadata
            )?,
            &[mint_info.clone()],
        )?;
    }

    // Configure transfer hook pointing to controller program
    invoke(
        &transfer_hook::instruction::initialize(
            &spl_token_2022::id(),
            mint_info.key,
            Some(config.roles.compliance_officer),
            Some(srwa_controller::ID),
        )?,
        &[mint_info.clone()],
    )?;

    // Default account state (frozen or initialized)
    let default_state = if config.default_frozen {
        AccountState::Frozen
    } else {
        AccountState::Initialized
    };
    invoke(
        &default_account_state::instruction::initialize_default_account_state(
            &spl_token_2022::id(),
            mint_info.key,
            &default_state,
        )?,
        &[mint_info.clone()],
    )?;

    // Permanent delegate if configured
    if config.permanent_delegate != Pubkey::default() {
        invoke(
            &token_2022_ix::initialize_permanent_delegate(
                &spl_token_2022::id(),
                mint_info.key,
                &config.permanent_delegate,
            )?,
            &[mint_info.clone()],
        )?;
    }

    // Initialize mint authorities
    // Set admin as mint authority so they can mint the initial supply
    // The issuer_admin will control other aspects via the SRWA config
    invoke(
        &token_2022_ix::initialize_mint2(
            &spl_token_2022::id(),
            mint_info.key,
            admin_info.key,  // Admin is the mint authority
            Some(&config.roles.transfer_agent),
            decimals,
        )?,
        &[mint_info],
    )?;

    Ok(())
}
