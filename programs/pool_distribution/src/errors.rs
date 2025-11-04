use anchor_lang::prelude::*;

#[error_code]
pub enum DistributionError {
    #[msg("Threshold não foi atingido. Pool balance deve ser >= threshold configurado")]
    ThresholdNotMet,

    #[msg("Pool vault está vazio, não há SOL para distribuir")]
    PoolVaultEmpty,

    #[msg("Threshold deve ser maior que zero")]
    InvalidThreshold,

    #[msg("Apenas o admin pode executar esta ação")]
    Unauthorized,

    #[msg("Overflow no cálculo")]
    MathOverflow,

    #[msg("Pool vault deve ter saldo positivo")]
    InsufficientBalance,
}
