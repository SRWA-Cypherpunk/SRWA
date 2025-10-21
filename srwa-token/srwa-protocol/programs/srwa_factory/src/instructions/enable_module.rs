use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*};

#[derive(Accounts)]
pub struct UpdateModule<'info> {
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
    ctx: Context<UpdateModule>,
    module_id: u8,
    params: Vec<u8>,
) -> Result<()> {
    let srwa_config = &mut ctx.accounts.srwa_config;

    let module = module_id_to_enum(module_id)?;

    // Check if already enabled
    require!(
        !srwa_config.modules_enabled.contains(&module),
        SRWAError::ModuleAlreadyEnabled
    );

    srwa_config.modules_enabled.push(module);

    // Append params
    srwa_config.params_by_module.extend(params);

    emit!(ModuleUpdated {
        mint: ctx.accounts.mint.key(),
        module_id,
        enabled: true,
    });

    msg!("Enabled module: {:?}", module);

    Ok(())
}

fn module_id_to_enum(id: u8) -> Result<ModuleId> {
    match id {
        0 => Ok(ModuleId::Jurisdiction),
        1 => Ok(ModuleId::Sanctions),
        2 => Ok(ModuleId::Accredited),
        3 => Ok(ModuleId::Lockup),
        4 => Ok(ModuleId::MaxHolders),
        5 => Ok(ModuleId::VolumeCaps),
        6 => Ok(ModuleId::TransferWindow),
        7 => Ok(ModuleId::ProgramAllowlist),
        8 => Ok(ModuleId::AccountAllowlist),
        9 => Ok(ModuleId::OfferingRules),
        10 => Ok(ModuleId::InvestorLimits),
        _ => Err(error!(SRWAError::InvalidModule)),
    }
}
