use anchor_lang::prelude::*;

declare_id!("4RrVh2CZKUiU3g7uD2qVtVMYbXSvMQ1oSz2S8RnuHpEv");

#[program]
pub mod yield_adapter {
    use super::*;

    pub fn deposit_marginfi(_ctx: Context<DepositMarginfi>, amount: u64) -> Result<()> {
        msg!("Deposited {} to Marginfi", amount);
        Ok(())
    }

    pub fn withdraw_marginfi(_ctx: Context<WithdrawMarginfi>, amount: u64) -> Result<()> {
        msg!("Withdrew {} from Marginfi", amount);
        Ok(())
    }

    pub fn deposit_solend(_ctx: Context<DepositSolend>, amount: u64) -> Result<()> {
        msg!("Deposited {} to Solend", amount);
        Ok(())
    }

    pub fn withdraw_solend(_ctx: Context<WithdrawSolend>, amount: u64) -> Result<()> {
        msg!("Withdrew {} from Solend", amount);
        Ok(())
    }

    pub fn skim_yield(_ctx: Context<SkimYield>) -> Result<()> {
        msg!("Yield skimmed");
        Ok(())
    }

    /// Register a new Raydium pool as a separate account
    pub fn register_raydium_pool(
        ctx: Context<RegisterRaydiumPool>,
        pool_id: Pubkey,
        base_mint: Pubkey,
    ) -> Result<()> {
        let pool_account = &mut ctx.accounts.pool_account;
        let clock = Clock::get()?;

        pool_account.admin = ctx.accounts.admin.key();
        pool_account.pool_id = pool_id;
        pool_account.token_mint = ctx.accounts.token_mint.key();
        pool_account.base_mint = base_mint;
        pool_account.created_at = clock.unix_timestamp;
        pool_account.is_active = true;

        msg!(
            "Raydium pool registered: pool_id={}, token={}, base={}",
            pool_id,
            pool_account.token_mint,
            base_mint
        );

        Ok(())
    }

    /// Update pool status (active/inactive)
    pub fn update_pool_status(
        ctx: Context<UpdatePoolStatus>,
        is_active: bool,
    ) -> Result<()> {
        let pool_account = &mut ctx.accounts.pool_account;
        pool_account.is_active = is_active;

        msg!(
            "Pool {} status updated to: {}",
            pool_account.pool_id,
            is_active
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositMarginfi<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawMarginfi<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositSolend<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawSolend<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SkimYield<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterRaydiumPool<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + RaydiumPoolAccount::SPACE,
        seeds = [b"raydium_pool", token_mint.key().as_ref()],
        bump
    )]
    pub pool_account: Account<'info, RaydiumPoolAccount>,

    /// The SRWA token mint that will be paired in the pool
    /// CHECK: This is just used as a seed, not accessed
    pub token_mint: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePoolStatus<'info> {
    #[account(
        mut,
        seeds = [b"raydium_pool", pool_account.token_mint.as_ref()],
        bump,
        has_one = admin
    )]
    pub pool_account: Account<'info, RaydiumPoolAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

/// Account for each registered Raydium pool
#[account]
pub struct RaydiumPoolAccount {
    pub admin: Pubkey,       // 32
    pub pool_id: Pubkey,     // 32 - Raydium pool address
    pub token_mint: Pubkey,  // 32 - SRWA token
    pub base_mint: Pubkey,   // 32 - Base token (SOL, USDC, etc)
    pub created_at: i64,     // 8
    pub is_active: bool,     // 1
}

impl RaydiumPoolAccount {
    pub const SPACE: usize = 32 + 32 + 32 + 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
