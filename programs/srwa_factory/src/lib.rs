use anchor_lang::prelude::*;

declare_id!("DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use state::*;
use instructions::*;

#[program]
pub mod srwa_factory {
    use super::*;

    /// Creates a new SRWA token with Token-2022 extensions
    pub fn create_srwa(
        ctx: Context<CreateSRWA>,
        config_init: SRWAConfigInit,
        offering_init: OfferingInit,
    ) -> Result<()> {
        instructions::create_srwa::handler(ctx, config_init, offering_init)
    }

    /// Submete uma solicitação de criação de SRWA para aprovação do admin
    pub fn request_srwa(
        ctx: Context<RequestSrwa>,
        request_id: u64,
        mint: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
        config_init: SRWAConfigInit,
        offering_init: OfferingInit,
        yield_config: YieldConfig,
    ) -> Result<()> {
        instructions::request_srwa::handler(ctx, request_id, mint, name, symbol, decimals, config_init, offering_init, yield_config)
    }

    /// Aprova e implanta uma solicitação de SRWA previamente registrada
    pub fn approve_srwa(
        ctx: Context<ApproveSrwa>,
    ) -> Result<()> {
        instructions::approve_srwa::handler(ctx)
    }

    /// Rejeita uma solicitação de SRWA registrada
    pub fn reject_srwa(
        ctx: Context<RejectSrwa>,
        reason: String,
    ) -> Result<()> {
        instructions::reject_srwa::handler(ctx, reason)
    }

    /// Update trusted issuer for a specific topic
    pub fn update_trusted_issuer(
        ctx: Context<UpdateTrustedIssuer>,
        topic: u32,
        issuer: Pubkey,
        add: bool,
    ) -> Result<()> {
        instructions::update_trusted_issuer::handler(ctx, topic, issuer, add)
    }

    /// Enable a compliance module
    pub fn enable_module(
        ctx: Context<UpdateModule>,
        module_id: u8,
        params: Vec<u8>,
    ) -> Result<()> {
        instructions::enable_module::handler(ctx, module_id, params)
    }

    /// Disable a compliance module
    pub fn disable_module(
        ctx: Context<UpdateModule>,
        module_id: u8,
    ) -> Result<()> {
        instructions::disable_module::handler(ctx, module_id)
    }

    /// Set oracle configuration
    pub fn set_oracle_cfg(
        ctx: Context<SetOracleConfig>,
        pyth_feeds: Vec<Pubkey>,
        heartbeat: u32,
        max_dev_bps: u32,
        nav_feeder: Pubkey,
    ) -> Result<()> {
        instructions::set_oracle_cfg::handler(ctx, pyth_feeds, heartbeat, max_dev_bps, nav_feeder)
    }

    /// Rotate a role
    pub fn rotate_role(
        ctx: Context<RotateRole>,
        role: RoleType,
        new_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::rotate_role::handler(ctx, role, new_pubkey)
    }

    /// Open the offering by moving it from draft/pre-offer to open state
    pub fn open_offering(
        ctx: Context<OpenOffering>,
    ) -> Result<()> {
        instructions::open_offering::handler(ctx)
    }

    /// Initialize the platform admin registry
    pub fn initialize_admin_registry(
        ctx: Context<InitializeAdminRegistry>,
    ) -> Result<()> {
        instructions::initialize_admin_registry::handler(ctx)
    }

    /// Add a platform admin to the allowlist
    pub fn add_platform_admin(
        ctx: Context<AddPlatformAdmin>,
        new_admin: Pubkey,
    ) -> Result<()> {
        instructions::add_platform_admin::handler(ctx, new_admin)
    }

    /// Remove a platform admin from the allowlist
    pub fn remove_platform_admin(
        ctx: Context<RemovePlatformAdmin>,
        admin_to_remove: Pubkey,
    ) -> Result<()> {
        instructions::remove_platform_admin::handler(ctx, admin_to_remove)
    }

    /// Initialize the KYC provider registry
    pub fn initialize_kyc_registry(
        ctx: Context<InitializeKYCRegistry>,
    ) -> Result<()> {
        instructions::initialize_kyc_registry::handler(ctx)
    }

    /// Add a KYC provider to the registry
    pub fn add_kyc_provider(
        ctx: Context<AddKYCProvider>,
        provider_pubkey: Pubkey,
        name: String,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::add_kyc_provider::handler(ctx, provider_pubkey, name, metadata_uri)
    }

    /// Configure issuer KYC requirements
    pub fn configure_issuer_kyc(
        ctx: Context<ConfigureIssuerKYC>,
        mint: Pubkey,
        approved_providers: Vec<Pubkey>,
        required_claim_topics: Vec<u32>,
        require_kyc: bool,
    ) -> Result<()> {
        instructions::configure_issuer_kyc::handler(ctx, mint, approved_providers, required_claim_topics, require_kyc)
    }

    /// Verify investor KYC status
    pub fn verify_investor_kyc(
        ctx: Context<VerifyInvestorKYC>,
        mint: Pubkey,
    ) -> Result<bool> {
        instructions::verify_investor_kyc::handler(ctx, mint)
    }

    /// Register a new user with a specific role (Issuer, Investor, or Admin)
    pub fn register_user(
        ctx: Context<RegisterUser>,
        role: UserRole,
    ) -> Result<()> {
        instructions::register_user::handler(ctx, role)
    }

    /// Get user registry information
    pub fn get_user_registry(
        ctx: Context<GetUserRegistry>,
    ) -> Result<UserRole> {
        instructions::get_user_registry::handler(ctx)
    }

    /// Complete KYC for a user
    pub fn complete_kyc(
        ctx: Context<CompleteKYC>,
    ) -> Result<()> {
        instructions::complete_kyc::handler(ctx)
    }
}
