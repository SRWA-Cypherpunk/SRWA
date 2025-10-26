use anchor_lang::prelude::*;

#[error_code]
pub enum PurchaseOrderError {
    #[msg("Purchase order já foi processada")]
    AlreadyProcessed,

    #[msg("Purchase order não está pendente")]
    NotPending,

    #[msg("Quantidade inválida (deve ser > 0)")]
    InvalidQuantity,

    #[msg("Preço inválido (deve ser > 0)")]
    InvalidPrice,

    #[msg("Apenas o investor pode cancelar")]
    UnauthorizedCancel,

    #[msg("Apenas admin pode aprovar/rejeitar")]
    UnauthorizedAdmin,

    #[msg("Saldo insuficiente de tokens do admin")]
    InsufficientAdminTokens,

    #[msg("Motivo de rejeição muito longo (max 200 chars)")]
    RejectReasonTooLong,

    #[msg("Overflow no cálculo do total")]
    MathOverflow,
}
