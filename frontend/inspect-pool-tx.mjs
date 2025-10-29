import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const txId = '2UCJHnMhk93APhzTM3z26ZxLDV3urAcfWRuDSzq4nUZzQAsPtUdspGWTStFu6utFAgjTznPgUC8wHanRqqzixrsF';

console.log('Fetching transaction:', txId);

const txInfo = await connection.getTransaction(txId, {
  maxSupportedTransactionVersion: 0,
  commitment: 'confirmed',
});

if (!txInfo) {
  console.error('Transaction not found!');
  process.exit(1);
}

console.log('\n=== TRANSACTION INFO ===');
console.log('Slot:', txInfo.slot);
console.log('Block Time:', new Date(txInfo.blockTime * 1000).toISOString());

const message = txInfo.transaction.message;
const accountKeys = message.staticAccountKeys || [];

console.log('\n=== ALL ACCOUNTS IN TRANSACTION ===');
accountKeys.forEach((key, index) => {
  console.log(`${index}: ${key.toBase58()}`);
});

console.log('\n=== INNER INSTRUCTIONS ===');
if (txInfo.meta?.innerInstructions) {
  txInfo.meta.innerInstructions.forEach((inner, idx) => {
    console.log(`\nInner instruction ${idx}:`);
    inner.instructions.forEach((ix, ixIdx) => {
      console.log(`  Instruction ${ixIdx}:`, ix);
    });
  });
}

console.log('\n=== POST TOKEN BALANCES ===');
if (txInfo.meta?.postTokenBalances) {
  txInfo.meta.postTokenBalances.forEach((balance, idx) => {
    console.log(`Account ${balance.accountIndex}:`, balance);
  });
}

console.log('\n=== LOGS ===');
if (txInfo.meta?.logMessages) {
  txInfo.meta.logMessages.forEach(log => console.log(log));
}

// Known addresses to exclude
const knownAddresses = [
  'DRaycpLY18LhpbydsBWbVJtxpNv9oXPgjRSfpF2bWpYb', // CPMM program
  'So11111111111111111111111111111111111111112', // WSOL
  '11111111111111111111111111111111', // System program
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token program
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', // Token-2022
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
  'SysvarRent111111111111111111111111111111111', // Sysvar Rent
  'SysvarC1ock11111111111111111111111111111111', // Sysvar Clock
];

console.log('\n=== POTENTIAL POOL ADDRESSES (excluding known programs) ===');
accountKeys.forEach((key, index) => {
  const address = key.toBase58();
  if (!knownAddresses.includes(address)) {
    console.log(`${index}: ${address}`);
  }
});
