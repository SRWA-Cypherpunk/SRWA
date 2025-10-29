use anchor_lang::prelude::*;

declare_id!("GD3ArP1GPKN9sWYPxiPia2i3iAKKsnbXxpcoB1gQK5D");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use state::*;
use instructions::*;
use errors::*;
use events::*;

#[program]
pub mod compliance_modules {
    use super::*;

    /// Configure jurisdiction module
    pub fn configure_jurisdiction(
        ctx: Context<ConfigureJurisdiction>,
        allow: Vec<u16>,
        deny: Vec<u16>,
        flags: u8,
    ) -> Result<()> {
        instructions::configure_jurisdiction::handler(ctx, allow, deny, flags)
    }

    /// Set sanctions list
    pub fn set_sanctions(
        ctx: Context<SetSanctions>,
        sanctioned_addresses: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::set_sanctions::handler(ctx, sanctioned_addresses)
    }

    /// Configure accreditation requirement
    pub fn configure_accredited(
        ctx: Context<ConfigureAccredited>,
        required: bool,
    ) -> Result<()> {
        instructions::configure_accredited::handler(ctx, required)
    }

    /// Set lockup for user
    pub fn set_lockup(
        ctx: Context<SetLockup>,
        schedule: LockupSchedule,
    ) -> Result<()> {
        instructions::set_lockup::handler(ctx, schedule)
    }

    /// Set global volume caps
    pub fn set_volume_caps(
        ctx: Context<SetVolumeCaps>,
        daily: u64,
        monthly: u64,
        max_tx: u64,
    ) -> Result<()> {
        instructions::set_volume_caps::handler(ctx, daily, monthly, max_tx)
    }

    /// Configure transfer window
    pub fn set_transfer_window(
        ctx: Context<SetTransferWindow>,
        allowed_hours: Vec<u8>,
        blocked_days: Vec<u8>,
    ) -> Result<()> {
        instructions::set_transfer_window::handler(ctx, allowed_hours, blocked_days)
    }

    /// Set program allowlist
    pub fn set_program_allowlist(
        ctx: Context<SetProgramAllowlist>,
        programs: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::set_program_allowlist::handler(ctx, programs)
    }

    /// Set account allowlist
    pub fn set_account_allowlist(
        ctx: Context<SetAccountAllowlist>,
        accounts: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::set_account_allowlist::handler(ctx, accounts)
    }
}
