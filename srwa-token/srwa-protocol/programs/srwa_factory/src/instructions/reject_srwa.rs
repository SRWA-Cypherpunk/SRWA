use anchor_lang::prelude::*;

use crate::{errors::*, state::*};

#[derive(Accounts)]
pub struct RejectSrwa<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"srwa_request", request.issuer.as_ref(), &request.request_id.to_le_bytes()],
        bump = request.bump,
        constraint = request.status == RequestStatus::Pending @ SRWAError::RequestNotPending
    )]
    pub request: Account<'info, SRWARequest>,
}

pub fn handler(ctx: Context<RejectSrwa>, reason: String) -> Result<()> {
    let request = &mut ctx.accounts.request;
    require!(
        reason.len() <= 200,
        SRWAError::RejectReasonTooLong
    );

    let clock = Clock::get()?;
    request.status = RequestStatus::Rejected;
    request.updated_at = clock.unix_timestamp;
    request.approval_admin = Some(ctx.accounts.admin.key());
    request.reject_reason = if reason.is_empty() {
        None
    } else {
        Some(reason)
    };

    Ok(())
}
