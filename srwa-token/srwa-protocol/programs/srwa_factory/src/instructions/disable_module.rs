use anchor_lang::prelude::*;
use crate::{state::*, events::*, errors::*, instructions::enable_module::UpdateModule};

pub fn handler(
    ctx: Context<UpdateModule>,
    module_id: u8,
) -> Result<()> {
    let srwa_config = &mut ctx.accounts.srwa_config;

    let module = module_id_to_enum(module_id)?;

    // Check if enabled
    require!(
        srwa_config.modules_enabled.contains(&module),
        SRWAError::ModuleNotEnabled
    );

    srwa_config.modules_enabled.retain(|&m| m != module);

    emit!(ModuleUpdated {
        mint: ctx.accounts.mint.key(),
        module_id,
        enabled: false,
    });

    msg!("Disabled module: {:?}", module);

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
