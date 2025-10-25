import { PublicKey } from '@solana/web3.js';

export const SOLEND_DEVNET_PROGRAM_ID = new PublicKey('ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx');
export const SOLEND_MAINNET_PROGRAM_ID = new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo');

export const PYTH_DEVNET_PROGRAM_ID = new PublicKey('gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s');
export const SWITCHBOARD_DEVNET_PROGRAM_ID = new PublicKey('7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU');

export const NULL_ORACLE = new PublicKey('nu11111111111111111111111111111111111111111');

export function getSolendProgramId(target: 'devnet' | 'mainnet' = 'devnet'): PublicKey {
  return target === 'mainnet' ? SOLEND_MAINNET_PROGRAM_ID : SOLEND_DEVNET_PROGRAM_ID;
}
