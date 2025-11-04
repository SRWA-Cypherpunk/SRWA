use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct DistributeToIssuer<'info> {
    /// Qualquer pessoa pode chamar esta instrução (permissionless)
    /// Mas apenas é executada se threshold for atingido
    #[account(mut)]
    pub caller: Signer<'info>,

    /// Configuração de distribuição
    #[account(
        mut,
        seeds = [
            DistributionConfig::SEED_PREFIX,
            distribution_config.mint.as_ref(),
        ],
        bump = distribution_config.bump,
    )]
    pub distribution_config: Account<'info, DistributionConfig>,

    /// Pool vault que contém SOL acumulado
    /// CHECK: Verificado via constraint de key match
    #[account(
        mut,
        constraint = pool_vault.key() == distribution_config.pool_vault @ DistributionError::Unauthorized
    )]
    pub pool_vault: SystemAccount<'info>,

    /// Issuer que receberá o SOL
    /// CHECK: Verificado via constraint de key match
    #[account(
        mut,
        constraint = issuer.key() == distribution_config.issuer @ DistributionError::Unauthorized
    )]
    pub issuer: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DistributeToIssuer>) -> Result<()> {
    let config = &mut ctx.accounts.distribution_config;
    let pool_vault = &ctx.accounts.pool_vault;
    let issuer = &ctx.accounts.issuer;
    let clock = Clock::get()?;

    // Verificar se pool vault tem saldo
    let pool_balance = pool_vault.lamports();
    require!(pool_balance > 0, DistributionError::PoolVaultEmpty);

    // Verificar se threshold foi atingido
    require!(
        pool_balance >= config.threshold,
        DistributionError::ThresholdNotMet
    );

    msg!(
        "Distributing {} lamports ({} SOL) from pool to issuer",
        pool_balance,
        pool_balance as f64 / 1_000_000_000.0
    );

    // Transferir TODO o saldo do pool vault para o issuer
    let transfer_amount = pool_balance;

    **pool_vault.to_account_info().try_borrow_mut_lamports()? = pool_vault
        .lamports()
        .checked_sub(transfer_amount)
        .ok_or(DistributionError::MathOverflow)?;

    **issuer.to_account_info().try_borrow_mut_lamports()? = issuer
        .lamports()
        .checked_add(transfer_amount)
        .ok_or(DistributionError::MathOverflow)?;

    // Atualizar estatísticas
    config.last_distribution = clock.unix_timestamp;
    config.total_distributed = config
        .total_distributed
        .checked_add(transfer_amount)
        .ok_or(DistributionError::MathOverflow)?;
    config.distribution_count = config
        .distribution_count
        .checked_add(1)
        .ok_or(DistributionError::MathOverflow)?;

    // Emitir evento
    emit!(SolDistributed {
        config: config.key(),
        mint: config.mint,
        issuer: config.issuer,
        amount: transfer_amount,
        timestamp: clock.unix_timestamp,
        distribution_number: config.distribution_count,
    });

    msg!(
        "✅ Distribution #{} completed: {} SOL → issuer {}",
        config.distribution_count,
        transfer_amount as f64 / 1_000_000_000.0,
        config.issuer
    );

    Ok(())
}
