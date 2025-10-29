import { useMemo, useCallback } from "react";
import { useDeployedTokens } from "@/hooks/solana/useDeployedTokens";
import { type EnhancedPoolData } from "@/types/markets";

export interface SRWAMarketData extends EnhancedPoolData {
  // Additional SRWA-specific fields
  isUserAdmin: boolean;
  tokenContract: string;
  complianceContract: string;
  totalSupply: string;
  userBalance: string;
  marketType: 'SRWA';
}

export interface UseSRWAMarketsReturn {
  srwaMarkets: SRWAMarketData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSRWAMarkets = (): UseSRWAMarketsReturn => {
  const { tokens: deployedTokens, loading: tokensLoading, error: tokensError, refetch: refetchTokens } = useDeployedTokens();

  // Convert deployed tokens into market-compatible format - memoized to prevent recreation
  const convertDeployedTokenToMarket = useCallback((token: any): SRWAMarketData => {
    // Calculate some mock/estimated values for now
    // Token from useDeployedTokens has different structure
    const totalSupplyNumber = 1000000; // Mock: 1M tokens
    const mockTVL = totalSupplyNumber * 0.8; // 80% utilization estimate
    const mockSuppliedAmount = mockTVL * 0.6; // 60% supplied
    const mockBorrowedAmount = mockTVL * 0.4; // 40% borrowed
    const utilizationRate = mockSuppliedAmount > 0 ? mockBorrowedAmount / mockSuppliedAmount : 0.4; // Fallback to 40%

    // Calculate APYs (mock values for now) - ensure no NaN values
    const baseAPY = 5.0; // Base 5% APY
    const supplyAPY = isNaN(utilizationRate) ? 4.0 : Math.max(1.0, baseAPY - (utilizationRate * 2));
    const borrowAPY = isNaN(utilizationRate) ? 7.0 : Math.max(supplyAPY + 1, baseAPY + (utilizationRate * 3));

    return {
      // Core pool info
      address: token.mint.toBase58(),
      name: `${token.name} Lending Market`,
      class: 'CRE', // Classify SRWA tokens as Commercial Real Estate for now
      status: 'Active' as const,

      // Financial metrics - ensure no NaN values
      tvl: isNaN(mockTVL) ? 0 : mockTVL,
      suppliedAmount: isNaN(mockSuppliedAmount) ? 0 : mockSuppliedAmount,
      borrowedAmount: isNaN(mockBorrowedAmount) ? 0 : mockBorrowedAmount,
      availableLiquidity: isNaN(mockSuppliedAmount - mockBorrowedAmount) ? 0 : Math.max(0, mockSuppliedAmount - mockBorrowedAmount),
      utilizationRate: isNaN(utilizationRate) ? 0 : Math.min(100, utilizationRate * 100),

      // APY data - ensure no NaN values
      supplyAPY: isNaN(supplyAPY) ? 0 : Math.max(0, supplyAPY),
      borrowAPY: isNaN(borrowAPY) ? 0 : Math.max(0, borrowAPY),
      netAPY: isNaN(supplyAPY) ? 0 : Math.max(0, supplyAPY),
      apyTrend: 'stable' as const,

      // Volume data (mock) - ensure no NaN values
      volume24h: isNaN(mockTVL) ? 0 : mockTVL * 0.1, // 10% of TVL daily volume
      volume7d: isNaN(mockTVL) ? 0 : mockTVL * 0.7, // 70% of TVL weekly volume
      volumeChange24h: Math.random() * 20 - 10, // Random -10% to +10%

      // User metrics (mock)
      activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60 users
      totalPositions: Math.floor(Math.random() * 100) + 20, // 20-120 positions

      // Risk metrics
      averageHealthFactor: 2.5 + Math.random() * 2, // 2.5-4.5
      liquidationRate: Math.random() * 5, // 0-5%
      riskScore: 20 + Math.random() * 30, // 20-50 (lower is better)

      // Price data (simplified)
      assetPrices: {
        [token.symbol || 'SRWA']: {
          asset: token.symbol || 'SRWA',
          price: 1.0, // Assume $1 per token for simplicity
          priceUSD: 1.0,
          change24h: Math.random() * 4 - 2, // -2% to +2%
          change7d: Math.random() * 10 - 5, // -5% to +5%
          volume24h: mockTVL * 0.1,
          marketCap: totalSupplyNumber,
          timestamp: Date.now(),
          source: 'SRWA-Estimated'
        }
      },

      // Performance
      performance24h: Math.random() * 4 - 2, // -2% to +2%
      performance7d: Math.random() * 10 - 5, // -5% to +5%
      performance30d: Math.random() * 20 - 10, // -10% to +10%

      // Timestamps
      lastUpdated: Date.now(),
      dataFreshness: 'Fresh' as const,

      // SRWA-specific fields
      isUserAdmin: false, // Will be determined by wallet connection
      tokenContract: token.mint.toBase58(),
      complianceContract: '', // Not available from deployed tokens
      totalSupply: totalSupplyNumber.toString(),
      userBalance: '0',
      marketType: 'SRWA' as const,
    };
  }, []);

  // Memoize the markets computation to prevent infinite re-renders
  const srwaMarkets = useMemo(() => {
    if (tokensLoading || tokensError) {
      return [];
    }

    try {
      // Convert ALL deployed RWA tokens to market format
      // Display all tokens as public pools (regardless of ownership or balance)
      const markets = deployedTokens.map(convertDeployedTokenToMarket);

      console.log('🔗 [useSRWAMarkets] Converted markets:', markets.length, markets);

      return markets;
    } catch (err) {
      console.error("🔗 [useSRWAMarkets] Error converting tokens to markets:", err);
      return [];
    }
  }, [deployedTokens, tokensLoading, tokensError, convertDeployedTokenToMarket]);

  const refetch = useCallback(async () => {
    await refetchTokens();
  }, [refetchTokens]);

  return {
    srwaMarkets,
    loading: tokensLoading,
    error: tokensError,
    refetch,
  };
};