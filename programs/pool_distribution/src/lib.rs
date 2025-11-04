use anchor_lang::prelude::*;

declare_id!("GBhbrpXQWfGTK6MSpbUUCMYh5X6hT5WWC66PDuiGx6Fm");

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;
use state::*;

#[program]
pub mod pool_distribution {
    use super::*;

    /// Inicializa a configuração de distribuição para um pool
    pub fn initialize(
        ctx: Context<Initialize>,
        threshold: u64,
        issuer: Pubkey,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, threshold, issuer)
    }

    /// Distribui SOL do pool vault para o issuer quando threshold é atingido
    /// Esta instrução pode ser chamada por qualquer pessoa (permissionless)
    pub fn distribute_to_issuer(ctx: Context<DistributeToIssuer>) -> Result<()> {
        instructions::distribute::handler(ctx)
    }

    /// Atualiza o threshold mínimo (apenas admin)
    pub fn update_threshold(
        ctx: Context<UpdateThreshold>,
        new_threshold: u64,
    ) -> Result<()> {
        instructions::update_threshold::handler(ctx, new_threshold)
    }

    /// Atualiza o endereço do issuer (apenas admin)
    pub fn update_issuer(
        ctx: Context<UpdateIssuer>,
        new_issuer: Pubkey,
    ) -> Result<()> {
        instructions::update_issuer::handler(ctx, new_issuer)
    }
}
