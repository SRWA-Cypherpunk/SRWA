import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { PublicKey } from '@solana/web3.js';

export type BigNumberish = string | number | bigint | BN;

export const U64_MAX = new BN('18446744073709551615');

export function toQuoteCurrencyBuffer(input: string): Buffer {
  const data = Buffer.alloc(32);
  const truncated = input.slice(0, 32);
  data.write(truncated, 0, 'utf-8');
  return data;
}

export function parsePublicKey(maybeKey: string | undefined, fallback?: PublicKey): PublicKey {
  if (maybeKey && maybeKey.trim().length > 0) {
    return new PublicKey(maybeKey.trim());
  }
  if (!fallback) {
    throw new Error('Expected public key string');
  }
  return fallback;
}

export function decimalToBN(amount: string | number, decimals: number): BN {
  const value = new BigNumber(amount);
  if (!value.isFinite() || value.isNegative()) {
    throw new Error('Invalid amount');
  }
  const scaled = value.multipliedBy(new BigNumber(10).pow(decimals));
  if (!scaled.isInteger()) {
    throw new Error('Amount has more precision than token decimals allow');
  }
  return new BN(scaled.toFixed(0));
}

export function stringToBN(value: BigNumberish | undefined, fallback?: BN): BN {
  if (value === undefined || value === null) {
    if (fallback) return fallback;
    throw new Error('Missing numeric value');
  }
  const normalized = typeof value === 'string' ? value.trim() : value.toString(10);
  if (normalized.length === 0) {
    if (fallback) return fallback;
    throw new Error('Missing numeric value');
  }
  return new BN(normalized);
}
