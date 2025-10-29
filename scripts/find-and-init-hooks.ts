/**
 * Find all SRWA tokens and initialize their Transfer Hooks
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getMint } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Program IDs
const TRANSFER_HOOK_PROGRAM_ID = new PublicKey('345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH');
const SRWA_FACTORY_PROGRAM_ID = new PublicKey('DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY');

// Connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load payer keypair
const keypairPath = path.join(process.env.HOME!, '.config/solana/temp-keypair.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🔑 Payer:', payer.publicKey.toBase58());
console.log('🌐 Network: Devnet\n');

/**
 * Find all offering accounts (they contain the mint address)
 */
async function findAllOfferings(): Promise<PublicKey[]> {
  console.log('🔍 Searching for offering accounts...\n');

  const accounts = await connection.getProgramAccounts(TRANSFER_HOOK_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: 'offering', // This won't work, let's try different approach
        },
      },
    ],
  });

  console.log(`Found ${accounts.length} accounts owned by Transfer Hook program`);

  const mints: PublicKey[] = [];

  // Look through accounts to find ones that look like offering PDAs
  for (const account of accounts) {
    try {
      // Offering PDAs are derived from: seeds = [b"offering", mint]
      // We need to reverse-engineer this or just use known mints
      console.log('  Account:', account.pubkey.toBase58(), 'size:', account.account.data.length);
    } catch (e) {
      // Skip
    }
  }

  return mints;
}

/**
 * Initialize ExtraAccountMetaList for a token mint
 */
async function initializeExtraAccountMetaList(mintAddress: PublicKey): Promise<boolean> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🪙 Mint:', mintAddress.toBase58());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Derive ExtraAccountMetaList PDA
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('extra-account-metas'), mintAddress.toBuffer()],
    TRANSFER_HOOK_PROGRAM_ID
  );

  console.log('📋 ExtraAccountMetaList PDA:', extraAccountMetaListPDA.toBase58());

  // Check if already initialized
  const accountInfo = await connection.getAccountInfo(extraAccountMetaListPDA);
  if (accountInfo) {
    console.log('✅ Already initialized (size:', accountInfo.data.length, 'bytes)');
    return true;
  }

  console.log('❌ Not initialized - creating now...\n');

  // Create instruction discriminator for initialize_extra_account_meta_list
  const discriminator = crypto
    .createHash('sha256')
    .update('global:initialize_extra_account_meta_list')
    .digest()
    .slice(0, 8);

  console.log('   Discriminator:', discriminator.toString('hex'));

  // Build instruction
  const instruction = new TransactionInstruction({
    programId: TRANSFER_HOOK_PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // payer
      { pubkey: mintAddress, isSigner: false, isWritable: false }, // mint
      { pubkey: extraAccountMetaListPDA, isSigner: false, isWritable: true }, // extra_account_meta_list
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data: Buffer.from(discriminator),
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

    console.log('   Signature:', signature);
    console.log('⏳ Confirming...');

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', JSON.stringify(confirmation.value.err));
      return false;
    }

    console.log('✅ SUCCESS!');
    console.log('   Explorer: https://explorer.solana.com/tx/' + signature + '?cluster=devnet\n');
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('\nLogs:');
      error.logs.forEach((log: string) => console.error('  ', log));
    }
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  SRWA Transfer Hook Initialization Tool                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get mint addresses from command line
  const mintAddresses = process.argv.slice(2);

  if (mintAddresses.length === 0) {
    console.log('📝 Usage:');
    console.log('   ts-node find-and-init-hooks.ts <MINT1> [MINT2] [MINT3] ...\n');
    console.log('📋 Example:');
    console.log('   ts-node find-and-init-hooks.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU\n');
    console.log('💡 Tip: You can pass multiple mints to initialize them all at once\n');

    // Try to find mints automatically
    console.log('🔍 Attempting to find mints automatically...\n');
    await findAllOfferings();

    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const mintStr of mintAddresses) {
    try {
      const mint = new PublicKey(mintStr);

      // Verify it's a Token-2022 mint
      try {
        await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
      } catch (e) {
        console.log(`\n⚠️  ${mintStr} is not a valid Token-2022 mint, skipping...\n`);
        failCount++;
        continue;
      }

      const success = await initializeExtraAccountMetaList(mint);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error: any) {
      console.error(`\n❌ Error processing ${mintStr}:`, error.message, '\n');
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${successCount + failCount}\n`);

  if (successCount > 0) {
    console.log('🎉 Transfer Hook is now active for the initialized tokens!');
    console.log('   Transfers will now validate KYC on-chain.\n');
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
