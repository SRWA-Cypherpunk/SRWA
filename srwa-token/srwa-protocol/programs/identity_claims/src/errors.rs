use anchor_lang::prelude::*;

#[error_code]
pub enum IdentityError {
    #[msg("Unauthorized issuer")]
    UnauthorizedIssuer,

    #[msg("Claim already exists")]
    ClaimAlreadyExists,

    #[msg("Claim not found")]
    ClaimNotFound,

    #[msg("Claim expired")]
    ClaimExpired,

    #[msg("Claim revoked")]
    ClaimRevoked,

    #[msg("Invalid claim data")]
    InvalidClaimData,

    #[msg("Identity not verified")]
    NotVerified,

    #[msg("Missing required claim")]
    MissingRequiredClaim,
}
