use anchor_lang::prelude::*;

declare_id!("B9vVuDnzj5RE7HpSJ9am7Ld1iP2D8V7eVgzsej7kppPz");

#[program]
pub mod valuation_oracle {
    use super::*;

    pub fn publish_nav(
        ctx: Context<PublishNAV>,
        total: u128,
        per_token: u64,
        currency: u8,
    ) -> Result<()> {
        let valuation = &mut ctx.accounts.valuation_data;
        let clock = Clock::get()?;

        valuation.total_nav = total;
        valuation.nav_per_token = per_token;
        valuation.currency = currency;
        valuation.last_update = clock.unix_timestamp;
        valuation.signer = ctx.accounts.nav_feeder.key();

        msg!("NAV published: total={}, per_token={}", total, per_token);
        Ok(())
    }

    pub fn compute_final_price(ctx: Context<ComputeFinalPrice>) -> Result<()> {
        msg!("Final price computed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PublishNAV<'info> {
    #[account(mut)]
    pub nav_feeder: Signer<'info>,

    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = nav_feeder,
        space = 8 + 200,
        seeds = [b"valuation", mint.key().as_ref()],
        bump
    )]
    pub valuation_data: Account<'info, ValuationData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ComputeFinalPrice<'info> {
    pub valuation_data: Account<'info, ValuationData>,
}

#[account]
pub struct ValuationData {
    pub total_nav: u128,
    pub nav_per_token: u64,
    pub currency: u8,
    pub last_update: i64,
    pub signer: Pubkey,
}
