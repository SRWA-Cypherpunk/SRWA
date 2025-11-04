import { Connection } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getMint, unpackMint } from '@solana/spl-token';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

console.log('🔍 Searching for Token-2022 mints on localnet...\n');

// Get all Token-2022 accounts
const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID);

console.log(`Found ${accounts.length} total Token-2022 accounts\n`);

const mints = [];

for (const account of accounts) {
  try {
    // Try to unpack as a mint
    const mintData = unpackMint(account.pubkey, account.account, TOKEN_2022_PROGRAM_ID);
    mints.push({
      address: account.pubkey.toString(),
      decimals: mintData.decimals,
      supply: mintData.supply.toString(),
    });
  } catch (e) {
    // Not a mint, skip
  }
}

if (mints.length === 0) {
  console.log('❌ No Token-2022 mints found on localnet');
  console.log('   You need to create a Token-2022 mint first.');
} else {
  console.log(`✅ Found ${mints.length} Token-2022 mint(s):\n`);
  mints.forEach((mint, i) => {
    console.log(`${i + 1}. ${mint.address}`);
    console.log(`   Decimals: ${mint.decimals}, Supply: ${mint.supply}\n`);
  });
  console.log('💡 Use one of these mint addresses with:');
  console.log('   node init-hook-localnet.mjs <MINT_ADDRESS>');
}
