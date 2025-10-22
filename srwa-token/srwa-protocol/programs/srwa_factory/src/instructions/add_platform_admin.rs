use anchor_lang::prelude::*;
use crate::{state::*, errors::*};

#[derive(Accounts)]
pub struct AddPlatformAdmin<'info> {
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

pub fn handler(ctx: Context<AddPlatformAdmin>, new_admin: Pubkey) -> Result<()> {
    let admin_registry = &mut ctx.accounts.admin_registry;
    let clock = Clock::get()?;

    // Verifica se o admin já está na lista
    if admin_registry.authorized_admins.contains(&new_admin) {
        return Err(SRWAError::AdminAlreadyExists.into());
    }

    // Adiciona o novo admin
    admin_registry.authorized_admins.push(new_admin);
    admin_registry.updated_at = clock.unix_timestamp;

    msg!("Platform admin added: {}", new_admin);

    Ok(())
}
