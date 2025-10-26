use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct CancelPurchaseOrder<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    /// Purchase order sendo cancelada
    #[account(
        mut,
        seeds = [
            PurchaseOrder::SEED_PREFIX,
            purchase_order.mint.as_ref(),
            purchase_order.investor.as_ref(),
            &purchase_order.created_at.to_le_bytes()
        ],
        bump = purchase_order.bump,
        constraint = purchase_order.status == PurchaseOrderStatus::Pending @ PurchaseOrderError::NotPending,
        constraint = purchase_order.investor == investor.key() @ PurchaseOrderError::UnauthorizedCancel
    )]
    pub purchase_order: Account<'info, PurchaseOrder>,

    /// Vault do admin que retornará o SOL
    /// CHECK: Deve ser a mesma conta que recebeu o SOL originalmente
    #[account(mut)]
    pub admin_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CancelPurchaseOrder>) -> Result<()> {
    let purchase_order = &mut ctx.accounts.purchase_order;
    let clock = Clock::get()?;

    // Reembolsar SOL do admin vault para o investor
    **ctx.accounts.admin_vault.try_borrow_mut_lamports()? -= purchase_order.total_lamports;
    **ctx.accounts.investor.try_borrow_mut_lamports()? += purchase_order.total_lamports;

    // Atualizar purchase order
    purchase_order.status = PurchaseOrderStatus::Cancelled;
    purchase_order.updated_at = clock.unix_timestamp;

    msg!(
        "Purchase order cancelada pelo investor: {} SOL reembolsados",
        purchase_order.total_lamports
    );

    Ok(())
}
