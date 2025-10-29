use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
};
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};
use std::str::FromStr;

declare_id!("345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH");

#[program]
pub mod srwa_controller {
    use super::*;

    /// Initialize the ExtraAccountMetaList account
    /// This stores the list of extra accounts needed by the transfer hook
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // Define the extra accounts needed for KYC validation
        // Usamos AccountKey direto - o frontend passará os endereços manualmente
        let srwa_factory_program = srwa_factory_program_id();

        let account_metas = vec![
            // SRWA Factory Program (necessário para derivar os PDAs)
            ExtraAccountMeta::new_with_pubkey(&srwa_factory_program, false, false)?,
            // Sender User Registry - será passado manualmente pelo frontend
            // Usa AccountKey com index 5 (será a 6ª conta extra, depois das 4 base + program_id)
            ExtraAccountMeta::new_external_pda_with_seeds(
                0, // index do SRWA Factory program (primeiro extra account)
                &[
                    Seed::Literal {
                        bytes: b"user_registry".to_vec(),
                    },
                    Seed::AccountKey { index: 3 }, // authority/sender (4ª conta base)
                ],
                false,
                false,
            )?,
            // Destination User Registry
            ExtraAccountMeta::new_external_pda_with_seeds(
                0, // index do SRWA Factory program
                &[
                    Seed::Literal {
                        bytes: b"user_registry".to_vec(),
                    },
                    Seed::AccountKey { index: 2 }, // destination owner (3ª conta base)
                ],
                false,
                false,
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

        msg!("Extra account meta list initialized");
        Ok(())
    }

    /// Transfer Hook - called automatically on every transfer
    /// Simplified version: validates only KYC
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        msg!("Transfer Hook: Validating transfer of {} tokens", amount);

        // Deserialize User Registries only
        let sender_data = ctx.accounts.sender_user_registry.try_borrow_data()?;
        let recipient_data = ctx.accounts.recipient_user_registry.try_borrow_data()?;

        // Skip discriminator (8 bytes) and deserialize
        let sender_user_registry: UserRegistry = AnchorDeserialize::deserialize(&mut &sender_data[8..])?;
        let recipient_user_registry: UserRegistry = AnchorDeserialize::deserialize(&mut &recipient_data[8..])?;

        // KYC verification for sender
        require!(
            sender_user_registry.kyc_completed
                && sender_user_registry.is_active,
            ControllerError::KYCFailed
        );

        // KYC verification for recipient
        require!(
            recipient_user_registry.kyc_completed
                && recipient_user_registry.is_active,
            ControllerError::KYCFailed
        );

        msg!("✅ Transfer validation passed - KYC OK for both parties");
        Ok(())
    }

    // Fallback instruction for transfer hook interface
    pub fn fallback<'info>(
        _program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;

        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let account_info_iter = &mut accounts.iter();

                let _source_account_info = next_account_info(account_info_iter)?;
                let _mint_info = next_account_info(account_info_iter)?;
                let _destination_account_info = next_account_info(account_info_iter)?;
                let _authority_info = next_account_info(account_info_iter)?;
                let _extra_account_meta_list_info = next_account_info(account_info_iter)?;
                let sender_user_registry_info = next_account_info(account_info_iter)?;
                let recipient_user_registry_info = next_account_info(account_info_iter)?;

                // Manual KYC validation
                let sender_user_registry = Account::<UserRegistry>::try_from(sender_user_registry_info)?;
                let recipient_user_registry = Account::<UserRegistry>::try_from(recipient_user_registry_info)?;

                msg!("Transfer Hook: Validating transfer of {} tokens", amount);

                // KYC verification for sender
                require!(
                    sender_user_registry.kyc_completed
                        && sender_user_registry.is_active,
                    ControllerError::KYCFailed
                );

                // KYC verification for recipient
                require!(
                    recipient_user_registry.kyc_completed
                        && recipient_user_registry.is_active,
                    ControllerError::KYCFailed
                );

                msg!("✅ Transfer validation passed - KYC OK for both parties");
                Ok(())
            }
            _ => Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: The mint account
    pub mint: UncheckedAccount<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use these seeds
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
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
    pub authority: Signer<'info>,

    /// CHECK: ExtraAccountMetaList
    pub extra_account_meta_list: UncheckedAccount<'info>,

    /// CHECK: Sender User Registry PDA (from SRWA Factory)
    pub sender_user_registry: UncheckedAccount<'info>,

    /// CHECK: Recipient User Registry PDA (from SRWA Factory)
    pub recipient_user_registry: UncheckedAccount<'info>,
}

// Helper function to get SRWA Factory program ID
fn srwa_factory_program_id() -> Pubkey {
    Pubkey::from_str("DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY")
        .expect("Invalid SRWA Factory program ID")
}

// Account structs (imported from SRWA Factory)
#[account]
pub struct SRWAConfig {
    pub paused: bool,
    pub modules_enabled: Vec<ModuleId>,
    pub required_topics: Vec<u8>,
    pub token_controls: TokenControls,
    pub roles: Roles,
    pub bump: u8,
}

#[account]
pub struct OfferingState {
    pub phase: OfferingPhase,
    pub window: TransferWindow,
    pub rules: OfferingRules,
    pub funding: FundingState,
    pub bump: u8,
}

#[account]
pub struct UserRegistry {
    pub user: Pubkey,
    pub role: UserRole,
    pub registered_at: i64,
    pub kyc_completed: bool,
    pub is_active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OfferingPhase {
    OfferOpen,
    OfferLocked,
    OfferClosed,
    Settlement,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct TransferWindow {
    pub start_ts: i64,
    pub end_ts: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct OfferingRules {
    pub min_ticket: u64,
    pub max_investors: u32,
    pub per_investor_cap: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct FundingState {
    pub investors: u32,
    pub total_raised: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct TokenControls {
    pub default_frozen: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct Roles {
    pub issuer_admin: Pubkey,
    pub compliance_officer: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ModuleId {
    TransferWindow,
    OfferingRules,
    InvestorLimits,
    AccountAllowlist,
    ProgramAllowlist,
    Sanctions,
    Jurisdiction,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum UserRole {
    Issuer,
    Investor,
    Admin,
}

#[error_code]
pub enum ControllerError {
    #[msg("Transfers are currently paused")]
    TransferPaused,
    #[msg("KYC verification failed")]
    KYCFailed,
    #[msg("Transfer window is closed")]
    WindowClosed,
    #[msg("Offering rules violated")]
    OfferingRulesViolated,
    #[msg("Investor limit exceeded")]
    InvestorLimitExceeded,
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
}
