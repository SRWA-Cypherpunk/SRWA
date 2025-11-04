import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

console.log('🔍 Searching for Token-2022 mints on localnet...\n');

// Get program accounts for Token-2022
// Note: We're getting all Token-2022 accounts, then filtering for mints
const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID);

// Mints typically have owner = Token-2022 and data length >= 82
const mints = accounts.filter(acc => acc.account.data.length >= 82 && acc.account.data.length < 500);

if (mints.length === 0) {
  console.log('❌ No Token-2022 mints found on localnet');
  console.log('   Did you deploy your tokens yet?');
} else {
  console.log(`✅ Found ${mints.length} Token-2022 mint(s):\n`);
  mints.forEach((mint, i) => {
    console.log(`${i + 1}. ${mint.pubkey.toString()}`);
  });
  console.log('\n💡 Use one of these mint addresses with:');
  console.log('   node init-hook-localnet.mjs <MINT_ADDRESS>');
}
