use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
};
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

declare_id!("A6JtsR3Zw1GB1gTJuqdpFiBijarm9pQRTgqVkZaEdBs3");

#[program]
pub mod srwa_controller {
    use super::*;

    /// Initialize the ExtraAccountMetaList account
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // Define 2 extra accounts: KYC Registry PDAs derivados DESTE programa
        // Agora podemos usar seeds porque os PDAs são do Transfer Hook program!
        let account_metas = vec![
            // Sender KYC Registry (index 0 after base accounts)
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal { bytes: b"kyc".to_vec() },
                    Seed::AccountKey { index: 3 }, // authority (sender owner)
                ],
                false, // not signer
                false, // not writable
            )?,
            // Recipient KYC Registry (index 1 after base accounts)
            // Usamos o destination token account para extrair o owner
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal { bytes: b"kyc".to_vec() },
                    Seed::AccountData {
                        account_index: 2, // destination token account
                        data_index: 32,   // owner field offset
                        length: 32,       // pubkey length
                    },
                ],
                false, // not signer
                false, // not writable
            )?,
        ];

        // Initialize the ExtraAccountMetaList account
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())?;
        let lamports = Rent::get()?.minimum_balance(account_size);

        let mint = ctx.accounts.mint.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"extra-account-metas",
            &mint.as_ref(),
            &[ctx.bumps.extra_account_meta_list],
        ]];

        // Create the account
        create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.extra_account_meta_list.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            lamports,
            account_size as u64,
            ctx.program_id,
        )?;

        // Initialize the account data
        let mut data = ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?;
        ExtraAccountMetaList::init::<ExecuteInstruction>(&mut data, &account_metas)?;

        msg!("✅ ExtraAccountMetaList initialized with dynamic KYC validation");
        Ok(())
    }

    /// Initialize KYC Registry for a user
    pub fn initialize_kyc_registry(
        ctx: Context<InitializeKYCRegistry>,
        kyc_completed: bool,
        is_active: bool,
    ) -> Result<()> {
        let kyc_registry = &mut ctx.accounts.kyc_registry;

        kyc_registry.user = ctx.accounts.user.key();
        kyc_registry.kyc_completed = kyc_completed;
        kyc_registry.is_active = is_active;
        kyc_registry.updated_at = Clock::get()?.unix_timestamp;
        kyc_registry.bump = ctx.bumps.kyc_registry;

        msg!("✅ KYC Registry initialized for {}", ctx.accounts.user.key());
        msg!("  - KYC completed: {}", kyc_completed);
        msg!("  - Is active: {}", is_active);

        Ok(())
    }

    /// Update KYC status for existing registry
    pub fn update_kyc_status(
        ctx: Context<UpdateKYCStatus>,
        kyc_completed: bool,
        is_active: bool,
    ) -> Result<()> {
        let kyc_registry = &mut ctx.accounts.kyc_registry;

        kyc_registry.kyc_completed = kyc_completed;
        kyc_registry.is_active = is_active;
        kyc_registry.updated_at = Clock::get()?.unix_timestamp;

        msg!("✅ KYC status updated for {}", kyc_registry.user);
        msg!("  - KYC completed: {}", kyc_completed);
        msg!("  - Is active: {}", is_active);

        Ok(())
    }

    /// Transfer Hook - validates KYC for both sender and recipient
    #[interface(spl_transfer_hook_interface::execute)]
    pub fn transfer_hook<'info>(
        ctx: Context<'_, '_, '_, 'info, TransferHook<'info>>,
        amount: u64
    ) -> Result<()> {
        msg!("🔒 Transfer Hook: Validating KYC for {} tokens", amount);

        // Get remaining accounts (KYC registries passed via ExtraAccountMetaList)
        let remaining_accounts = ctx.remaining_accounts;

        require!(
            remaining_accounts.len() >= 2,
            ControllerError::MissingKYCAccounts
        );

        let sender_kyc = &remaining_accounts[0];
        let recipient_kyc = &remaining_accounts[1];

        msg!("👤 Sender KYC: {}", sender_kyc.key());
        msg!("👤 Recipient KYC: {}", recipient_kyc.key());

        // Validate sender KYC
        validate_kyc_account(sender_kyc, "Sender")?;

        // Validate recipient KYC
        validate_kyc_account(recipient_kyc, "Recipient")?;

        msg!("✅ Transfer approved - Both parties have active KYC");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: The mint account
    pub mint: UncheckedAccount<'info>,

    /// CHECK: ExtraAccountMetaList Account
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeKYCRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: User to initialize KYC for
    pub user: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 1 + 8 + 1, // discriminator + pubkey + 2 bools + i64 + bump
        seeds = [b"kyc", user.key().as_ref()],
        bump
    )]
    pub kyc_registry: Account<'info, KYCRegistry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateKYCStatus<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"kyc", kyc_registry.user.as_ref()],
        bump = kyc_registry.bump
    )]
    pub kyc_registry: Account<'info, KYCRegistry>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: Source token account
    pub source_token: UncheckedAccount<'info>,

    /// CHECK: Mint
    pub mint: UncheckedAccount<'info>,

    /// CHECK: Destination token account
    pub destination_token: UncheckedAccount<'info>,

    /// CHECK: Authority
    pub authority: UncheckedAccount<'info>,

    /// CHECK: ExtraAccountMetaList
    pub extra_account_meta_list: UncheckedAccount<'info>,
}

// KYC Registry Account (owned by Transfer Hook program)
#[account]
pub struct KYCRegistry {
    pub user: Pubkey,        // 32
    pub kyc_completed: bool,  // 1
    pub is_active: bool,      // 1
    pub updated_at: i64,      // 8
    pub bump: u8,             // 1
}

// Validate KYC by reading KYC Registry account
fn validate_kyc_account(account: &AccountInfo, label: &str) -> Result<()> {
    // Verify account has data
    let data = account.try_borrow_data()?;

    require!(
        data.len() >= 8 + 43, // discriminator + KYCRegistry size
        ControllerError::InvalidKYCAccount
    );

    // Deserialize KYCRegistry (skip 8-byte discriminator)
    let kyc_registry: KYCRegistry = AnchorDeserialize::deserialize(&mut &data[8..])?;

    msg!("  {} KYC status:", label);
    msg!("    - Completed: {}", kyc_registry.kyc_completed);
    msg!("    - Active: {}", kyc_registry.is_active);

    // Validate KYC completed and user is active
    require!(
        kyc_registry.kyc_completed,
        ControllerError::KYCNotCompleted
    );

    require!(
        kyc_registry.is_active,
        ControllerError::UserNotActive
    );

    Ok(())
}

#[error_code]
pub enum ControllerError {
    #[msg("Missing KYC accounts in remaining_accounts")]
    MissingKYCAccounts,
    #[msg("Invalid KYC account")]
    InvalidKYCAccount,
    #[msg("KYC not completed")]
    KYCNotCompleted,
    #[msg("User is not active")]
    UserNotActive,
}
