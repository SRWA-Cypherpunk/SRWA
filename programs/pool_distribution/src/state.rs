use anchor_lang::prelude::*;

/// Configuração de distribuição para um pool específico
#[account]
pub struct DistributionConfig {
    /// Bump seed para o PDA
    pub bump: u8,

    /// Admin que pode atualizar configurações
    pub authority: Pubkey,

    /// Mint do token SRWA associado a este pool
    pub mint: Pubkey,

    /// Pool vault que acumula SOL das compras
    pub pool_vault: Pubkey,

    /// Issuer que recebe SOL quando threshold é atingido
    pub issuer: Pubkey,

    /// Threshold mínimo em lamports para distribuição
    /// Ex: 100 SOL = 100_000_000_000 lamports
    pub threshold: u64,

    /// Timestamp da última distribuição
    pub last_distribution: i64,

    /// Total de SOL distribuído até agora
    pub total_distributed: u64,

    /// Número de distribuições realizadas
    pub distribution_count: u64,
}

impl DistributionConfig {
    pub const SEED_PREFIX: &'static [u8] = b"distribution_config";

    /// Tamanho do account
    /// 8 (discriminator) + 1 (bump) + 32 (authority) + 32 (mint) + 32 (pool_vault) +
    /// 32 (issuer) + 8 (threshold) + 8 (last_distribution) + 8 (total_distributed) +
    /// 8 (distribution_count)
    pub const SIZE: usize = 8 + 1 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8;
}

/// Evento emitido quando SOL é distribuído para o issuer
#[event]
pub struct SolDistributed {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub issuer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub distribution_number: u64,
}

/// Evento emitido quando a configuração é atualizada
#[event]
pub struct ConfigUpdated {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub field: String,
    pub timestamp: i64,
}
