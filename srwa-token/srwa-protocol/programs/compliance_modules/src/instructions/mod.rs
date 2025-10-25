use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

// Configure Jurisdiction
#[derive(Accounts)]
pub struct ConfigureJurisdiction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + JurisdictionConfig::INIT_SPACE,
        seeds = [b"jurisdiction", mint.key().as_ref()],
        bump
    )]
    pub jurisdiction_config: Account<'info, JurisdictionConfig>,
    pub system_program: Program<'info, System>,
}

pub mod configure_jurisdiction {
    use super::*;
    pub fn handler(ctx: Context<ConfigureJurisdiction>, allow: Vec<u16>, deny: Vec<u16>, flags: u8) -> Result<()> {
        let config = &mut ctx.accounts.jurisdiction_config;
        config.mint = ctx.accounts.mint.key();
        config.allow_list = allow.clone();
        config.deny_list = deny.clone();
        config.flags = flags;
        config.bump = ctx.bumps.jurisdiction_config;
        emit!(JurisdictionConfigured {
            mint: ctx.accounts.mint.key(),
            num_allowed: allow.len() as u16,
            num_denied: deny.len() as u16,
        });
        Ok(())
    }
}

// Set Sanctions
#[derive(Accounts)]
pub struct SetSanctions<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + SanctionsList::INIT_SPACE,
        seeds = [b"sanctions", mint.key().as_ref()],
        bump
    )]
    pub sanctions: Account<'info, SanctionsList>,
    pub system_program: Program<'info, System>,
}

pub mod set_sanctions {
    use super::*;
    pub fn handler(ctx: Context<SetSanctions>, sanctioned_addresses: Vec<Pubkey>) -> Result<()> {
        let sanctions = &mut ctx.accounts.sanctions;
        sanctions.mint = ctx.accounts.mint.key();
        sanctions.sanctioned_addresses = sanctioned_addresses.clone();
        sanctions.bump = ctx.bumps.sanctions;
        emit!(SanctionsUpdated {
            mint: ctx.accounts.mint.key(),
            num_sanctioned: sanctioned_addresses.len() as u16,
        });
        Ok(())
    }
}

// Configure Accredited
#[derive(Accounts)]
pub struct ConfigureAccredited<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + AccreditedConfig::INIT_SPACE,
        seeds = [b"accredited", mint.key().as_ref()],
        bump
    )]
    pub accredited_config: Account<'info, AccreditedConfig>,
    pub system_program: Program<'info, System>,
}

pub mod configure_accredited {
    use super::*;
    pub fn handler(ctx: Context<ConfigureAccredited>, required: bool) -> Result<()> {
        let config = &mut ctx.accounts.accredited_config;
        config.mint = ctx.accounts.mint.key();
        config.required = required;
        config.bump = ctx.bumps.accredited_config;
        emit!(AccreditedConfigured {
            mint: ctx.accounts.mint.key(),
            required,
        });
        Ok(())
    }
}

// Set Lockup
#[derive(Accounts)]
pub struct SetLockup<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    /// CHECK: User account
    pub user: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + LockupAccount::INIT_SPACE,
        seeds = [b"lockup", mint.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub lockup: Account<'info, LockupAccount>,
    pub system_program: Program<'info, System>,
}

pub mod set_lockup {
    use super::*;
    pub fn handler(ctx: Context<SetLockup>, schedule: LockupSchedule) -> Result<()> {
        let lockup = &mut ctx.accounts.lockup;
        lockup.mint = ctx.accounts.mint.key();
        lockup.user = ctx.accounts.user.key();
        lockup.schedule = schedule.clone();
        lockup.bump = ctx.bumps.lockup;
        emit!(LockupSet {
            mint: ctx.accounts.mint.key(),
            user: ctx.accounts.user.key(),
            end_ts: schedule.end_ts,
        });
        Ok(())
    }
}

