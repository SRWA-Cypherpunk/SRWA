/**
 * Script to initialize ExtraAccountMetaList for existing SRWA tokens
 * This must be run once for each token mint to enable Transfer Hook
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Program IDs
const TRANSFER_HOOK_PROGRAM_ID = new PublicKey('345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH');
const SRWA_FACTORY_PROGRAM_ID = new PublicKey('DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY');

// Connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load payer keypair
const keypairPath = path.join(process.env.HOME!, '.config/solana/temp-keypair.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('Payer:', payer.publicKey.toBase58());

/**
 * Initialize ExtraAccountMetaList for a token mint
 */
async function initializeExtraAccountMetaList(mintAddress: PublicKey) {
  console.log('\n========================================');
  console.log('Initializing Transfer Hook for mint:', mintAddress.toBase58());
  console.log('========================================\n');

  // Derive ExtraAccountMetaList PDA
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('extra-account-metas'), mintAddress.toBuffer()],
    TRANSFER_HOOK_PROGRAM_ID
  );

  console.log('ExtraAccountMetaList PDA:', extraAccountMetaListPDA.toBase58());

  // Check if already initialized
  const accountInfo = await connection.getAccountInfo(extraAccountMetaListPDA);
  if (accountInfo) {
    console.log('✅ ExtraAccountMetaList already initialized!');
    console.log('   Owner:', accountInfo.owner.toBase58());
    console.log('   Size:', accountInfo.data.length, 'bytes');
    return;
  }

  console.log('📝 Creating ExtraAccountMetaList account...');

  // Load the IDL to get instruction discriminator
  const idlPath = path.join(__dirname, '../target/idl/srwa_controller.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));

  // Find the instruction discriminator for initialize_extra_account_meta_list
  const instruction = idl.instructions.find(
    (ix: any) => ix.name === 'initializeExtraAccountMetaList'
  );

  if (!instruction) {
    throw new Error('Could not find initializeExtraAccountMetaList instruction in IDL');
  }

  // Create instruction discriminator (first 8 bytes of SHA256 of "global:initialize_extra_account_meta_list")
  const crypto = await import('crypto');
  const discriminator = crypto
    .createHash('sha256')
    .update('global:initialize_extra_account_meta_list')
    .digest()
    .slice(0, 8);

  console.log('Instruction discriminator:', discriminator.toString('hex'));

  // Create instruction data (just the discriminator, no args)
  const instructionData = Buffer.from(discriminator);

  // Build transaction
  const instruction = new TransactionInstruction({
    programId: TRANSFER_HOOK_PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // payer
      { pubkey: mintAddress, isSigner: false, isWritable: false }, // mint
      { pubkey: extraAccountMetaListPDA, isSigner: false, isWritable: true }, // extra_account_meta_list
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = payer.publicKey;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  console.log('📤 Sending transaction...');

  try {
    const signature = await connection.sendTransaction(transaction, [payer], {
      skipPreflight: false,
    });

    console.log('⏳ Confirming transaction...');
    console.log('   Signature:', signature);

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ ExtraAccountMetaList initialized successfully!');
    console.log('   PDA:', extraAccountMetaListPDA.toBase58());
    console.log('   Signature:', signature);
    console.log('   Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('Logs:');
      error.logs.forEach((log: string) => console.error('  ', log));
    }
    throw error;
  }
}

// Import TransactionInstruction
import { TransactionInstruction } from '@solana/web3.js';

// Main execution
async function main() {
  // Get mint address from command line or prompt user
  const mintAddress = process.argv[2];

  if (!mintAddress) {
    console.error('Usage: ts-node initialize-transfer-hook.ts <MINT_ADDRESS>');
    console.error('\nExample:');
    console.error(
      '  ts-node initialize-transfer-hook.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    );
    process.exit(1);
  }

  try {
    const mint = new PublicKey(mintAddress);
    await initializeExtraAccountMetaList(mint);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
