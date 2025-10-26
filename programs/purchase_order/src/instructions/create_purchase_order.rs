use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(quantity: u64, price_per_token_lamports: u64, timestamp: i64)]
pub struct CreatePurchaseOrder<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    /// Mint do token SRWA sendo comprado
    pub mint: Account<'info, anchor_spl::token::Mint>,

    /// PDA da purchase order
    /// Derivado de: [b"purchase_order", mint, investor, timestamp]
    #[account(
        init,
        payer = investor,
        space = PurchaseOrder::space(),
        seeds = [
            PurchaseOrder::SEED_PREFIX,
            mint.key().as_ref(),
            investor.key().as_ref(),
            &timestamp.to_le_bytes()
        ],
        bump
    )]
    pub purchase_order: Account<'info, PurchaseOrder>,

    /// Vault do admin que receberá o SOL
    /// CHECK: Validado manualmente (pode ser qualquer conta)
    #[account(mut)]
    pub admin_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePurchaseOrder>,
    quantity: u64,
    price_per_token_lamports: u64,
    timestamp: i64,
) -> Result<()> {
    require!(quantity > 0, PurchaseOrderError::InvalidQuantity);
    require!(price_per_token_lamports > 0, PurchaseOrderError::InvalidPrice);

    // Calcular total em lamports
    let total_lamports = (quantity as u128)
        .checked_mul(price_per_token_lamports as u128)
        .ok_or(PurchaseOrderError::MathOverflow)?
        .try_into()
        .map_err(|_| PurchaseOrderError::MathOverflow)?;

    let clock = Clock::get()?;

    // Transferir SOL do investor para o admin vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.investor.to_account_info(),
                to: ctx.accounts.admin_vault.to_account_info(),
            },
        ),
        total_lamports,
    )?;

    // Inicializar a purchase order
    let purchase_order = &mut ctx.accounts.purchase_order;
    purchase_order.bump = ctx.bumps.purchase_order;
    purchase_order.investor = ctx.accounts.investor.key();
    purchase_order.mint = ctx.accounts.mint.key();
    purchase_order.quantity = quantity;
    purchase_order.price_per_token_lamports = price_per_token_lamports;
    purchase_order.total_lamports = total_lamports;
    purchase_order.status = PurchaseOrderStatus::Pending;
    purchase_order.created_at = timestamp;
    purchase_order.updated_at = clock.unix_timestamp;
    purchase_order.processed_by = None;
    purchase_order.approval_tx = None;
    purchase_order.reject_reason = None;

    msg!(
        "Purchase order criada: {} {} tokens por {} lamports cada",
        quantity,
        ctx.accounts.mint.key(),
        price_per_token_lamports
    );

    Ok(())
}
