use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("43iQGS4Xyg6aGcpL52n7KurMm5eVNvQKEtgdPSxZwKPU");

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;
use state::*;

#[program]
pub mod purchase_order {
    use super::*;

    /// Cria uma nova purchase order (investor envia SOL, espera aprovação do admin)
    pub fn create_purchase_order(
        ctx: Context<CreatePurchaseOrder>,
        quantity: u64,
        price_per_token_lamports: u64,
        timestamp: i64,
    ) -> Result<()> {
        instructions::create_purchase_order::handler(ctx, quantity, price_per_token_lamports, timestamp)
    }

    /// Admin aprova a purchase order e transfere os tokens
    pub fn approve_purchase_order(ctx: Context<ApprovePurchaseOrder>) -> Result<()> {
        instructions::approve_purchase_order::handler(ctx)
    }

    /// Admin rejeita a purchase order e reembolsa o SOL
    pub fn reject_purchase_order(
        ctx: Context<RejectPurchaseOrder>,
        reason: String,
    ) -> Result<()> {
        instructions::reject_purchase_order::handler(ctx, reason)
    }

    /// Investor cancela purchase order pendente (reembolso automático)
    pub fn cancel_purchase_order(ctx: Context<CancelPurchaseOrder>) -> Result<()> {
        instructions::cancel_purchase_order::handler(ctx)
    }

    /// Executa compra de forma automática e atômica
    /// SOL → pool vault, tokens → investor (tudo em 1 transação)
    pub fn execute_purchase(
        ctx: Context<ExecutePurchase>,
        quantity: u64,
        price_per_token_lamports: u64,
        timestamp: i64,
    ) -> Result<()> {
        instructions::execute_purchase::handler(ctx, quantity, price_per_token_lamports, timestamp)
    }
}
