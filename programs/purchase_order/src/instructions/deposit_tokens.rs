use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TokenAccount, TokenInterface, TransferChecked, Mint};

/// Deposita tokens do admin para a escrow account (PDA)
/// Apenas o admin pode fazer isso para adicionar liquidez
#[derive(Accounts)]
pub struct DepositTokens<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Mint do token SRWA
    pub mint: InterfaceAccount<'info, Mint>,

    /// PDA que controla os tokens para venda (escrow authority)
    /// CHECK: PDA seeds validation
    #[account(
        seeds = [
            b"token_escrow",
            mint.key().as_ref(),
        ],
        bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    /// Token account do admin (origem dos tokens)
    #[account(
        mut,
        constraint = admin_token_account.mint == mint.key(),
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Token account do escrow PDA (destino dos tokens)
    #[account(
        mut,
        constraint = escrow_token_account.mint == mint.key(),
        constraint = escrow_token_account.owner == escrow_authority.key()
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(
    ctx: Context<DepositTokens>,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, crate::errors::PurchaseOrderError::InvalidQuantity);

    msg!("=== Depositing Tokens to Escrow ===");
    msg!("Admin: {}", ctx.accounts.admin.key());
    msg!("Amount: {} tokens", amount);
    msg!("Escrow: {}", ctx.accounts.escrow_authority.key());

    let decimals = ctx.accounts.mint.decimals;

    // Transfer tokens from admin to escrow
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.admin_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    token_interface::transfer_checked(transfer_ctx, amount, decimals)?;

    msg!("✅ Deposited {} tokens to escrow", amount);

    Ok(())
}
