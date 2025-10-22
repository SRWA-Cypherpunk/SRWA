use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
pub struct UpdateTrustedIssuer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = srwa_config.bump,
        has_one = mint,
        constraint = authority.key() == srwa_config.roles.issuer_admin
            || authority.key() == srwa_config.roles.compliance_officer @ SRWAError::Unauthorized
    )]
    pub srwa_config: Account<'info, SRWAConfig>,
}

pub fn handler(
    ctx: Context<UpdateTrustedIssuer>,
    topic: u32,
    issuer: Pubkey,
    add: bool,
) -> Result<()> {
    let srwa_config = &mut ctx.accounts.srwa_config;

    if add {
        // Add trusted issuer
        let entry = TrustedIssuerEntry { topic, issuer };

        // Check if already exists
        let exists = srwa_config.trusted_issuers_data
            .iter()
            .any(|e| e.topic == topic && e.issuer == issuer);

        require!(!exists, SRWAError::ModuleAlreadyEnabled);

        srwa_config.trusted_issuers_data.push(entry);
        msg!("Added trusted issuer {} for topic {}", issuer, topic);
    } else {
        // Remove trusted issuer
        srwa_config.trusted_issuers_data.retain(|e| !(e.topic == topic && e.issuer == issuer));
        msg!("Removed trusted issuer {} for topic {}", issuer, topic);
    }

    emit!(TrustedIssuerUpdated {
        mint: ctx.accounts.mint.key(),
        topic,
        issuer,
        added: add,
    });

    Ok(())
}
