use anchor_lang::{prelude::*, system_program};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(reason: String)]
pub struct RejectPurchaseOrder<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Purchase order sendo rejeitada
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

    /// Vault do admin que retornará o SOL
    /// CHECK: Deve ser a mesma conta que recebeu o SOL originalmente
    #[account(
        mut,
        constraint = admin_vault.key() == admin.key() @ PurchaseOrderError::AdminVaultMismatch
    )]
    pub admin_vault: UncheckedAccount<'info>,

    /// Investor que receberá o reembolso
    /// CHECK: Validado pelo PDA
    #[account(
        mut,
        constraint = investor.key() == purchase_order.investor
    )]
    pub investor: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RejectPurchaseOrder>, reason: String) -> Result<()> {
    require!(
        reason.len() <= 200,
        PurchaseOrderError::RejectReasonTooLong
    );

    let purchase_order = &mut ctx.accounts.purchase_order;
    let clock = Clock::get()?;
    let refund_amount = purchase_order.total_lamports;

    // Reembolsar SOL utilizando transferência do System Program
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.admin.to_account_info(),
                to: ctx.accounts.investor.to_account_info(),
            },
        ),
        refund_amount,
    )?;

    // Atualizar purchase order
    purchase_order.status = PurchaseOrderStatus::Rejected;
    purchase_order.updated_at = clock.unix_timestamp;
    purchase_order.processed_by = Some(ctx.accounts.admin.key());
    purchase_order.reject_reason = Some(reason.clone());

    msg!(
        "Purchase order rejeitada: {} SOL reembolsados. Motivo: {}",
        purchase_order.total_lamports,
        reason
    );

    Ok(())
}
