import { useState, useEffect } from "react";
import { useUserRWATokens, type RWAToken } from "@/hooks/useUserRWATokens";
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
  const { tokens: rwaTokens, loading: tokensLoading, error: tokensError, refetch: refetchTokens } = useUserRWATokens();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert RWA tokens into market-compatible format
  const convertRWATokenToMarket = (token: RWAToken): SRWAMarketData => {
    // Calculate some mock/estimated values for now
    // In a real implementation, these would come from on-chain data or oracles
    const totalSupplyNumber = parseFloat(token.totalSupply) || 1000000; // Default to 1M if invalid
    const mockTVL = totalSupplyNumber / Math.pow(10, token.decimals) * 0.8; // 80% utilization estimate
    const mockSuppliedAmount = mockTVL * 0.6; // 60% supplied
    const mockBorrowedAmount = mockTVL * 0.4; // 40% borrowed
    const utilizationRate = mockSuppliedAmount > 0 ? mockBorrowedAmount / mockSuppliedAmount : 0.4; // Fallback to 40%
    
    // Calculate APYs (mock values for now) - ensure no NaN values
    const baseAPY = 5.0; // Base 5% APY
    const supplyAPY = isNaN(utilizationRate) ? 4.0 : Math.max(1.0, baseAPY - (utilizationRate * 2)); 
    const borrowAPY = isNaN(utilizationRate) ? 7.0 : Math.max(supplyAPY + 1, baseAPY + (utilizationRate * 3));
    
    return {
      // Core pool info
      address: token.contractAddress,
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
        [token.symbol]: {
          asset: token.symbol,
          price: 1.0, // Assume $1 per token for simplicity
          priceUSD: 1.0,
          change24h: Math.random() * 4 - 2, // -2% to +2%
          change7d: Math.random() * 10 - 5, // -5% to +5%
          volume24h: mockTVL * 0.1,
          marketCap: parseFloat(token.totalSupply) / Math.pow(10, token.decimals),
          timestamp: Date.now(),
          source: 'SRWA-Estimated'
        }
      },
      
      // Performance
      performance24h: Math.random() * 4 - 2, // -2% to +2%
      performance7d: Math.random() * 10 - 5, // -5% to +5%
      performance30d: Math.random() * 20 - 10, // -10% to +10%
      
      // Timestamps
      lastUpdated: token.lastUpdated.getTime(),
      dataFreshness: 'Fresh' as const,
      
      // SRWA-specific fields
      isUserAdmin: token.isUserAdmin,
      tokenContract: token.contractAddress,
      complianceContract: token.complianceContract,
      totalSupply: token.totalSupply,
      userBalance: token.balance,
      marketType: 'SRWA' as const,
    };
  };

  const [srwaMarkets, setSrwaMarkets] = useState<SRWAMarketData[]>([]);

  useEffect(() => {
    if (tokensLoading) {
      setLoading(true);
      return;
    }

    if (tokensError) {
      setError(tokensError);
      setLoading(false);
      return;
    }

    try {
      console.log("🔗 [useSRWAMarkets] Converting RWA tokens to market format:", rwaTokens.length);
      
      // Convert user's RWA tokens to market format
      const markets = rwaTokens
        .filter(token => {
          // Only include tokens where user is admin or has balance
          return token.isUserAdmin || parseFloat(token.balance) > 0;
        })
        .map(convertRWATokenToMarket);

      console.log("🔗 [useSRWAMarkets] Created SRWA markets:", markets.length);
      
      setSrwaMarkets(markets);
      setError(null);
    } catch (err) {
      console.error("🔗 [useSRWAMarkets] Error converting tokens to markets:", err);
      setError(err instanceof Error ? err.message : "Failed to convert RWA tokens to markets");
    } finally {
      setLoading(false);
    }
  }, [rwaTokens, tokensLoading, tokensError]);

  const refetch = async () => {
    await refetchTokens();
  };

  return {
    srwaMarkets,
    loading: loading || tokensLoading,
    error: error || tokensError,
    refetch,
  };
};