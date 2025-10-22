/**
 * Lending Service - Business logic for lending operations
 *
 * Handles all lending/borrowing operations including:
 * - Supply/withdraw assets
 * - Borrow/repay operations
 * - Interest calculations
 * - Pool interactions
 */

import { PublicKey } from '@solana/web3.js';

export interface LendingOperation {
  asset: string;
  amount: number;
  type: 'supply' | 'borrow' | 'withdraw' | 'repay';
}

export interface Pool {
  id: string;
  name: string;
  totalSupply: number;
  totalBorrow: number;
  utilizationRate: number;
  supplyAPY: number;
  borrowAPY: number;
}

export class LendingService {
  /**
   * Calculate interest for a given amount and APY
   */
  calculateInterest(principal: number, apy: number, days: number): number {
    return principal * (apy / 100) * (days / 365);
  }

  /**
   * Calculate utilization rate
   */
  calculateUtilizationRate(totalBorrow: number, totalSupply: number): number {
    if (totalSupply === 0) return 0;
    return (totalBorrow / totalSupply) * 100;
  }

  /**
   * Calculate health factor for a position
   */
  calculateHealthFactor(
    collateralValue: number,
    borrowValue: number,
    liquidationThreshold: number
  ): number {
    if (borrowValue === 0) return Infinity;
    return (collateralValue * liquidationThreshold) / borrowValue;
  }

  /**
   * Format pool data
   */
  formatPool(poolData: any): Pool {
    return {
      id: poolData.id,
      name: poolData.name,
      totalSupply: poolData.totalSupply || 0,
      totalBorrow: poolData.totalBorrow || 0,
      utilizationRate: this.calculateUtilizationRate(
        poolData.totalBorrow || 0,
        poolData.totalSupply || 0
      ),
      supplyAPY: poolData.supplyAPY || 0,
      borrowAPY: poolData.borrowAPY || 0,
    };
  }

  /**
   * Validate lending operation
   */
  validateOperation(operation: LendingOperation): boolean {
    if (operation.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!operation.asset) {
      throw new Error('Asset is required');
    }
    return true;
  }
}

// Export singleton instance
let lendingServiceInstance: LendingService | null = null;

export function getLendingService(): LendingService {
  if (!lendingServiceInstance) {
    lendingServiceInstance = new LendingService();
  }
  return lendingServiceInstance;
}
