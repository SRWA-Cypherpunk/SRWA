use anchor_lang::prelude::*;
use anchor_spl::token_interface::TokenAccount;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct MarkAsApproved<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Purchase order being marked as approved
    #[account(
        mut,
        seeds = [
            PurchaseOrder::SEED_PREFIX,
            purchase_order.mint.as_ref(),
            purchase_order.investor.as_ref(),
            &purchase_order.created_at.to_le_bytes()
        ],
        bump = purchase_order.bump,
        constraint = purchase_order.status == PurchaseOrderStatus::Pending @ PurchaseOrderError::NotPending
    )]
    pub purchase_order: Account<'info, PurchaseOrder>,

    /// Admin's token account (for verification only - transfer already happened)
    #[account(
        constraint = admin_token_account.mint == purchase_order.mint
    )]
    pub admin_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Investor's token account (for verification only - transfer already happened)
    #[account(
        constraint = investor_token_account.mint == purchase_order.mint,
        constraint = investor_token_account.owner == purchase_order.investor
    )]
    pub investor_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn handler(ctx: Context<MarkAsApproved>) -> Result<()> {
    let purchase_order = &mut ctx.accounts.purchase_order;
    let clock = Clock::get()?;

    // Just update the status - transfer was already done in the frontend
    purchase_order.status = PurchaseOrderStatus::Approved;
    purchase_order.updated_at = clock.unix_timestamp;
    purchase_order.processed_by = Some(ctx.accounts.admin.key());

    msg!(
        "Purchase order marked as approved: {} tokens to {}",
        purchase_order.quantity,
        purchase_order.investor
    );

    Ok(())
}
