/**
 * Solana Service - Blockchain interaction abstraction
 *
 * Handles all Solana blockchain interactions including:
 * - Transaction building and sending
 * - Account fetching
 * - Balance queries
 * - Network utilities
 */

import { Connection, PublicKey, Transaction, SendOptions } from '@solana/web3.js';

export class SolanaService {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  /**
   * Get SOL balance for an address
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(
    transaction: Transaction,
    sendOptions?: SendOptions
  ): Promise<string> {
    try {
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        sendOptions
      );
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Confirm a transaction
   */
  async confirmTransaction(signature: string): Promise<void> {
    try {
      await this.connection.confirmTransaction(signature, 'confirmed');
    } catch (error) {
      console.error('Error confirming transaction:', error);
      throw error;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(publicKey: PublicKey) {
    try {
      return await this.connection.getAccountInfo(publicKey);
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash() {
    try {
      return await this.connection.getLatestBlockhash();
    } catch (error) {
      console.error('Error fetching recent blockhash:', error);
      throw error;
    }
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }
}

// Export singleton instance
let solanaServiceInstance: SolanaService | null = null;

export function getSolanaService(endpoint?: string): SolanaService {
  if (!solanaServiceInstance || endpoint) {
    const rpcEndpoint = endpoint || import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    solanaServiceInstance = new SolanaService(rpcEndpoint);
  }
  return solanaServiceInstance;
}
