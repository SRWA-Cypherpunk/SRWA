import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/components/wallet/WalletProvider';
import { BlendPool, BlendReserve, BlendAsset } from '@/types/lending';
import { mockUserPositions, UserPosition } from '@/lib/mock-data';

// Real user position from Blend Protocol
export interface RealUserPosition {
  poolAddress: string;
  poolName: string;
  assetCode: string;
  assetIssuer?: string;
  
  // Supply position
  suppliedAmount: number;
  suppliedValue: number; // USD value
  supplyAPY: number;
  supplyYieldEarned: number; // Total yield earned
  
  // Borrow position
  borrowedAmount: number;
  borrowedValue: number; // USD value
  borrowAPY: number;
  borrowInterestPaid: number; // Total interest paid
  
  // Health metrics
  healthFactor: number;
  liquidationThreshold: number;
  collateralValue: number;
  
  // RWA specific
  isRWAAsset: boolean;
  rwaType?: 'treasury' | 'corporate-bond' | 'real-estate' | 'commodity' | 'other';
  
  // Timestamps
  lastUpdated: string;
  positionAge: number; // Days since position opened
}

export interface BlendPositionSummary {
  totalSupplied: number;
  totalBorrowed: number;
  totalCollateralValue: number;
  netAPY: number;
  averageHealthFactor: number;
  totalYieldEarned: number;
  totalInterestPaid: number;
  netProfitLoss: number;
  positionCount: number;
  rwaPositionCount: number;
}

export interface UseUserBlendPositionsReturn {
  // Position data
  positions: RealUserPosition[];
  summary: BlendPositionSummary;
  
  // RWA specific positions
  rwaPositions: RealUserPosition[];
  hasRWAPositions: boolean;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
  refreshPositions: () => void;
}

export function useUserBlendPositions(): UseUserBlendPositionsReturn {
  const { isConnected, address } = useWallet();
  const queryClient = useQueryClient();

  // For now, we'll use mock data but structure it to match real Blend positions
  // In the future, this would query actual Blend Protocol contracts
  const {
    data: positions = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userBlendPositions', address],
    queryFn: () => fetchUserBlendPositions(address!),
    enabled: isConnected && !!address,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refresh every 2 minutes
    retry: 3,
  });

  // Calculate position summary
  const summary: BlendPositionSummary = calculatePositionSummary(positions);
  
  // Filter RWA positions
  const rwaPositions = positions.filter(pos => pos.isRWAAsset);
  const hasRWAPositions = rwaPositions.length > 0;

  // Refresh positions
  const refreshPositions = useCallback(() => {
    if (!isConnected || !address) return;
    
    queryClient.invalidateQueries({ queryKey: ['userBlendPositions', address] });
  }, [isConnected, address, queryClient]);

  return {
    positions,
    summary,
    rwaPositions,
    hasRWAPositions,
    loading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
    refreshPositions,
  };
}

// Function to fetch user positions from Blend Protocol
// Currently uses mock data, but structured to match real implementation
async function fetchUserBlendPositions(userAddress: string): Promise<RealUserPosition[]> {
  // TODO: Replace with actual Blend Protocol contract calls
  // This would involve:
  // 1. Getting all pools from Blend Factory
  // 2. For each pool, check if user has positions
  // 3. Calculate health factors and yields
  // 4. Fetch current asset prices
  
  // For now, convert mock data to match real structure
  const mockPositions: RealUserPosition[] = mockUserPositions.map((mockPos, index) => ({
    poolAddress: `pool_${mockPos.marketId}`,
    poolName: mockPos.marketName,
    assetCode: mockPos.marketId.includes('treasury') ? 'TBILL' : 
               mockPos.marketId.includes('corporate') ? 'CORPBOND' : 'REIT',
    
    suppliedAmount: parseFloat(mockPos.supplied.replace(/[$M,K]/g, '')) * 1000000,
    suppliedValue: parseFloat(mockPos.supplied.replace(/[$M,K]/g, '')) * 1000000,
    supplyAPY: 0.0485, // 4.85%
    supplyYieldEarned: 15420 + index * 1000, // Mock yield earned
    
    borrowedAmount: parseFloat(mockPos.borrowed.replace(/[$M,K]/g, '')) * 1000000,
    borrowedValue: parseFloat(mockPos.borrowed.replace(/[$M,K]/g, '')) * 1000000,
    borrowAPY: 0.0595, // 5.95%
    borrowInterestPaid: 8540 + index * 500, // Mock interest paid
    
    healthFactor: parseFloat(mockPos.healthFactor),
    liquidationThreshold: 0.85, // 85%
    collateralValue: parseFloat(mockPos.collateralValue.replace(/[$M,K]/g, '')) * 1000000,
    
    isRWAAsset: true, // All our positions are RWA for this demo
    rwaType: mockPos.marketId.includes('treasury') ? 'treasury' :
             mockPos.marketId.includes('corporate') ? 'corporate-bond' : 'real-estate',
    
    lastUpdated: new Date().toISOString(),
    positionAge: 30 + index * 15, // Mock position age in days
  }));

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockPositions;
}

