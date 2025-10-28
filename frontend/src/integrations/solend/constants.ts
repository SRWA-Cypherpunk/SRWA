import { PublicKey } from '@solana/web3.js';

export const SOLEND_DEVNET_PROGRAM_ID = new PublicKey('ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx');
export const SOLEND_MAINNET_PROGRAM_ID = new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo');

// Pyth Oracle Program IDs (ATUALIZADOS 2024)
export const PYTH_DEVNET_PROGRAM_ID = new PublicKey('FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'); // Push Oracle
export const PYTH_PULL_ORACLE_DEVNET = new PublicKey('rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ'); // Pull Oracle (novo)

// Switchboard
export const SWITCHBOARD_DEVNET_PROGRAM_ID = new PublicKey('7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU');

// Pyth Price Feeds (Devnet)
export const PYTH_SOL_USD_DEVNET = new PublicKey('HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J');
export const PYTH_BTC_USD_DEVNET = new PublicKey('HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J'); // Placeholder - use o mesmo por enquanto

export const NULL_ORACLE = new PublicKey('nu11111111111111111111111111111111111111111');

export function getSolendProgramId(target: 'devnet' | 'mainnet' = 'devnet'): PublicKey {
  return target === 'mainnet' ? SOLEND_MAINNET_PROGRAM_ID : SOLEND_DEVNET_PROGRAM_ID;
}
