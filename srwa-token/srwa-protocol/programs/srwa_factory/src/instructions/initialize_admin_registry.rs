use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeAdminRegistry<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        init,
        payer = super_admin,
        space = 8 + PlatformAdminRegistry::INIT_SPACE,
        seeds = [b"admin_registry"],
        bump
    )]
    pub admin_registry: Account<'info, PlatformAdminRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeAdminRegistry>) -> Result<()> {
    let admin_registry = &mut ctx.accounts.admin_registry;
    let clock = Clock::get()?;

    admin_registry.super_admin = ctx.accounts.super_admin.key();
    admin_registry.authorized_admins = vec![ctx.accounts.super_admin.key()]; // Super admin é o primeiro autorizado
    admin_registry.created_at = clock.unix_timestamp;
    admin_registry.updated_at = clock.unix_timestamp;
    admin_registry.bump = ctx.bumps.admin_registry;

    msg!("Platform Admin Registry initialized with super admin: {}", ctx.accounts.super_admin.key());

    Ok(())
}