// Calculate summary statistics from positions
function calculatePositionSummary(positions: RealUserPosition[]): BlendPositionSummary {
  if (positions.length === 0) {
    return {
      totalSupplied: 0,
      totalBorrowed: 0,
      totalCollateralValue: 0,
      netAPY: 0,
      averageHealthFactor: 0,
      totalYieldEarned: 0,
      totalInterestPaid: 0,
      netProfitLoss: 0,
      positionCount: 0,
      rwaPositionCount: 0,
    };
  }

  const totalSupplied = positions.reduce((sum, pos) => sum + pos.suppliedValue, 0);
  const totalBorrowed = positions.reduce((sum, pos) => sum + pos.borrowedValue, 0);
  const totalCollateralValue = positions.reduce((sum, pos) => sum + pos.collateralValue, 0);
  const totalYieldEarned = positions.reduce((sum, pos) => sum + pos.supplyYieldEarned, 0);
  const totalInterestPaid = positions.reduce((sum, pos) => sum + pos.borrowInterestPaid, 0);
  
  // Calculate weighted average APY
  const supplyWeight = positions.reduce((sum, pos) => sum + (pos.suppliedValue * pos.supplyAPY), 0);
  const borrowWeight = positions.reduce((sum, pos) => sum + (pos.borrowedValue * pos.borrowAPY), 0);
  const netAPY = totalSupplied > 0 ? (supplyWeight - borrowWeight) / totalSupplied : 0;
  
  // Calculate average health factor
  const averageHealthFactor = positions.reduce((sum, pos) => sum + pos.healthFactor, 0) / positions.length;
  
  const rwaPositionCount = positions.filter(pos => pos.isRWAAsset).length;
  const netProfitLoss = totalYieldEarned - totalInterestPaid;

  return {
    totalSupplied,
    totalBorrowed,
    totalCollateralValue,
    netAPY,
    averageHealthFactor,
    totalYieldEarned,
    totalInterestPaid,
    netProfitLoss,
    positionCount: positions.length,
    rwaPositionCount,
  };
}

// Helper hook for RWA positions only
export function useRWABlendPositions() {
  const blendPositions = useUserBlendPositions();
  
  return {
    rwaPositions: blendPositions.rwaPositions,
    hasRWAPositions: blendPositions.hasRWAPositions,
    rwaPositionCount: blendPositions.summary.rwaPositionCount,
    loading: blendPositions.loading,
    error: blendPositions.error,
    refreshPositions: blendPositions.refreshPositions,
  };
}

// Utility function to format position values for display
export function formatPositionValue(value: number): string {
  if (value === 0) return "$0.00";
  
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

// Helper hook for position health monitoring
export function usePositionHealth() {
  const { positions, loading } = useUserBlendPositions();
  
  const healthMetrics = {
    healthyPositions: positions.filter(pos => pos.healthFactor >= 2.0).length,
    moderateRiskPositions: positions.filter(pos => pos.healthFactor >= 1.5 && pos.healthFactor < 2.0).length,
    highRiskPositions: positions.filter(pos => pos.healthFactor < 1.5).length,
    averageHealthFactor: positions.length > 0 
      ? positions.reduce((sum, pos) => sum + pos.healthFactor, 0) / positions.length 
      : 0,
    needsAttention: positions.filter(pos => pos.healthFactor < 1.8).length > 0,
  };

  return {
    ...healthMetrics,
    loading,
    isEmpty: positions.length === 0,
  };
}

// Helper to get health factor color
export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 2.0) return 'text-green-400';
  if (healthFactor >= 1.5) return 'text-yellow-400';
  return 'text-red-400';
}

// Helper to get health factor status
export function getHealthFactorStatus(healthFactor: number): string {
  if (healthFactor >= 2.0) return 'Healthy';
  if (healthFactor >= 1.5) return 'Moderate Risk';
  return 'High Risk';
}
