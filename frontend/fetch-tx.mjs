import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const txSig = '5gfqtd6x8WQJrWxt6m6Zy689G73EEKzydygFxNiLHUhg7raneKkC8fcE1ZpWFqHkphhSzt7bY9HuHMfRkp1ngw2H';

try {
  console.log('Fetching transaction...');
  const tx = await connection.getTransaction(txSig, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  });

  if (!tx) {
    console.log('Transaction not found');
    process.exit(1);
  }

  console.log('\n=== TRANSACTION STATUS ===');
  console.log('Status:', tx.meta?.err ? 'FAILED' : 'SUCCESS');

  if (tx.meta?.err) {
    console.log('\n=== ERROR ===');
    console.log(JSON.stringify(tx.meta.err, null, 2));
  }

  console.log('\n=== PROGRAM LOGS ===');
  if (tx.meta?.logMessages) {
    tx.meta.logMessages.forEach((log, i) => {
      console.log(`${i}: ${log}`);
    });
  }

  console.log('\n=== INSTRUCTIONS ===');
  console.log('Number of instructions:', tx.transaction.message.compiledInstructions?.length || 0);

} catch (error) {
  console.error('Error fetching transaction:', error);
  process.exit(1);
}
