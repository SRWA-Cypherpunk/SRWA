/**
 * Initialize KYC Registry for a user on localnet
 */

import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { homedir } from 'os';
import { join } from 'path';

// Program IDs
const SRWA_CONTROLLER_PROGRAM_ID = new PublicKey('GVs5Qi56CR9a6V2fUtXZ6Z99XK57yYa5DM5dECBW2AWZ');

// Connection
const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

// Load authority keypair
const keypairPath = join(homedir(), '.config/solana/id.json');
const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'));
const authority = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🔑 Authority:', authority.publicKey.toBase58());
console.log('🌐 Network: Localnet\n');

/**
 * Initialize KYC Registry for a user
 */
async function initializeKycRegistry(userPubkey, kycCompleted = true, isActive = true) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 User:', userPubkey.toBase58());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Derive KYC Registry PDA (seeds: "kyc" + user_pubkey)
  const [kycRegistryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('kyc'), userPubkey.toBuffer()],
    SRWA_CONTROLLER_PROGRAM_ID
  );

  console.log('📋 KYC Registry PDA:', kycRegistryPDA.toBase58());

  // Check if already initialized
  const accountInfo = await connection.getAccountInfo(kycRegistryPDA);
  if (accountInfo) {
    console.log('✅ Already initialized (size:', accountInfo.data.length, 'bytes)');
    console.log('   KYC Status: Already registered\n');
    return true;
  }

  console.log('❌ Not initialized - creating now...\n');

  // Create instruction discriminator
  const discriminator = createHash('sha256')
    .update('global:initialize_kyc_registry')
    .digest()
    .slice(0, 8);

  console.log('   Discriminator:', discriminator.toString('hex'));
  console.log('   KYC Completed:', kycCompleted);
  console.log('   Is Active:', isActive);

  // Encode arguments (kyc_completed: bool, is_active: bool)
  const argsBuffer = Buffer.alloc(2);
  argsBuffer.writeUInt8(kycCompleted ? 1 : 0, 0);
  argsBuffer.writeUInt8(isActive ? 1 : 0, 1);

  const data = Buffer.concat([discriminator, argsBuffer]);

  // Build instruction
  const instruction = new TransactionInstruction({
    programId: SRWA_CONTROLLER_PROGRAM_ID,
    keys: [
      { pubkey: authority.publicKey, isSigner: true, isWritable: true },
      { pubkey: userPubkey, isSigner: false, isWritable: false },
      { pubkey: kycRegistryPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = authority.publicKey;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  console.log('\n📤 Sending transaction...');

  try {
    const signature = await connection.sendTransaction(transaction, [authority], {
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
    console.log('   User:', userPubkey.toBase58());
    console.log('   KYC Registry:', kycRegistryPDA.toBase58());
    console.log('   KYC Completed:', kycCompleted);
    console.log('   Is Active:', isActive);
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
const userAddress = process.argv[2];
const kycCompleted = process.argv[3] !== 'false'; // Default true
const isActive = process.argv[4] !== 'false'; // Default true

if (!userAddress) {
  console.error('Usage: node init-kyc-localnet.mjs <USER_ADDRESS> [kyc_completed] [is_active]\n');
  console.error('Example:');
  console.error('  node init-kyc-localnet.mjs CeJv6a4eD5Bfoc26zbJ91GgBNyFpT7hZni7pgeYjSyAo true true\n');
  console.error('Parameters:');
  console.error('  USER_ADDRESS    - Public key of the user to initialize KYC for');
  console.error('  kyc_completed   - (optional) true/false, default: true');
  console.error('  is_active       - (optional) true/false, default: true\n');
  process.exit(1);
}

try {
  const user = new PublicKey(userAddress);
  await initializeKycRegistry(user, kycCompleted, isActive);

  console.log('\n🎉 KYC Registry initialized!');
  console.log('   User can now participate in token transfers.\n');
} catch (error) {
  console.error('\n💥 Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
