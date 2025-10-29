use anchor_lang::prelude::*;

use crate::{errors::*, state::*};

#[derive(Accounts)]
#[instruction(request_id: u64)]
pub struct RequestSrwa<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        init,
        payer = issuer,
        space = 8 + SRWARequest::INIT_SPACE,
        seeds = [b"srwa_request", issuer.key().as_ref(), &request_id.to_le_bytes()],
        bump
    )]
    pub request: Account<'info, SRWARequest>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RequestSrwa>,
    request_id: u64,
    mint: Pubkey,
    name: String,
    symbol: String,
    decimals: u8,
    mut config_init: SRWAConfigInit,
    offering_init: OfferingInit,
    yield_config: YieldConfig,
) -> Result<()> {
    let request = &mut ctx.accounts.request;
    let clock = Clock::get()?;

    require!(name.len() <= 40, SRWAError::TokenNameTooLong);
    require!(symbol.len() <= 12, SRWAError::TokenSymbolTooLong);

    request.bump = ctx.bumps.request;
    request.request_id = request_id;
    request.issuer = ctx.accounts.issuer.key();
    request.mint = mint;
    request.name = name;
    request.symbol = symbol;
    request.decimals = decimals;
    request.status = RequestStatus::Pending;
    request.created_at = clock.unix_timestamp;
    request.updated_at = clock.unix_timestamp;
    if config_init.mint_decimals == 0 {
        config_init.mint_decimals = decimals;
    }
    request.config = config_init;
    request.offering = offering_init;
    request.yield_config = yield_config;
    request.approval_admin = None;
    request.srwa_config = None;
    request.offering_state = None;
    request.valuation_data = None;
    request.reject_reason = None;

    Ok(())
}
