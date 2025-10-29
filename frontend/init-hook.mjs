/**
 * Initialize ExtraAccountMetaList for SRWA Token Transfer Hook
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

/**
 * Initialize ExtraAccountMetaList for a token mint
 */
async function initializeExtraAccountMetaList(mintAddress) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    console.log('✅ Already initialized (size:', accountInfo.data.length, 'bytes)\n');
    return true;
  }

  console.log('❌ Not initialized - creating now...\n');

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
      return false;
    }

    console.log('✅ SUCCESS!');
    console.log('   Explorer: https://explorer.solana.com/tx/' + signature + '?cluster=devnet\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('\nLogs:');
      error.logs.forEach((log) => console.error('  ', log));
    }
    return false;
  }
}

// Main
const mintAddress = process.argv[2];

if (!mintAddress) {
  console.error('Usage: node init-hook.mjs <MINT_ADDRESS>\n');
  console.error('Example:');
  console.error('  node init-hook.mjs 29LWmE2Ni7dw14BZqRH1sJ2GRYVSvG1DKQ9mLPsWn28q\n');
  process.exit(1);
}

try {
  const mint = new PublicKey(mintAddress);

  // Verify it's a Token-2022 mint
  console.log('🔍 Verifying Token-2022 mint...');
  const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
  console.log('   Decimals:', mintInfo.decimals);
  console.log('   Supply:', mintInfo.supply.toString());
  console.log('   ✅ Valid Token-2022\n');

  await initializeExtraAccountMetaList(mint);

  console.log('🎉 Transfer Hook is now active!');
  console.log('   Transfers will validate KYC on-chain.\n');
} catch (error) {
  console.error('\n💥 Error:', error.message);
  process.exit(1);
}
