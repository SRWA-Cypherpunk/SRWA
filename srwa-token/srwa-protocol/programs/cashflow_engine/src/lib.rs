use anchor_lang::prelude::*;

declare_id!("85UaZex7aRX647Dn3N8kYNxZNbZcHxB97nwGnkfD5JfQ");

#[program]
pub mod cashflow_engine {
    use super::*;

    pub fn schedule_coupon(
        ctx: Context<ScheduleCoupon>,
        rate_bps: u16,
        frequency: u8,
        tenor_years: u8,
    ) -> Result<()> {
        let schedule = &mut ctx.accounts.schedule;
        schedule.mint = ctx.accounts.mint.key();
        schedule.rate_bps = rate_bps;
        schedule.frequency = frequency;
        schedule.tenor_years = tenor_years;

        msg!("Coupon scheduled: rate={}bps, freq={}, tenor={}", rate_bps, frequency, tenor_years);
        Ok(())
    }

    pub fn record_payment(
        ctx: Context<RecordPayment>,
        amount: u64,
        currency: u8,
    ) -> Result<()> {
        msg!("Payment recorded: amount={}, currency={}", amount, currency);
        Ok(())
    }

    pub fn distribute(ctx: Context<Distribute>) -> Result<()> {
        // Waterfall distribution logic
        // 1. Fees
        // 2. Senior tranche
        // 3. Mezz tranche
        // 4. Equity/Junior

        msg!("Cashflow distributed via waterfall");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ScheduleCoupon<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 200,
        seeds = [b"coupon_schedule", mint.key().as_ref()],
        bump
    )]
    pub schedule: Account<'info, CouponSchedule>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordPayment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Distribute<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct CouponSchedule {
    pub mint: Pubkey,
    pub rate_bps: u16,
    pub frequency: u8,
    pub tenor_years: u8,
}
