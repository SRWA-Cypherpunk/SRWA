#!/usr/bin/env tsx

/**
 * Script para criar feed Switchboard On-Demand na Solana Devnet
 *
 * Uso: npx tsx scripts/create-switchboard-feed.ts
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Queue, PullFeed } from '@switchboard-xyz/on-demand';
import * as fs from 'fs';
import * as path from 'path';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const SWITCHBOARD_DEVNET_PROGRAM = new PublicKey('SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv'); // Switchboard On-Demand Program

async function main() {
  console.log('🔧 Criando feed Switchboard On-Demand na devnet...\n');

  // 1. Conectar à devnet
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  console.log('✅ Conectado à devnet');

  // 2. Carregar keypair (usa a keypair padrão do Solana CLI)
  const keypairPath = path.join(process.env.HOME || '', '.config/solana/temp-keypair.json');

  let payer: Keypair;
  try {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    console.log(`✅ Keypair carregada: ${payer.publicKey.toBase58()}`);
  } catch (error) {
    console.error('❌ Erro ao carregar keypair:', error);
    console.log('\n💡 Certifique-se de que existe uma keypair em:', keypairPath);
    process.exit(1);
  }

  // 3. Verificar saldo
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Saldo: ${balance / 1e9} SOL`);

  if (balance < 0.1 * 1e9) {
    console.error('❌ Saldo insuficiente. Você precisa de pelo menos 0.1 SOL');
    console.log('Execute: solana airdrop 1');
    process.exit(1);
  }

  // 4. Carregar Queue (devnet default queue)
  const DEVNET_QUEUE = new PublicKey('FfD96yeXs4cxZshoPPSKhSPgVQxLAJUT3gefgh84m1Di');

  console.log('\n📊 Criando feed On-Demand para SOL/USD...');

  try {
    // Oracle Jobs para agregar múltiplas fontes de preço
    const jobs = [
      // Job 1: CoinGecko
      {
        name: 'CoinGecko SOL/USD',
        tasks: [
          {
            httpTask: {
              url: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
            },
          },
          {
            jsonParseTask: {
              path: '$.solana.usd',
            },
          },
        ],
      },
    ];

    console.log('📝 Jobs configurados:');
    jobs.forEach((job, i) => console.log(`   ${i + 1}. ${job.name}`));

    // Criar o feed
    console.log('\n📤 Criando feed...');

    const [pullFeed, feedKeypair] = PullFeed.generate(SWITCHBOARD_DEVNET_PROGRAM);

    const initTx = await PullFeed.initTx({
      program: SWITCHBOARD_DEVNET_PROGRAM,
      feed: pullFeed,
      queue: DEVNET_QUEUE,
      authority: payer.publicKey,
      maxVariance: 1.0,
      minResponses: 1,
      name: Buffer.from('SOL/USD SRWA Feed'),
      jobs: jobs.map(j => Buffer.from(JSON.stringify(j))),
      connection,
    });

    console.log('\n📤 Enviando transação...');

    // Assinar e enviar
    initTx.sign([payer, feedKeypair]);
    const tx = await connection.sendRawTransaction(initTx.serialize(), {
      skipPreflight: false,
    });

    console.log('⏳ Aguardando confirmação...');
    await connection.confirmTransaction(tx, 'confirmed');

    console.log('\n✅ SUCESSO! Feed Switchboard criado!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Feed Address: ${pullFeed.toBase58()}`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Use este endereço no campo "Switchboard Feed" do formulário Solend:');
    console.log(`   ${pullFeed.toBase58()}\n`);

    // Salvar endereço do feed em arquivo
    const outputPath = path.join(__dirname, '..', 'switchboard-feed.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        feedAddress: pullFeed.toBase58(),
        name: 'SOL/USD SRWA Feed',
        createdAt: new Date().toISOString(),
        transaction: tx,
        queue: DEVNET_QUEUE.toBase58(),
      }, null, 2)
    );
    console.log(`💾 Detalhes salvos em: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao criar feed:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
