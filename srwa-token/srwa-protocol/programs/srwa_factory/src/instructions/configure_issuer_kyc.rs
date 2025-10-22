use anchor_lang::prelude::*;
use crate::{state::*, errors::*};

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct ConfigureIssuerKYC<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        seeds = [b"kyc_registry"],
        bump = kyc_registry.bump,
    )]
    pub kyc_registry: Account<'info, KYCProviderRegistry>,

    #[account(
        init_if_needed,
        payer = issuer,
        space = 8 + IssuerKYCConfig::INIT_SPACE,
        seeds = [b"issuer_kyc", mint.as_ref()],
        bump
    )]
    pub issuer_kyc_config: Account<'info, IssuerKYCConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ConfigureIssuerKYC>,
    mint: Pubkey,
    approved_providers: Vec<Pubkey>,
    required_claim_topics: Vec<u32>,
    require_kyc: bool,
) -> Result<()> {
    let issuer_kyc_config = &mut ctx.accounts.issuer_kyc_config;
    let kyc_registry = &ctx.accounts.kyc_registry;

    // Verifica se todos os providers estão registrados
    for provider in &approved_providers {
        if !kyc_registry.providers.iter().any(|p| p.provider_pubkey == *provider && p.active) {
            return Err(SRWAError::InvalidKYCProvider.into());
        }
    }

    issuer_kyc_config.mint = mint;
    issuer_kyc_config.issuer = ctx.accounts.issuer.key();
    issuer_kyc_config.approved_providers = approved_providers;
    issuer_kyc_config.required_claim_topics = required_claim_topics;
    issuer_kyc_config.require_kyc = require_kyc;
    issuer_kyc_config.bump = ctx.bumps.issuer_kyc_config;

    msg!("Issuer KYC configuration updated for mint: {}", mint);

    Ok(())
}
