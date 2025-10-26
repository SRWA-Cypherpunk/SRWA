use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ApprovePurchaseOrder<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Purchase order sendo aprovada
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

    /// Token account do admin (origem dos tokens)
    #[account(
        mut,
        constraint = admin_token_account.mint == purchase_order.mint,
        constraint = admin_token_account.amount >= purchase_order.quantity @ PurchaseOrderError::InsufficientAdminTokens
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    /// Token account do investor (destino dos tokens)
    #[account(
        mut,
        constraint = investor_token_account.mint == purchase_order.mint,
        constraint = investor_token_account.owner == purchase_order.investor
    )]
    pub investor_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ApprovePurchaseOrder>) -> Result<()> {
    let purchase_order = &mut ctx.accounts.purchase_order;
    let clock = Clock::get()?;

    // Transferir tokens do admin para o investor
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.admin_token_account.to_account_info(),
            to: ctx.accounts.investor_token_account.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        },
    );

    token::transfer(transfer_ctx, purchase_order.quantity)?;

    // Atualizar purchase order
    purchase_order.status = PurchaseOrderStatus::Approved;
    purchase_order.updated_at = clock.unix_timestamp;
    purchase_order.processed_by = Some(ctx.accounts.admin.key());

    // Armazenar a signature da transação (será definido pelo cliente)
    // purchase_order.approval_tx será preenchido no frontend após a confirmação

    msg!(
        "Purchase order aprovada: {} tokens transferidos para {}",
        purchase_order.quantity,
        purchase_order.investor
    );

    Ok(())
}