// Set Volume Caps
#[derive(Accounts)]
pub struct SetVolumeCaps<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + VolumeCapsConfig::INIT_SPACE,
        seeds = [b"volume_caps", mint.key().as_ref()],
        bump
    )]
    pub volume_caps: Account<'info, VolumeCapsConfig>,
    pub system_program: Program<'info, System>,
}

pub mod set_volume_caps {
    use super::*;
    pub fn handler(ctx: Context<SetVolumeCaps>, daily: u64, monthly: u64, max_tx: u64) -> Result<()> {
        let caps = &mut ctx.accounts.volume_caps;
        caps.mint = ctx.accounts.mint.key();
        caps.daily_cap = daily;
        caps.monthly_cap = monthly;
        caps.max_tx = max_tx;
        caps.bump = ctx.bumps.volume_caps;
        emit!(VolumeCapsSet {
            mint: ctx.accounts.mint.key(),
            daily,
            monthly,
        });
        Ok(())
    }
}

// Set Transfer Window
#[derive(Accounts)]
pub struct SetTransferWindow<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + TransferWindowConfig::INIT_SPACE,
        seeds = [b"transfer_window", mint.key().as_ref()],
        bump
    )]
    pub transfer_window: Account<'info, TransferWindowConfig>,
    pub system_program: Program<'info, System>,
}

pub mod set_transfer_window {
    use super::*;
    pub fn handler(ctx: Context<SetTransferWindow>, allowed_hours: Vec<u8>, blocked_days: Vec<u8>) -> Result<()> {
        let window = &mut ctx.accounts.transfer_window;
        window.mint = ctx.accounts.mint.key();
        window.allowed_hours = allowed_hours.clone();
        window.blocked_days = blocked_days.clone();
        window.bump = ctx.bumps.transfer_window;
        emit!(TransferWindowSet {
            mint: ctx.accounts.mint.key(),
            num_hours: allowed_hours.len() as u8,
            num_blocked_days: blocked_days.len() as u8,
        });
        Ok(())
    }
}

// Set Program Allowlist
#[derive(Accounts)]
pub struct SetProgramAllowlist<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + ProgramAllowlist::INIT_SPACE,
        seeds = [b"program_allowlist", mint.key().as_ref()],
        bump
    )]
    pub program_allowlist: Account<'info, ProgramAllowlist>,
    pub system_program: Program<'info, System>,
}

pub mod set_program_allowlist {
    use super::*;
    pub fn handler(ctx: Context<SetProgramAllowlist>, programs: Vec<Pubkey>) -> Result<()> {
        let allowlist = &mut ctx.accounts.program_allowlist;
        allowlist.mint = ctx.accounts.mint.key();
        allowlist.programs = programs.clone();
        allowlist.bump = ctx.bumps.program_allowlist;
        emit!(ProgramAllowlistSet {
            mint: ctx.accounts.mint.key(),
            num_programs: programs.len() as u8,
        });
        Ok(())
    }
}

// Set Account Allowlist
#[derive(Accounts)]
pub struct SetAccountAllowlist<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + AccountAllowlist::INIT_SPACE,
        seeds = [b"account_allowlist", mint.key().as_ref()],
        bump
    )]
    pub account_allowlist: Account<'info, AccountAllowlist>,
    pub system_program: Program<'info, System>,
}

pub mod set_account_allowlist {
    use super::*;
    pub fn handler(ctx: Context<SetAccountAllowlist>, accounts: Vec<Pubkey>) -> Result<()> {
        let allowlist = &mut ctx.accounts.account_allowlist;
        allowlist.mint = ctx.accounts.mint.key();
        allowlist.accounts = accounts.clone();
        allowlist.bump = ctx.bumps.account_allowlist;
        emit!(AccountAllowlistSet {
            mint: ctx.accounts.mint.key(),
            num_accounts: accounts.len() as u16,
        });
        Ok(())
    }
}
