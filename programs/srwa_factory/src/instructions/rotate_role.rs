use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
pub struct RotateRole<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Mint account
    /// CHECK: Mint account
    pub mint: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"srwa_config", mint.key().as_ref()],
        bump = srwa_config.bump,
        has_one = mint,
        constraint = authority.key() == srwa_config.roles.issuer_admin @ SRWAError::Unauthorized
    )]
    pub srwa_config: Account<'info, SRWAConfig>,
}

pub fn handler(
    ctx: Context<RotateRole>,
    role: RoleType,
    new_pubkey: Pubkey,
) -> Result<()> {
    let srwa_config = &mut ctx.accounts.srwa_config;

    let (old_pubkey, role_name) = match role {
        RoleType::IssuerAdmin => {
            let old = srwa_config.roles.issuer_admin;
            srwa_config.roles.issuer_admin = new_pubkey;
            (old, "issuer_admin")
        }
        RoleType::ComplianceOfficer => {
            let old = srwa_config.roles.compliance_officer;
            srwa_config.roles.compliance_officer = new_pubkey;
            (old, "compliance_officer")
        }
        RoleType::TransferAgent => {
            let old = srwa_config.roles.transfer_agent;
            srwa_config.roles.transfer_agent = new_pubkey;
            (old, "transfer_agent")
        }
    };

    emit!(RoleRotated {
        mint: ctx.accounts.mint.key(),
        role_type: role_name.to_string(),
        old_pubkey,
        new_pubkey,
    });

    msg!("Role {} rotated from {} to {}", role_name, old_pubkey, new_pubkey);

    Ok(())
}
