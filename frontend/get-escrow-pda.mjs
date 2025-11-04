import { PublicKey } from '@solana/web3.js';

const PURCHASE_ORDER_PROGRAM_ID = new PublicKey('6KCm2iNZHz79PhiG66ZkCq6GSFoy2WUjkFeEqmrygyUv');
const MINT = new PublicKey('EVY2C7k6Y2FmRYHtMEN7WYfAjnXiKeexxvz6YA5M8TKP');

const [escrowAuthority, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from('token_escrow'), MINT.toBuffer()],
  PURCHASE_ORDER_PROGRAM_ID
);

console.log('Escrow Authority PDA:', escrowAuthority.toBase58());
console.log('Bump:', bump);
