import { Connection, PublicKey } from '@solana/web3.js';
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  getTransferFeeConfig,
  getMetadataPointerState,
  getPermanentDelegate,
  getTransferHook,
} from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const tokenMint = new PublicKey('EBYtnCDGYeaNLoLq6w9fKDjUkynHsHyX5MGZQoQMSxZs');

console.log('Checking Token-2022 extensions for:', tokenMint.toBase58());
console.log('');

const mintInfo = await getMint(connection, tokenMint, 'confirmed', TOKEN_2022_PROGRAM_ID);

console.log('=== BASIC INFO ===');
console.log('Decimals:', mintInfo.decimals);
console.log('Supply:', mintInfo.supply.toString());
console.log('TLV Data length:', mintInfo.tlvData?.length || 0, 'bytes');
console.log('');

console.log('=== CHECKING EXTENSIONS ===');

// Check TransferFeeConfig
try {
  const transferFeeConfig = getTransferFeeConfig(mintInfo);
  if (transferFeeConfig) {
    console.log('✅ TransferFeeConfig: ENABLED');
  }
} catch (e) {
  console.log('❌ TransferFeeConfig: Not present');
}

// Check MetadataPointer
try {
  const metadataPointer = getMetadataPointerState(mintInfo);
  if (metadataPointer) {
    console.log('✅ MetadataPointer: ENABLED');
    console.log('   Metadata Address:', metadataPointer.metadataAddress?.toBase58());
  }
} catch (e) {
  console.log('❌ MetadataPointer: Not present');
}

// Check PermanentDelegate - UNSUPPORTED BY RAYDIUM!
try {
  const permanentDelegate = getPermanentDelegate(mintInfo);
  if (permanentDelegate) {
    console.log('⚠️  PermanentDelegate: ENABLED ❌ UNSUPPORTED BY RAYDIUM CLMM!');
    console.log('   Delegate:', permanentDelegate.delegate?.toBase58());
  }
} catch (e) {
  console.log('✅ PermanentDelegate: Not present (good!)');
}

// Check TransferHook - UNSUPPORTED BY RAYDIUM!
try {
  const transferHook = getTransferHook(mintInfo);
  if (transferHook) {
    console.log('⚠️  TransferHook: ENABLED ❌ UNSUPPORTED BY RAYDIUM CLMM!');
    console.log('   Hook Program:', transferHook.programId?.toBase58());
  }
} catch (e) {
  console.log('✅ TransferHook: Not present (good!)');
}

console.log('');
console.log('=== SUMMARY ===');
console.log('Raydium CLMM does NOT support these Token-2022 extensions:');
console.log('  ❌ Permanent Delegate');
console.log('  ❌ Non-Transferable');
console.log('  ❌ Default Account State');
console.log('  ❌ Confidential Transfers');
console.log('  ❌ Transfer Hook');
console.log('');
console.log('If any of these are enabled on your token, you CANNOT use Raydium CLMM.');
