use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PurchaseOrder {
    /// Bump seed para o PDA
    pub bump: u8,

    /// Investor que está comprando
    pub investor: Pubkey,

    /// Mint do token SRWA sendo comprado
    pub mint: Pubkey,

    /// Quantidade de tokens solicitados (em unidades base)
    pub quantity: u64,

    /// Preço por token em lamports
    pub price_per_token_lamports: u64,

    /// Total em SOL (lamports) que o investor pagou
    pub total_lamports: u64,

    /// Status da purchase order
    pub status: PurchaseOrderStatus,

    /// Timestamp de criação
    pub created_at: i64,

    /// Timestamp de atualização
    pub updated_at: i64,

    /// Admin que aprovou/rejeitou (se aplicável)
    pub processed_by: Option<Pubkey>,

    /// Transaction signature da aprovação (se aprovado)
    pub approval_tx: Option<[u8; 64]>,

    /// Motivo da rejeição (se rejeitado)
    #[max_len(200)]
    pub reject_reason: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PurchaseOrderStatus {
    Pending,
    Approved,
    Rejected,
    Cancelled,
}

impl Default for PurchaseOrderStatus {
    fn default() -> Self {
        PurchaseOrderStatus::Pending
    }
}

impl PurchaseOrder {
    pub const SEED_PREFIX: &'static [u8] = b"purchase_order";

    /// Calcula o espaço necessário para a conta
    pub const fn space() -> usize {
        8 + // discriminator
        1 + // bump
        32 + // investor
        32 + // mint
        8 + // quantity
        8 + // price_per_token_lamports
        8 + // total_lamports
        1 + // status enum
        8 + // created_at
        8 + // updated_at
        (1 + 32) + // processed_by Option<Pubkey>
        (1 + 64) + // approval_tx Option<[u8; 64]>
        (1 + 4 + 200) // reject_reason Option<String> max 200 chars
    }
}
