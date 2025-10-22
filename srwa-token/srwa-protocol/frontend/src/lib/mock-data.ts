// Mock data for the RWA lending protocol

export interface RWAMarket {
  id: string;
  name: string;
  asset: string;
  assetSymbol: string;
  category: "treasury" | "credit" | "real-estate";
  totalSupply: string;
  totalBorrow: string;
  supplyApy: string;
  borrowApy: string;
  utilization: string;
  lltv: string;
  riskPremium: string;
  isPermissioned: boolean;
  minInvestment: string;
  description: string;
}

export interface UserPosition {
  marketId: string;
  marketName: string;
  supplied: string;
  borrowed: string;
  healthFactor: string;
  netApy: string;
  collateralValue: string;
}

export interface MarketStats {
  totalValueLocked: string;
  totalMarkets: number;
  avgUtilization: string;
  avgHealthFactor: string;
  totalUsers: number;
  volumeLast24h: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  volume?: number;
}

export interface Position {
  id: string;
  userAddress: string;
  marketId: string;
  type: "supply" | "borrow";
  amount: string;
  apy: string;
  healthFactor: number;
}

export const mockMarkets: RWAMarket[] = [
  {
    id: "treasury-bills-1",
    name: "US Treasury Bills (3M)",
    asset: "T-BILL-3M",
    assetSymbol: "TB3M",
    category: "treasury",
    totalSupply: "$125.5M",
    totalBorrow: "$89.2M",
    supplyApy: "4.85%",
    borrowApy: "5.95%",
    utilization: "71.1%",
    lltv: "85%",
    riskPremium: "0.15%",
    isPermissioned: true,
    minInvestment: "$100,000",
    description: "High-grade US Treasury Bills with 3-month maturity. Collateralized by government securities."
  },
  {
    id: "corporate-credit-1", 
    name: "Investment Grade Corporate Bonds",
    asset: "IG-CORP",
    assetSymbol: "IGCB",
    category: "credit",
    totalSupply: "$78.3M",
    totalBorrow: "$45.1M",
    supplyApy: "6.25%",
    borrowApy: "7.85%",
    utilization: "57.6%",
    lltv: "75%",
    riskPremium: "0.45%",
    isPermissioned: true,
    minInvestment: "$250,000",
    description: "Diversified portfolio of investment-grade corporate bonds with average rating of BBB+."
  },
  {
    id: "real-estate-1",
    name: "Commercial Real Estate Fund",
    asset: "CRE-FUND",
    assetSymbol: "CREF",
    category: "real-estate", 
    totalSupply: "$156.7M",
    totalBorrow: "$98.4M",
    supplyApy: "7.45%",
    borrowApy: "9.15%",
    utilization: "62.8%",
    lltv: "65%",
    riskPremium: "0.85%",
    isPermissioned: true,
    minInvestment: "$500,000",
    description: "Institutional-grade commercial real estate properties across major US metros."
  }
];

export const mockUserPositions: UserPosition[] = [
  {
    marketId: "treasury-bills-1",
    marketName: "US Treasury Bills (3M)",
    supplied: "$2.5M",
    borrowed: "$1.2M",
    healthFactor: "2.45",
    netApy: "3.42%",
    collateralValue: "$2.85M"
  },
  {
    marketId: "corporate-credit-1",
    marketName: "Investment Grade Corporate Bonds", 
    supplied: "$800K",
    borrowed: "$350K",
    healthFactor: "1.89",
    netApy: "4.15%",
    collateralValue: "$925K"
  }
];

export const mockMarketStats: MarketStats = {
  totalValueLocked: "$1.24B",
  totalMarkets: 8,
  avgUtilization: "63.8%",
  avgHealthFactor: "2.15",
  totalUsers: 247,
  volumeLast24h: "$45.2M"
};

export const mockPositions: Position[] = [
  {
    id: "pos-1",
    userAddress: "GABC123456789DEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEF",
    marketId: "treasury-bills-1",
    type: "supply",
    amount: "$125,000",
    apy: "4.85%",
    healthFactor: 2.1
  },
  {
    id: "pos-2", 
    userAddress: "GDEF456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789GHIJ",
    marketId: "corporate-credit-1",
    type: "borrow",
    amount: "$50,000",
    apy: "7.85%",
    healthFactor: 1.8
  },
  {
    id: "pos-3",
    userAddress: "GHIJ789012345ABCDEFGHIJKLMNOPQRSTUVWXYZ6789KLMNO",
    marketId: "real-estate-1", 
    type: "supply",
    amount: "$75,000",
    apy: "7.45%",
    healthFactor: 1.3
  }
];

export const mockKycStatus = {
  status: "verified" as "pending" | "verified" | "rejected",
  tier: "institutional",
  expiryDate: "2025-03-15",
  documents: [
    { type: "Identity", status: "approved" },
    { type: "Address", status: "approved" },
    { type: "Institutional", status: "approved" }
  ]
};

// Mock chart data for market performance
export const generateMockChartData = (baseValue: number, points: number = 24, trend: 'up' | 'down' | 'neutral' = 'up') => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < points; i++) {
    const time = new Date();
    time.setHours(time.getHours() - (points - i));
    
    // Add some randomness with overall trend
    let change;
    switch (trend) {
      case 'up':
        change = (Math.random() - 0.3) * 0.2; // Bias towards positive
        break;
      case 'down':
        change = (Math.random() - 0.7) * 0.2; // Bias towards negative
        break;
      default:
        change = (Math.random() - 0.5) * 0.15; // Neutral
    }
    
    currentValue += change;
    currentValue = Math.max(0, currentValue); // Ensure non-negative
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: currentValue,
      volume: Math.random() * 50 + 10 // Random volume between 10-60M
    });
  }
  
  return data;
};

export const mockMarketCharts = {
  supplyRates: generateMockChartData(4.85, 24, 'up'),
  borrowRates: generateMockChartData(5.95, 24, 'neutral'),
  utilization: generateMockChartData(71.1, 24, 'up'),
  volume: generateMockChartData(45.2, 24, 'up')
};