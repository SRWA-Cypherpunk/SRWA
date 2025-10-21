use anchor_lang::prelude::*;

#[error_code]
pub enum ComplianceError {
    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Jurisdiction not allowed")]
    JurisdictionDenied,

    #[msg("Address is sanctioned")]
    Sanctioned,

    #[msg("Accreditation required")]
    AccreditationRequired,

    #[msg("Lockup period active")]
    LockupActive,

    #[msg("Daily volume cap exceeded")]
    DailyCapExceeded,

    #[msg("Monthly volume cap exceeded")]
    MonthlyCapExceeded,

    #[msg("Transaction amount exceeds max")]
    MaxTxExceeded,

    #[msg("Transfer window closed")]
    WindowClosed,

    #[msg("Program not allowlisted")]
    ProgramNotAllowlisted,

    #[msg("Account not allowlisted")]
    AccountNotAllowlisted,

    #[msg("Investor limit exceeded")]
    InvestorLimitExceeded,
}
