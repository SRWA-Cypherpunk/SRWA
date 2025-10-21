/**
 * Solana-specific types for SRWA Platform
 *
 * These types are compatible with @solana/web3.js
 * and will be used once Solana integration is implemented.
 */

// Solana address (PublicKey as string)
export type SolanaAddress = string;

// Solana transaction signature
export type SolanaSignature = string;

// Solana program ID
export type ProgramId = string;

// Token mint address
export type TokenMint = string;

// Account address
export type AccountAddress = string;

/**
 * Placeholder interfaces for future Solana integration
 */

export interface SolanaWalletState {
  publicKey: SolanaAddress | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
}

export interface SolanaTokenAccount {
  mint: TokenMint;
  owner: SolanaAddress;
  amount: string;
  decimals: number;
}

export interface SolanaTransactionResult {
  signature: SolanaSignature;
  slot: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
}

// Compliance-related types (compatible with current SRWA system)
export interface SolanaComplianceCheck {
  from: SolanaAddress;
  to: SolanaAddress;
  amount: string;
  tokenMint: TokenMint;
}

export interface SolanaComplianceResult {
  isCompliant: boolean;
  failedModules: string[];
  errorMessage?: string;
}
