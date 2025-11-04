use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_interface::{self, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;
use crate::errors::*;

/// Executa a compra de forma automática e atômica
/// 1. Investor envia SOL para pool vault
/// 2. PDA escrow transfere tokens RWA para investor
/// 3. Tudo em 1 transação, sem aprovação manual
#[derive(Accounts)]
#[instruction(quantity: u64, price_per_token_lamports: u64, timestamp: i64)]
pub struct ExecutePurchase<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    /// Mint do token SRWA sendo comprado
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// PDA da purchase order (criado nesta transação)
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

    /// Pool vault que acumulará SOL (gerenciado pelo pool_distribution program)
    /// CHECK: Validado via constraint ou PDA
    #[account(mut)]
    pub pool_vault: SystemAccount<'info>,

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

    /// Token account do escrow PDA (origem dos tokens)
    #[account(
        mut,
        constraint = escrow_token_account.mint == mint.key(),
        constraint = escrow_token_account.owner == escrow_authority.key(),
        constraint = escrow_token_account.amount >= quantity @ PurchaseOrderError::InsufficientAdminTokens
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Token account do investor (destino dos tokens)
    #[account(
        mut,
        constraint = investor_token_account.mint == mint.key(),
        constraint = investor_token_account.owner == investor.key()
    )]
    pub investor_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ExecutePurchase>,
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

    msg!("=== Executing Purchase ===");
    msg!("Investor: {}", ctx.accounts.investor.key());
    msg!("Quantity: {} tokens", quantity);
    msg!("Price: {} lamports/token", price_per_token_lamports);
    msg!("Total: {} lamports ({} SOL)", total_lamports, total_lamports as f64 / 1e9);

    // PASSO 1: Transferir SOL do investor para o pool vault
    msg!("Step 1: Transferring {} SOL to pool vault", total_lamports as f64 / 1e9);
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.investor.to_account_info(),
                to: ctx.accounts.pool_vault.to_account_info(),
            },
        ),
        total_lamports,
    )?;

    // PASSO 2: Transferir tokens do escrow PDA para o investor
    msg!("Step 2: Transferring {} tokens to investor", quantity);
    let decimals = ctx.accounts.mint.decimals;

    // Seeds para assinar com o PDA
    let mint_key = ctx.accounts.mint.key();
    let seeds = &[
        b"token_escrow",
        mint_key.as_ref(),
        &[ctx.bumps.escrow_authority],
    ];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.investor_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
        signer_seeds,
    );

    token_interface::transfer_checked(transfer_ctx, quantity, decimals)?;

    // PASSO 3: Registrar a purchase order como "Approved"
    msg!("Step 3: Recording purchase order");
    let purchase_order = &mut ctx.accounts.purchase_order;
    purchase_order.bump = ctx.bumps.purchase_order;
    purchase_order.investor = ctx.accounts.investor.key();
    purchase_order.mint = ctx.accounts.mint.key();
    purchase_order.quantity = quantity;
    purchase_order.price_per_token_lamports = price_per_token_lamports;
    purchase_order.total_lamports = total_lamports;
    purchase_order.status = PurchaseOrderStatus::Approved; // Já aprovado automaticamente
    purchase_order.created_at = timestamp;
    purchase_order.updated_at = clock.unix_timestamp;
    purchase_order.processed_by = Some(ctx.accounts.escrow_authority.key()); // Processado pelo PDA escrow
    purchase_order.approval_tx = None; // Será preenchido pelo client
    purchase_order.reject_reason = None;

    // Emitir evento
    emit!(PurchaseExecuted {
        purchase_order: purchase_order.key(),
        investor: ctx.accounts.investor.key(),
        mint: ctx.accounts.mint.key(),
        quantity,
        total_lamports,
        pool_vault: ctx.accounts.pool_vault.key(),
        timestamp: clock.unix_timestamp,
    });

    msg!("✅ Purchase executed successfully!");
    msg!("   - Investor received {} tokens", quantity);
    msg!("   - Pool vault received {} SOL", total_lamports as f64 / 1e9);

    Ok(())
}

/// Evento emitido quando uma compra é executada automaticamente
#[event]
pub struct PurchaseExecuted {
    pub purchase_order: Pubkey,
    pub investor: Pubkey,
    pub mint: Pubkey,
    pub quantity: u64,
    pub total_lamports: u64,
    pub pool_vault: Pubkey,
    pub timestamp: i64,
}
