use anchor_lang::prelude::*;

declare_id!("8xBNucLz1R72p8TMCzXGH1W1L65E9jHPKEXwSwC1jCot");

#[program]
pub mod yield_adapter {
    use super::*;

    pub fn deposit_marginfi(ctx: Context<DepositMarginfi>, amount: u64) -> Result<()> {
        msg!("Deposited {} to Marginfi", amount);
        Ok(())
    }

    pub fn withdraw_marginfi(ctx: Context<WithdrawMarginfi>, amount: u64) -> Result<()> {
        msg!("Withdrew {} from Marginfi", amount);
        Ok(())
    }

    pub fn deposit_solend(ctx: Context<DepositSolend>, amount: u64) -> Result<()> {
        msg!("Deposited {} to Solend", amount);
        Ok(())
    }

    pub fn withdraw_solend(ctx: Context<WithdrawSolend>, amount: u64) -> Result<()> {
        msg!("Withdrew {} from Solend", amount);
        Ok(())
    }

    pub fn skim_yield(ctx: Context<SkimYield>) -> Result<()> {
        msg!("Yield skimmed");
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
