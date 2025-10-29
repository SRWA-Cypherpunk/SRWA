use anchor_lang::prelude::*;

declare_id!("345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH");

#[program]
pub mod srwa_controller {
    use super::*;

    /// Transfer Hook - called automatically on every transfer, ensuring baseline compliance.
    /// This should be configured as the transfer hook for the Token-2022 mint.
    pub fn on_transfer(ctx: Context<OnTransfer>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        let offering = &ctx.accounts.offering;
        let clock = Clock::get()?;

        // 1. Global pause check
        require!(!config.paused, ControllerError::TransferPaused);

        // 2. Offering phase validation
        require!(
            matches!(
                offering.phase,
                OfferingPhase::OfferOpen
                    | OfferingPhase::OfferLocked
                    | OfferingPhase::OfferClosed
                    | OfferingPhase::Settlement
            ),
            ControllerError::OfferingRulesViolated
        );

        // 3. Time window validation (TransferWindow module)
        if config.modules_enabled.contains(&ModuleId::TransferWindow) {
            require!(
                clock.unix_timestamp >= offering.window.start_ts
                    && clock.unix_timestamp <= offering.window.end_ts,
                ControllerError::WindowClosed
            );
        }

        // 4. KYC verification for sender
        require!(
            ctx.accounts.from_registry.kyc_completed && ctx.accounts.from_registry.is_active,
            ControllerError::KYCFailed
        );

        // 5. KYC verification for recipient (if provided)
        if let Some(to_registry) = &ctx.accounts.to_registry {
            require!(
                to_registry.kyc_completed && to_registry.is_active,
                ControllerError::KYCFailed
            );
        } else if !config.required_topics.is_empty() || config.token_controls.default_frozen {
            // If KYC is required but no destination registry provided, fail
            return Err(ControllerError::KYCFailed.into());
        }

        // 6. Offering rules validation (investor limits)
        if config.modules_enabled.contains(&ModuleId::OfferingRules) {
            require!(
                amount >= offering.rules.min_ticket,
                ControllerError::OfferingRulesViolated
            );

            // Verify max investors limit (if destination is a new investor)
            if offering.funding.investors >= offering.rules.max_investors {
                // Could check if recipient is already a holder to allow existing investor transfers
                msg!("Warning: Max investors limit reached");
            }
        }

        // 7. Investor limits validation (per-investor cap)
        if config.modules_enabled.contains(&ModuleId::InvestorLimits) {
            require!(
                amount <= offering.rules.per_investor_cap,
                ControllerError::InvestorLimitExceeded
            );
        }

        // 8. Account allowlist validation
        if config.modules_enabled.contains(&ModuleId::AccountAllowlist) {
            // Would need additional account state to track allowlisted addresses
            // For now, just log that the module is enabled
            msg!("AccountAllowlist module is enabled");
        }

        // 9. Program allowlist validation (check calling program)
        if config.modules_enabled.contains(&ModuleId::ProgramAllowlist) {
            // Would need to check the instruction's program_id against allowlist
            msg!("ProgramAllowlist module is enabled");
        }

        // 10. Sanctions check
        if config.modules_enabled.contains(&ModuleId::Sanctions) {
            // Would integrate with Chainalysis/TRM or other oracle
            msg!("Sanctions module is enabled");
        }

        // 11. Jurisdiction check
        if config.modules_enabled.contains(&ModuleId::Jurisdiction) {
            // Would check user's jurisdiction against allowed list
            msg!("Jurisdiction module is enabled");
        }

        msg!(
            "Transfer validation passed: {} tokens from {} to {}",
            amount,
            ctx.accounts.from.key(),
            ctx.accounts.to.key()
        );

        Ok(())
    }

    /// Admin function to pause/unpause transfers
    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        let config = &mut ctx.accounts.config;

        // Verify admin authority
        require!(
            ctx.accounts.authority.key() == config.roles.issuer_admin
                || ctx.accounts.authority.key() == config.roles.compliance_officer,
            ControllerError::UnauthorizedAdmin
        );

        config.paused = paused;

        msg!("Transfer paused status set to: {}", paused);
        Ok(())
    }

    /// Admin function to update offering phase
    pub fn set_offering_phase(ctx: Context<SetOfferingPhase>, new_phase: OfferingPhase) -> Result<()> {
        let config = &ctx.accounts.config;
        let offering = &mut ctx.accounts.offering;

        // Verify admin authority
        require!(
            ctx.accounts.authority.key() == config.roles.issuer_admin,
            ControllerError::UnauthorizedAdmin
        );

        offering.phase = new_phase;

        msg!("Offering phase updated to: {:?}", new_phase);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct OnTransfer<'info> {
    /// CHECK: SRWA mint (Token-2022)
    pub mint: UncheckedAccount<'info>,
    /// CHECK: Source token account
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: Destination token account
    #[account(mut)]
    pub to: UncheckedAccount<'info>,
    /// Owner/delegate executing the transfer
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = config.bump,
    )]
    pub config: Account<'info, SRWAConfig>,
    #[account(
        seeds = [b"offering", mint.key().as_ref()],
        bump = offering.bump,
    )]
    pub offering: Account<'info, OfferingState>,
    #[account(
        seeds = [b"user_registry", authority.key().as_ref()],
        bump = from_registry.bump,
    )]
    pub from_registry: Account<'info, UserRegistry>,
    /// Optional destination registry for KYC validation
    pub to_registry: Option<Account<'info, UserRegistry>>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: SRWA mint
    pub mint: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = config.bump,
    )]
    pub config: Account<'info, SRWAConfig>,
}

