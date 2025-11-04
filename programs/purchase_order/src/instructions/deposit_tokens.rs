use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::token_interface::{TokenAccount, TokenInterface, Mint};
use anchor_spl::token_2022::spl_token_2022;

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

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, DepositTokens<'info>>,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, crate::errors::PurchaseOrderError::InvalidQuantity);

    msg!("=== Depositing Tokens to Escrow ===");
    msg!("Admin: {}", ctx.accounts.admin.key());
    msg!("Amount: {} tokens", amount);
    msg!("Escrow: {}", ctx.accounts.escrow_authority.key());
    msg!("Number of remaining accounts: {}", ctx.remaining_accounts.len());

    let decimals = ctx.accounts.mint.decimals;

    // Build complete account list for transfer with hooks
    // Standard transfer accounts + remaining accounts (transfer hook related)
    let mut account_infos = vec![
        ctx.accounts.admin_token_account.to_account_info(), // source
        ctx.accounts.mint.to_account_info(),                 // mint
        ctx.accounts.escrow_token_account.to_account_info(), // destination
        ctx.accounts.admin.to_account_info(),                // authority
        ctx.accounts.token_program.to_account_info(),        // token program
    ];

    // Add transfer hook accounts from remaining_accounts
    for acc in ctx.remaining_accounts.iter() {
        account_infos.push(acc.clone());
    }

    msg!("Total accounts for transfer: {}", account_infos.len());

    // Build the transfer instruction with all accounts
    let mut transfer_ix = spl_token_2022::instruction::transfer_checked(
        ctx.accounts.token_program.key,
        &ctx.accounts.admin_token_account.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.escrow_token_account.key(),
        &ctx.accounts.admin.key(),
        &[],
        amount,
        decimals,
    )?;

    // Manually add the transfer hook accounts to the instruction
    // These need to be in the instruction's account keys for Token-2022 to find them
    for acc in ctx.remaining_accounts.iter() {
        transfer_ix.accounts.push(solana_program::instruction::AccountMeta {
            pubkey: acc.key(),
            is_signer: acc.is_signer,
            is_writable: acc.is_writable,
        });
    }

    msg!("Invoking transfer with {} account keys", transfer_ix.accounts.len());

    // Invoke the transfer
    solana_program::program::invoke(
        &transfer_ix,
        &account_infos,
    )?;

    msg!("✅ Deposited {} tokens to escrow", amount);

    Ok(())
}
