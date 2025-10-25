use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct VerifyInvestorKYC<'info> {
    pub investor: Signer<'info>,

    #[account(
        seeds = [b"issuer_kyc", mint.as_ref()],
        bump = issuer_kyc_config.bump,
    )]
    pub issuer_kyc_config: Account<'info, IssuerKYCConfig>,

    /// CHECK: Identity account from identity_claims program
    pub investor_identity: UncheckedAccount<'info>,

    /// CHECK: Identity claims program
    pub identity_claims_program: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<VerifyInvestorKYC>, mint: Pubkey) -> Result<bool> {
    let issuer_kyc_config = &ctx.accounts.issuer_kyc_config;

    // Se KYC não é obrigatório, retorna true
    if !issuer_kyc_config.require_kyc {
        return Ok(true);
    }

    // TODO: Implementar CPI para identity_claims para verificar se o investor
    // tem claims válidos dos providers aprovados para os topics necessários

    // Por enquanto, vamos simular a verificação
    // Na implementação real, isso faria um CPI para identity_claims::is_verified
    // verificando se o investor tem claims válidos de um dos approved_providers
    // para todos os required_claim_topics

    msg!("Verifying KYC for investor: {} on mint: {}", ctx.accounts.investor.key(), mint);
    msg!("Required topics: {:?}", issuer_kyc_config.required_claim_topics);
    msg!("Approved providers: {:?}", issuer_kyc_config.approved_providers);

    // Retorna true temporariamente - será implementado com CPI real
    Ok(true)
}
