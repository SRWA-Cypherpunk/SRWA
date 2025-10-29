/**
 * Delete and reinitialize ExtraAccountMetaList with new structure
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getMint } from '@solana/spl-token';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { homedir } from 'os';
import { join } from 'path';

// Program IDs
const TRANSFER_HOOK_PROGRAM_ID = new PublicKey('345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH');

// Connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load payer keypair
const keypairPath = join(homedir(), '.config/solana/temp-keypair.json');
const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🔑 Payer:', payer.publicKey.toBase58());
console.log('🌐 Network: Devnet\n');

async function reinitializeExtraAccountMetaList(mintAddress) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🪙 Mint:', mintAddress.toBase58());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Derive ExtraAccountMetaList PDA
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('extra-account-metas'), mintAddress.toBuffer()],
    TRANSFER_HOOK_PROGRAM_ID
  );

  console.log('📋 ExtraAccountMetaList PDA:', extraAccountMetaListPDA.toBase58());

  // Check if exists
  const accountInfo = await connection.getAccountInfo(extraAccountMetaListPDA);

  if (accountInfo) {
    console.log('⚠️  Account exists (size:', accountInfo.data.length, 'bytes)');
    console.log('🗑️  Deleting old account...\n');

    // Create transaction to close the account and reclaim lamports
    const closeInstruction = new TransactionInstruction({
      programId: SystemProgram.programId,
      keys: [
        { pubkey: extraAccountMetaListPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: false, isWritable: true },
      ],
      data: Buffer.alloc(0), // Empty instruction won't work, we need to use transfer
    });

    // Actually, we can't close a PDA account directly. We need to use a CPI from the owning program.
    // Let's just recreate with the same PDA - the initialize instruction should handle it.
    console.log('⚠️  Cannot delete PDA directly. Will try to reinitialize...\n');
  } else {
    console.log('✅ Account does not exist, will create new\n');
  }

  // Create instruction discriminator
  const discriminator = createHash('sha256')
    .update('global:initialize_extra_account_meta_list')
    .digest()
    .slice(0, 8);

  console.log('   Discriminator:', discriminator.toString('hex'));

  // Build instruction
  const instruction = new TransactionInstruction({
    programId: TRANSFER_HOOK_PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: mintAddress, isSigner: false, isWritable: false },
      { pubkey: extraAccountMetaListPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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

      // If it failed because account already exists, that's actually OK for older accounts
      if (JSON.stringify(confirmation.value.err).includes('already in use')) {
        console.log('\n⚠️  Account already exists with old structure.');
        console.log('💡 Solution: Create a NEW token instead of using this one.\n');
      }

      return false;
    }

    console.log('✅ SUCCESS!');
    console.log('   Explorer: https://explorer.solana.com/tx/' + signature + '?cluster=devnet\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('already in use') || error.message.includes('0x0')) {
      console.log('\n⚠️  Account already initialized with old structure.');
      console.log('💡 SOLUTION: Create a NEW SRWA token via Issuer.');
      console.log('   The new token will use the updated Transfer Hook structure.\n');
    } else if (error.logs) {
      console.error('\nLogs:');
      error.logs.forEach((log) => console.error('  ', log));
    }

    return false;
  }
}

// Main
const mintAddress = process.argv[2];

if (!mintAddress) {
  console.error('Usage: node reinit-hook.mjs <MINT_ADDRESS>\n');
  process.exit(1);
}

try {
  const mint = new PublicKey(mintAddress);
  console.log('🔍 Verifying Token-2022 mint...');
  await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
  console.log('   ✅ Valid Token-2022\n');

  const success = await reinitializeExtraAccountMetaList(mint);

  if (!success) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   ACTION REQUIRED: Create a new SRWA token');
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. Go to Issuer Dashboard');
    console.log('2. Create a new token');
    console.log('3. After creation, run: node init-hook.mjs <NEW_MINT>');
    console.log('4. Test with the new token\n');
    process.exit(1);
  }

  console.log('🎉 Transfer Hook updated successfully!');
  console.log('   Now using SRWA Factory program for PDAs.\n');
} catch (error) {
  console.error('\n💥 Error:', error.message);
  process.exit(1);
}
