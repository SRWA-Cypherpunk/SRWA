use anchor_lang::prelude::*;
use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct RemovePlatformAdmin<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"admin_registry"],
        bump = admin_registry.bump,
        constraint = admin_registry.super_admin == super_admin.key() @ SRWAError::Unauthorized
    )]
    pub admin_registry: Account<'info, PlatformAdminRegistry>,
}

pub fn handler(ctx: Context<RemovePlatformAdmin>, admin_to_remove: Pubkey) -> Result<()> {
    let admin_registry = &mut ctx.accounts.admin_registry;
    let clock = Clock::get()?;

    // Não pode remover o super admin
    if admin_to_remove == admin_registry.super_admin {
        return Err(SRWAError::CannotRemoveSuperAdmin.into());
    }

    // Remove o admin da lista
    admin_registry.authorized_admins.retain(|&admin| admin != admin_to_remove);
    admin_registry.updated_at = clock.unix_timestamp;

    msg!("Platform admin removed: {}", admin_to_remove);

    Ok(())
}
