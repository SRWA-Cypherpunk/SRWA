use anchor_lang::prelude::*;

#[error_code]
pub enum SRWAError {
    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Invalid phase for this operation")]
    InvalidPhase,

    #[msg("Soft cap not reached")]
    SoftCapNotReached,

    #[msg("Over subscription limit")]
    OverSubscription,

    #[msg("KYC verification missing")]
    KycMissing,

    #[msg("Accreditation required")]
    AccreditationRequired,

    #[msg("Jurisdiction denied")]
    JurisdictionDenied,

    #[msg("Address is sanctioned")]
    Sanctioned,

    #[msg("Lockup period active")]
    LockupActive,

    #[msg("Cap exceeded")]
    CapExceeded,

    #[msg("Transfer window closed")]
    WindowClosed,

    #[msg("Program or account not allowlisted")]
    NotAllowlisted,

    #[msg("Oracle price is stale")]
    OracleStale,

    #[msg("Oracle confidence too high")]
    ConfidenceTooHigh,

    #[msg("Invalid module ID")]
    InvalidModule,

    #[msg("Module already enabled")]
    ModuleAlreadyEnabled,

    #[msg("Module not enabled")]
    ModuleNotEnabled,

    #[msg("Invalid timestamp")]
    InvalidTimestamp,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Maximum capacity reached")]
    MaxCapacityReached,

    #[msg("Minimum ticket not met")]
    MinTicketNotMet,

    #[msg("Per investor cap exceeded")]
    PerInvestorCapExceeded,

    #[msg("Request is not in pending state")]
    RequestNotPending,

    #[msg("Mint provided does not match the stored request mint")]
    MintMismatch,
    #[msg("Mint account has invalid owner")]
    MintInvalidOwner,

    #[msg("Reject reason exceeds maximum length")]
    RejectReasonTooLong,

    #[msg("Expected PDA bump is missing")]
    AccountBumpMissing,

    #[msg("Token name is too long")]
    TokenNameTooLong,

    #[msg("Token symbol is too long")]
    TokenSymbolTooLong,

    #[msg("Admin already exists in the allowlist")]
    AdminAlreadyExists,

    #[msg("Cannot remove the super admin")]
    CannotRemoveSuperAdmin,

    #[msg("Admin is not in the allowlist")]
    AdminNotInAllowlist,

    #[msg("KYC provider not found")]
    KYCProviderNotFound,

    #[msg("KYC provider already exists")]
    KYCProviderAlreadyExists,

    #[msg("Invalid KYC provider")]
    InvalidKYCProvider,

    #[msg("Investor does not have required KYC claims")]
    MissingKYCClaims,

    #[msg("KYC provider is not approved for this token")]
    KYCProviderNotApproved,

    #[msg("Failed to initialize token-2022 mint")]
    MintInitializationFailed,
}
