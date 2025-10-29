import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const tokenMint = new PublicKey('J8SWkk6CuJWFwBuwKJX9gRCMXSRncvgsWNuHqgCFqAYB');
const TRANSFER_HOOK_PROGRAM = new PublicKey('345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH');
const SRWA_FACTORY_PROGRAM = new PublicKey('DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY');

// Check PDAs in Transfer Hook program
const [configTH] = PublicKey.findProgramAddressSync(
  [Buffer.from('srwa_config'), tokenMint.toBuffer()],
  TRANSFER_HOOK_PROGRAM
);

const [offeringTH] = PublicKey.findProgramAddressSync(
  [Buffer.from('offering'), tokenMint.toBuffer()],
  TRANSFER_HOOK_PROGRAM
);

// Check PDAs in SRWA Factory program
const [configSF] = PublicKey.findProgramAddressSync(
  [Buffer.from('srwa_config'), tokenMint.toBuffer()],
  SRWA_FACTORY_PROGRAM
);

const [offeringSF] = PublicKey.findProgramAddressSync(
  [Buffer.from('offering'), tokenMint.toBuffer()],
  SRWA_FACTORY_PROGRAM
);

console.log('Transfer Hook Program PDAs:');
console.log('  Config:', configTH.toBase58());
const configTHInfo = await connection.getAccountInfo(configTH);
console.log('  Exists:', configTHInfo ? 'YES' : 'NO');

console.log('  Offering:', offeringTH.toBase58());
const offeringTHInfo = await connection.getAccountInfo(offeringTH);
console.log('  Exists:', offeringTHInfo ? 'YES' : 'NO');

console.log('\nSRWA Factory Program PDAs:');
console.log('  Config:', configSF.toBase58());
const configSFInfo = await connection.getAccountInfo(configSF);
console.log('  Exists:', configSFInfo ? 'YES ✅' : 'NO');

console.log('  Offering:', offeringSF.toBase58());
const offeringSFInfo = await connection.getAccountInfo(offeringSF);
console.log('  Exists:', offeringSFInfo ? 'YES ✅' : 'NO');
