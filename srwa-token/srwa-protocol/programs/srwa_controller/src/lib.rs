use anchor_lang::prelude::*;

declare_id!("csSqPv1tnopH9XkRuCakGjkunz5aKECfYBU1SwrZbFR");

#[program]
pub mod srwa_controller {
    use super::*;

    /// Transfer Hook - called automatically on every transfer
    pub fn on_transfer(
        ctx: Context<OnTransfer>,
        amount: u64,
    ) -> Result<()> {
        let from = ctx.accounts.from.key();
        let to = ctx.accounts.to.key();
        let mint = ctx.accounts.mint.key();
        let clock = Clock::get()?;

        msg!("Transfer Hook: from={}, to={}, amount={}", from, to, amount);

        // 1. Fail-fast: pause/freeze checks
        // (would check global pause state here)

        // 2. Identity verification (KYC/AML)
        // (would call identity_claims program here via CPI)

        // 3. Offering rules
        // (would check offering phase, caps, eligibility)

        // 4. Investor limits
        // (would check per-user caps, daily volume)

        // 5. Lockup check
        // (would verify lockup schedules)

        // 6. Transfer window
        // (would check allowed hours/days)

        // 7. Allowlist check
        // (would verify program/account allowlists)

        msg!("Transfer approved");
        Ok(())
    }

    /// Execute transfer with hook
    pub fn transfer_checked(
        ctx: Context<TransferChecked>,
        amount: u64,
    ) -> Result<()> {
        // This would perform the actual transfer after compliance checks
        msg!("Transfer executed: {}", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct OnTransfer<'info> {
    /// CHECK: Token mint
    pub mint: UncheckedAccount<'info>,
    /// CHECK: Source account
    pub from: UncheckedAccount<'info>,
    /// CHECK: Destination account
    pub to: UncheckedAccount<'info>,
    /// CHECK: Owner of source
    pub owner: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct TransferChecked<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Token mint
    pub mint: UncheckedAccount<'info>,
    /// CHECK: From token account
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: To token account
    #[account(mut)]
    pub to: UncheckedAccount<'info>,
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
}
