use anchor_lang::prelude::*;

declare_id!("GShjrSQhcZJLP2xRGAvpoLyU2ndZN1k8A8fwPPqxm73W");

#[program]
pub mod offering_pool {
    use super::*;

    pub fn open(ctx: Context<OpenOffering>) -> Result<()> {
        let offering = &mut ctx.accounts.offering_state;
        offering.phase = 2; // OfferOpen
        msg!("Offering opened");
        Ok(())
    }

    pub fn subscribe(ctx: Context<Subscribe>, amount: u64) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        subscription.user = ctx.accounts.user.key();
        subscription.mint = ctx.accounts.mint.key();
        subscription.committed = amount;
        subscription.paid = amount;
        subscription.allocated = 0;
        subscription.status = 0; // Pending
        msg!("Subscribed {} USDC", amount);
        Ok(())
    }

    pub fn lock(ctx: Context<LockOffering>) -> Result<()> {
        let offering = &mut ctx.accounts.offering_state;
        offering.phase = 3; // OfferLocked
        msg!("Offering locked");
        Ok(())
    }

    pub fn settle(ctx: Context<SettleOffering>) -> Result<()> {
        let offering = &mut ctx.accounts.offering_state;
        offering.phase = 5; // Settlement
        msg!("Offering settled");
        Ok(())
    }

    pub fn refund(ctx: Context<RefundUser>) -> Result<()> {
        msg!("User refunded");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct OpenOffering<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub offering_state: Account<'info, OfferingState>,
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 200,
        seeds = [b"subscription", mint.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockOffering<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub offering_state: Account<'info, OfferingState>,
}

#[derive(Accounts)]
pub struct SettleOffering<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub offering_state: Account<'info, OfferingState>,
}

#[derive(Accounts)]
pub struct RefundUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct OfferingState {
    pub phase: u8,
    pub raised: u64,
}

#[account]
pub struct Subscription {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub committed: u64,
    pub paid: u64,
    pub allocated: u64,
    pub status: u8,
}
