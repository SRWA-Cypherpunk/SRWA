import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// Hooks  
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useWalletAssets } from '@/hooks/wallet/useWalletAssets';
import { useUserBlendPositions, formatPositionValue } from '@/hooks/markets/useUserBlendPositions';
import { useWalletTransactions } from '@/hooks/wallet/useWalletTransactions';
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";
import RWATokensGrid from '@/components/dashboard/RWATokensGrid';
import { RWALendingPools } from '@/components/rwa/RWALendingPools';

// Icons
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Plus,
  Globe,
  Zap,
  Wallet,
  ArrowRight
} from "lucide-react";

// Function to get user positions based on wallet address
const getUserPositions = (address: string): UserPosition[] => {
  if (!address) return [];
  // For now, return mock data. In the future, this would query the blockchain
  // using the user's address to get actual positions
  // We can simulate different scenarios based on the address for testing
  return mockUserPositions;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);
  const [activeTab, setActiveTab] = useState("markets");
  
  // Wallet connection
  const { isConnected, address, connect, isConnecting } = useWallet();
  
  // Real wallet data hooks
  const walletAssets = useWalletAssets();
  const blendPositions = useUserBlendPositions();
  const recentTransactions = useWalletTransactions();
  
  // User positions based on connected wallet (for backward compatibility)
  const userPositions = isConnected && blendPositions.positions.length > 0 
    ? blendPositions.positions.map(pos => ({
        marketId: pos.poolAddress,
        marketName: pos.poolName,
        supplied: formatPositionValue(pos.suppliedValue),
        borrowed: formatPositionValue(pos.borrowedValue),
        healthFactor: pos.healthFactor.toFixed(2),
        netApy: (pos.supplyAPY * 100).toFixed(2) + '%',
        collateralValue: formatPositionValue(pos.collateralValue)
      }))
    : getUserPositions(address);

  // Markets data
  const {
    pools: blendPools,
    loading: poolsLoading,
    error: poolsError,
    refetch: refetchPools
  } = useBlendPools();

  const {
    enhancedPools,
    loading: analyticsLoading,
    error: analyticsError
  } = useEnhancedPoolData(blendPools);

  // SRWA Markets data
  const {
    srwaMarkets,
    loading: srwaLoading,
    error: srwaError,
    refetch: refetchSRWA
  } = useSRWAMarkets();

  const loading = poolsLoading || analyticsLoading || srwaLoading;
  const error = poolsError?.message || analyticsError?.message || srwaError?.message || null;

  // Portfolio calculations based on real wallet data
  const totalSupplied = isConnected && blendPositions.summary 
    ? blendPositions.summary.totalSupplied / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.supplied.replace(/[$M,K]/g, '')), 0);
    
  const totalBorrowed = isConnected && blendPositions.summary 
    ? blendPositions.summary.totalBorrowed / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.borrowed.replace(/[$M,K]/g, '')), 0);
    
  const avgHealthFactor = isConnected && blendPositions.summary 
    ? blendPositions.summary.averageHealthFactor
    : userPositions.length > 0 
      ? userPositions.reduce((acc, pos) => acc + parseFloat(pos.healthFactor), 0) / userPositions.length
      : 0;
      
  const netApy = isConnected && blendPositions.summary 
    ? (blendPositions.summary.netAPY * 100).toFixed(2) + '%'
    : "3.78%";

  // Combine Blend pools and SRWA markets for dashboard stats
  const allMarkets = [...enhancedPools, ...srwaMarkets];
  
  // Market stats from all pools (Blend + SRWA)
  const marketStats = allMarkets.length > 0 ? {
    totalValueLocked: `$${(allMarkets.reduce((sum, pool) => sum + pool.tvl, 0) / 1e6).toFixed(1)}M`,
    totalMarkets: allMarkets.length,
    avgUtilization: `${(allMarkets.reduce((sum, pool) => sum + pool.utilizationRate, 0) / allMarkets.length).toFixed(1)}%`,
    totalUsers: allMarkets.reduce((sum, pool) => sum + pool.activeUsers, 0)
  } : {
    totalValueLocked: "$0.0M",
    totalMarkets: 0,
    avgUtilization: "0.0%",
    totalUsers: 0
  };

  // Dashboard stats for KPI cards (including SRWA)
  const dashboardStats = allMarkets.length > 0 ? {
    totalValueLocked: `$${(allMarkets.reduce((sum, pool) => sum + pool.tvl, 0) / 1e6).toFixed(1)}M`,
    averageAPY: `${(allMarkets.reduce((sum, pool) => sum + pool.supplyAPY, 0) / allMarkets.length).toFixed(2)}%`,
    activePools: allMarkets.filter(pool => pool.status === 'Active').length,
    totalUsers: allMarkets.reduce((sum, pool) => sum + pool.activeUsers, 0)
  } : {
    totalValueLocked: "$0.0M",
    averageAPY: "0.00%",
    activePools: 0,
    totalUsers: 0
  };

  // Chart data for dashboard (including SRWA)
  const poolTVLChartData = allMarkets.length > 0 
    ? allMarkets.slice(0, 8).map((pool, index) => ({
        name: pool.name.length > 15 ? pool.name.slice(0, 15) + '...' : pool.name,
        tvl: pool.tvl / 1e6, // Convert to millions
        poolAddress: pool.address
      }))
    : [{ name: "No Data", tvl: 0, poolAddress: "" }];

  // Pie chart data for TVL distribution (including SRWA)
  const pieChartData = allMarkets.length > 0 
    ? allMarkets.map((pool, index) => ({
        name: pool.name.length > 20 ? pool.name.slice(0, 20) + '...' : pool.name,
        value: pool.tvl / 1e6, // Convert to millions
        poolAddress: pool.address
      }))
    : [{ name: "No Data", value: 0, poolAddress: "" }];

  // Colors for pie chart
  const pieColors = ['#60A5FA', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Navigation handlers
  const handleViewPoolDetails = (poolAddress: string) => {
    navigate(`/pool/${poolAddress}`);
  };

  const handleSupply = (poolAddress: string) => {
    navigate(`/pool/${poolAddress}?action=supply`);
  };

  const handleBorrow = (poolAddress: string) => {
    navigate(`/pool/${poolAddress}?action=borrow`);
  };

  const handleRefresh = () => {
    refetchPools();
    refetchSRWA();
  };

  const getHealthFactorColor = (hf: string) => {
    const value = parseFloat(hf);
    if (value >= 2.0) return "text-emerald-400";
    if (value >= 1.5) return "text-amber-400";
    return "text-red-400";
  };

  const getHealthFactorStatus = (hf: string) => {
    const value = parseFloat(hf);
    if (value >= 2.0) return "Healthy";
    if (value >= 1.5) return "Moderate";
    return "At Risk";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header with Create SRWA Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg-primary">
              Dashboard
            </h1>
            <p className="text-base sm:text-lg text-fg-secondary mt-2">
              Markets, Portfolio & Administration unified
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Button 
              className="btn-primary w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-body-1 relative overflow-hidden group"
              onClick={() => window.location.href = '/srwa-issuance'}
            >
              <span className="relative">Create SRWA</span>
              <Plus className="ml-2 h-4 w-4 sm:h-5 sm:w-5 relative" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>

        {/* Native Tabs Interface */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="grid w-full max-w-md grid-cols-3 h-10 sm:h-12 bg-card/50 backdrop-blur-sm border border-brand-500/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("markets")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-md px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "markets"
                    ? "bg-brand-500/20 text-brand-300 shadow-sm"
                    : "text-fg-muted hover:text-fg-primary hover:bg-background/50"
                }`}
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Markets</span>
                <span className="sm:hidden">Mkts</span>
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-md px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "portfolio"
                    ? "bg-brand-500/20 text-brand-300 shadow-sm"
                    : "text-fg-muted hover:text-fg-primary hover:bg-background/50"
                }`}
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Portfolio</span>
                <span className="sm:hidden">Port</span>
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-md px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-brand-500/20 text-brand-300 shadow-sm"
                    : "text-fg-muted hover:text-fg-primary hover:bg-background/50"
                }`}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Dashboard
              </button>
            </div>
          </div>

          {/* Markets Tab Content */}
          {activeTab === "markets" && (
            <div className="dashboard-tab-content space-y-8">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-fg-primary">
                    Lending Markets
                    <span className="inline-block ml-2">
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400 inline" />
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                    Discover and interact with lending pools on Solana.
                  </p>
                </div>

                <MarketsDashboard
                  pools={enhancedPools}
                  srwaMarkets={srwaMarkets}
                  loading={loading}
                  error={error}
                  onRefresh={handleRefresh}
                  onViewPoolDetails={handleViewPoolDetails}
                  onSupply={handleSupply}
                  onBorrow={handleBorrow}
                />
              </div>
            </div>
          )}

          {/* Portfolio Tab Content */}
          {activeTab === "portfolio" && (
            <div className="dashboard-tab-content dashboard-portfolio-tab space-y-8">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-fg-primary">
                    Portfolio Management
                    <span className="inline-block ml-2">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400 inline" />
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                    Monitor your RWA lending positions, health factors, and performance metrics.
                  </p>
                </div>

                {/* Wallet Connection Check */}
                {!isConnected ? (
                  <div className="flex justify-center">
                    <div className="card-institutional max-w-md w-full rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="text-center space-y-6 p-6 sm:p-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 mx-auto border border-brand-500/20">
                          <Wallet className="h-8 w-8 text-brand-400" />
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-fg-primary">
                            Connect Your Wallet
                          </h3>
                          <p className="text-body-2 text-fg-secondary leading-relaxed">
                            Connect your Solana wallet to view your lending positions, health factors, and portfolio analytics.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={connect}
                          disabled={isConnecting}
                          className="btn-primary w-full px-6 py-3 text-sm font-medium relative overflow-hidden group"
                        >
                          <span className="relative">
                            {isConnecting ? "Connecting..." : "Connect Wallet"}
                          </span>
                          <ArrowRight className="ml-2 h-4 w-4 relative" />
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Portfolio Overview KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <KPICard
                        title="Total Supplied"
                        value={walletAssets.loading || blendPositions.loading ? "Loading..." : 
                          userPositions.length > 0 ? `$${totalSupplied.toFixed(1)}M` : "$0.0M"}
                        icon={DollarSign}
                        trend={userPositions.length > 0 ? "up" : undefined}
                        trendValue={userPositions.length > 0 && blendPositions.summary.totalYieldEarned > 0 
                          ? `+$${(blendPositions.summary.totalYieldEarned / 1000).toFixed(1)}K earned` 
                          : userPositions.length > 0 ? "+5.2%" : undefined}
                      />
                      <KPICard
                        title="Total Borrowed"
                        value={walletAssets.loading || blendPositions.loading ? "Loading..." : 
                          userPositions.length > 0 ? `$${totalBorrowed.toFixed(1)}M` : "$0.0M"}
                        icon={TrendingUp}
                        subtitle={walletAssets.loading || blendPositions.loading ? "Loading..." : 
                          userPositions.length > 0 
                            ? `${userPositions.length} active position${userPositions.length > 1 ? 's' : ''}` 
                            : "No positions"}
                      />
                      <KPICard
                        title="Net APY"
                        value={walletAssets.loading || blendPositions.loading ? "Loading..." : 
                          userPositions.length > 0 ? netApy : "0.00%"}
                        icon={BarChart3}
                        trend={userPositions.length > 0 && blendPositions.summary.netProfitLoss > 0 ? "up" : 
                          userPositions.length > 0 && blendPositions.summary.netProfitLoss < 0 ? "down" : undefined}
                        trendValue={userPositions.length > 0 && isConnected && blendPositions.summary.netProfitLoss !== 0 
                          ? `${blendPositions.summary.netProfitLoss > 0 ? '+' : ''}$${(blendPositions.summary.netProfitLoss / 1000).toFixed(1)}K P&L`
                          : userPositions.length > 0 ? "+0.15%" : undefined}
                      />
                      <KPICard
                        title="Avg Health Factor"
                        value={walletAssets.loading || blendPositions.loading ? "Loading..." : 
                          userPositions.length > 0 ? avgHealthFactor.toFixed(2) : "--"}
                        icon={Shield}
                        trend={userPositions.length > 0 && avgHealthFactor >= 2.0 ? "up" : 
                          userPositions.length > 0 && avgHealthFactor < 1.5 ? "down" : 
                          userPositions.length > 0 ? "neutral" : undefined}
                        trendValue={userPositions.length > 0 
                          ? avgHealthFactor >= 2.0 ? "Healthy" : avgHealthFactor >= 1.5 ? "Moderate" : "At Risk" 
                          : undefined}
                      />
                    </div>


                    {/* 🚀 USER CREATED RWA TOKENS SECTION */}
                    <div className="space-y-6">
                      <RWATokensGrid />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dashboard Tab Content */}
          {activeTab === "dashboard" && (
            <div className="dashboard-tab-content space-y-8">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-fg-primary">
                    Markets Dashboard
                    <span className="inline-block ml-2">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400 inline" />
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                    Real-time lending pool metrics and analytics.
                  </p>
                </div>

                {/* Admin Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-1">
                      <p className="text-micro text-fg-muted uppercase">Total Value Locked</p>
                      <div className="flex items-center gap-2">
                        <p className="text-h3 font-semibold text-fg-primary">{loading ? "Loading..." : dashboardStats.totalValueLocked}</p>
                        {!loading && enhancedPools.length > 0 && <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">Live</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-1">
                      <p className="text-micro text-fg-muted uppercase">Average APY</p>
                      <p className="text-h3 font-semibold text-fg-primary">{loading ? "Loading..." : dashboardStats.averageAPY}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-1">
                      <p className="text-micro text-fg-muted uppercase">Active Pools</p>
                      <p className="text-h3 font-semibold text-fg-primary">{loading ? "..." : dashboardStats.activePools}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-1">
                      <p className="text-micro text-fg-muted uppercase">Total Users</p>
                      <div className="flex items-center gap-2">
                        <p className="text-h3 font-semibold text-fg-primary">{loading ? "..." : dashboardStats.totalUsers.toLocaleString()}</p>
                        {!loading && enhancedPools.length > 0 && <Badge variant="outline" className="text-brand-400 border-brand-500/30 bg-brand-500/10">Active</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TVL Trend Chart */}
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-h3 font-medium text-fg-primary">TVL Trend</h3>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={poolTVLChartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="areaFillAdmin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                          <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax+0.5"]} />
                          <Tooltip formatter={(value: any) => [`$${value.toFixed(1)}M`, 'TVL']} />
                          <Area type="monotone" dataKey="tvl" stroke="#60A5FA" strokeWidth={2} fill="url(#areaFillAdmin)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* TVL Distribution Pie Chart */}
                  <div className="p-6 card-institutional hover-lift rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-h3 font-medium text-fg-primary">TVL Distribution</h3>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`$${value.toFixed(1)}M`, 'TVL']}
                            labelFormatter={(label) => `Pool: ${label}`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}