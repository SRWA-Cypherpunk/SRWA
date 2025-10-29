import { Connection, PublicKey } from '@solana/web3.js';
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  getTransferFeeConfig,
  getMetadataPointerState,
  getPermanentDelegate,
  getTransferHook,
  getDefaultAccountState,
  getConfidentialTransferMint,
  getNonTransferable,
} from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const tokenMint = new PublicKey('EBYtnCDGYeaNLoLq6w9fKDjUkynHsHyX5MGZQoQMSxZs');

console.log('Checking Token-2022 extensions for:', tokenMint.toBase58());
console.log('');

const mintInfo = await getMint(connection, tokenMint, 'confirmed', TOKEN_2022_PROGRAM_ID);

console.log('=== BASIC INFO ===');
console.log('Decimals:', mintInfo.decimals);
console.log('Supply:', mintInfo.supply.toString());
console.log('');

console.log('=== CHECKING EXTENSIONS ===');

// Check TransferFeeConfig
try {
  const transferFeeConfig = getTransferFeeConfig(mintInfo);
  if (transferFeeConfig) {
    console.log('✅ TransferFeeConfig: ENABLED');
    console.log('   Fee:', transferFeeConfig);
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

// Check PermanentDelegate
try {
  const permanentDelegate = getPermanentDelegate(mintInfo);
  if (permanentDelegate) {
    console.log('⚠️  PermanentDelegate: ENABLED (UNSUPPORTED BY RAYDIUM CLMM!)');
    console.log('   Delegate:', permanentDelegate.delegate?.toBase58());
  }
} catch (e) {
  console.log('❌ PermanentDelegate: Not present');
}

// Check TransferHook
try {
  const transferHook = getTransferHook(mintInfo);
  if (transferHook) {
    console.log('⚠️  TransferHook: ENABLED (UNSUPPORTED BY RAYDIUM CLMM!)');
    console.log('   Hook Program:', transferHook.programId?.toBase58());
  }
} catch (e) {
  console.log('❌ TransferHook: Not present');
}

// Check DefaultAccountState
try {
  const defaultAccountState = getDefaultAccountState(mintInfo);
  if (defaultAccountState) {
    console.log('⚠️  DefaultAccountState: ENABLED (UNSUPPORTED BY RAYDIUM CLMM!)');
    console.log('   State:', defaultAccountState.state);
  }
} catch (e) {
  console.log('❌ DefaultAccountState: Not present');
}

// Check ConfidentialTransfer
try {
  const confidentialTransfer = getConfidentialTransferMint(mintInfo);
  if (confidentialTransfer) {
    console.log('⚠️  ConfidentialTransferMint: ENABLED (UNSUPPORTED BY RAYDIUM CLMM!)');
  }
} catch (e) {
  console.log('❌ ConfidentialTransferMint: Not present');
}

// Check NonTransferable
try {
  const nonTransferable = getNonTransferable(mintInfo);
  if (nonTransferable) {
    console.log('⚠️  NonTransferable: ENABLED (UNSUPPORTED BY RAYDIUM CLMM!)');
  }
} catch (e) {
  console.log('❌ NonTransferable: Not present');
}

console.log('');
console.log('=== RAYDIUM CLMM COMPATIBILITY ===');
console.log('According to Raydium docs, CLMM does NOT support:');
console.log('  - Permanent Delegate');
console.log('  - Non-Transferable');
console.log('  - Default Account State');
console.log('  - Confidential Transfers');
console.log('  - Transfer Hook');
