use anchor_lang::prelude::*;
use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct AddKYCProvider<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"kyc_registry"],
        bump = kyc_registry.bump,
        constraint = kyc_registry.authority == authority.key() @ SRWAError::Unauthorized
    )]
    pub kyc_registry: Account<'info, KYCProviderRegistry>,
}

pub fn handler(
    ctx: Context<AddKYCProvider>,
    provider_pubkey: Pubkey,
    name: String,
    metadata_uri: String,
) -> Result<()> {
    let kyc_registry = &mut ctx.accounts.kyc_registry;
    let clock = Clock::get()?;

    // Verifica se o provider já existe
    if kyc_registry.providers.iter().any(|p| p.provider_pubkey == provider_pubkey) {
        return Err(SRWAError::KYCProviderAlreadyExists.into());
    }

    // Adiciona o novo KYC provider
    let provider_info = KYCProviderInfo {
        provider_pubkey,
        name,
        metadata_uri,
        active: true,
        added_at: clock.unix_timestamp,
    };

    kyc_registry.providers.push(provider_info);

    msg!("KYC Provider added: {}", provider_pubkey);

    Ok(())
}