#[derive(Accounts)]
pub struct SetOfferingPhase<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: SRWA mint
    pub mint: UncheckedAccount<'info>,
    #[account(
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = config.bump,
    )]
    pub config: Account<'info, SRWAConfig>,
    #[account(
        mut,
        seeds = [b"offering", mint.key().as_ref()],
        bump = offering.bump,
    )]
    pub offering: Account<'info, OfferingState>,
}

#[error_code]
pub enum ControllerError {
    #[msg("Transfer paused")]
    TransferPaused,
    #[msg("Account frozen")]
    AccountFrozen,
    #[msg("KYC verification failed")]
    KYCFailed,
    #[msg("Offering rules violated")]
    OfferingRulesViolated,
    #[msg("Investor limit exceeded")]
    InvestorLimitExceeded,
    #[msg("Lockup active")]
    LockupActive,
    #[msg("Transfer window closed")]
    WindowClosed,
    #[msg("Not allowlisted")]
    NotAllowlisted,
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
}

// -----------------------------------------------------------------------------
// Local copies of SRWA factory account layouts required for compliance checks.
// These mirror the structs defined in `srwa_factory::state`.
// -----------------------------------------------------------------------------

#[account]
pub struct SRWAConfig {
    pub version: u8,
    pub mint: Pubkey,
    pub roles: Roles,
    pub required_topics: Vec<u32>,
    pub trusted_issuers_data: Vec<TrustedIssuerEntry>,
    pub modules_enabled: Vec<ModuleId>,
    pub params_by_module: Vec<u8>,
    pub token_controls: TokenControls,
    pub oracle_cfg: OracleConfig,
    pub compliance_version: u16,
    pub metadata_uri: String,
    pub paused: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Roles {
    pub issuer_admin: Pubkey,
    pub compliance_officer: Pubkey,
    pub transfer_agent: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TrustedIssuerEntry {
    pub topic: u32,
    pub issuer: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum ModuleId {
    Jurisdiction,
    Sanctions,
    Accredited,
    Lockup,
    MaxHolders,
    VolumeCaps,
    TransferWindow,
    ProgramAllowlist,
    AccountAllowlist,
    OfferingRules,
    InvestorLimits,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TokenControls {
    pub default_frozen: bool,
    pub permanent_delegate: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OracleConfig {
    pub pyth_feeds: Vec<Pubkey>,
    pub heartbeat: u32,
    pub max_dev_bps: u32,
    pub nav_feeder: Pubkey,
    pub base_ccy: Currency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Currency {
    USD,
    BRL,
    EUR,
}

#[account]
pub struct OfferingState {
    pub mint: Pubkey,
    pub phase: OfferingPhase,
    pub window: TimeWindow,
    pub target: Target,
    pub pricing: Pricing,
    pub rules: OfferingRules,
    pub distribution: Distribution,
    pub funding: Funding,
    pub pool_vault: Pubkey,
    pub idle_strategy: IdleStrategy,
    pub fees_bps: Fees,
    pub settlement: Settlement,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum OfferingPhase {
    Draft,
    PreOffer,
    OfferOpen,
    OfferLocked,
    OfferClosed,
    Settlement,
    Refund,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TimeWindow {
    pub start_ts: i64,
    pub end_ts: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Target {
    pub soft_cap: u64,
    pub hard_cap: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Pricing {
    pub model: PricingModel,
    pub unit_price: u64,
    pub currency: Currency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PricingModel {
    Fixed,
    NAV,
    Hybrid,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OfferingRules {
    pub min_ticket: u64,
    pub per_investor_cap: u64,
    pub max_investors: u32,
    pub eligibility: Eligibility,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Eligibility {
    pub jurisdictions_allow: Vec<u16>,
    pub investor_types: Vec<InvestorType>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum InvestorType {
    RetailQualified,
    Accredited,
    Institutional,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Distribution {
    pub oversub_policy: OversubPolicy,
    pub lockups_data: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum OversubPolicy {
    ProRata,
    FCFS,
    PriorityBuckets,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Funding {
    pub raised: u64,
    pub investors: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum IdleStrategy {
    None,
    Marginfi,
    Solend,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Fees {
    pub origination_bps: u16,
    pub platform_bps: u16,
    pub success_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Settlement {
    pub issuer_treasury: Pubkey,
    pub fee_treasury: Pubkey,
}

#[account]
pub struct UserRegistry {
    pub user: Pubkey,
    pub role: UserRole,
    pub registered_at: i64,
    pub kyc_completed: bool,
    pub is_active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum UserRole {
    Issuer,
    Investor,
    Admin,
}
