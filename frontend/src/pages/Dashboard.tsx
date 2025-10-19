import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";

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
  ArrowRight,
  Github,
  Twitter,
  BookOpen
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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Gradiente Harmonioso */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* SVG Noise Overlay */}
        <svg className="absolute inset-0 opacity-[0.015] w-full h-full">
          <filter id="dashboardNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#dashboardNoiseFilter)" />
        </svg>

        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-60" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(153,69,255,0.15), transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,53,0.12), transparent 50%),
            linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
          `
        }} />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* Header with Create SRWA Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg text-fg-secondary mt-2">
                Markets, Portfolio & Administration unified
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <HeroButton
                onClick={() => window.location.href = '/srwa-issuance'}
                variant="brand"
                className="w-full sm:w-auto"
                icon={<Plus className="h-4 w-4" />}
              >
                Create SRWA
              </HeroButton>
            </div>
          </div>

        {/* Native Tabs Interface */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="grid w-full max-w-md grid-cols-3 h-10 sm:h-12 bg-card/50 backdrop-blur-md border-2 border-purple-500/20 rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setActiveTab("markets")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === "markets"
                    ? "bg-gradient-to-r from-purple-500/25 to-purple-600/25 text-purple-300 shadow-md"
                    : "text-fg-muted hover:text-purple-300 hover:bg-purple-500/10"
                }`}
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Markets</span>
                <span className="sm:hidden">Mkts</span>
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === "portfolio"
                    ? "bg-gradient-to-r from-orange-500/25 to-orange-600/25 text-orange-300 shadow-md"
                    : "text-fg-muted hover:text-orange-300 hover:bg-orange-500/10"
                }`}
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Portfolio</span>
                <span className="sm:hidden">Port</span>
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-blue-500/25 to-purple-500/25 text-blue-300 shadow-md"
                    : "text-fg-muted hover:text-blue-300 hover:bg-blue-500/10"
                }`}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Dashboard
              </button>
            </div>
          </div>

          {/* Markets Tab Content */}
          {activeTab === "markets" && (
            <div className="dashboard-tab-content relative space-y-8">
              {/* Decorative Background - Purple */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                  background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(153,69,255,0.15), transparent 70%)'
                }} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                    Lending Markets
                    <span className="inline-block ml-2">
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 inline" />
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
            <div className="dashboard-tab-content dashboard-portfolio-tab relative space-y-8">
              {/* Decorative Background - Orange */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                  background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,107,53,0.12), transparent 70%)'
                }} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 bg-clip-text text-transparent">
                    Portfolio Management
                    <span className="inline-block ml-2">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 inline" />
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
            <div className="dashboard-tab-content relative space-y-8">
              {/* Decorative Background - Blue/Purple */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                  background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(75,107,255,0.12), transparent 70%)'
                }} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
                    Markets Dashboard
                    <span className="inline-block ml-2">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 inline" />
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

        {/* Footer */}
        <footer className="relative py-16 sm:py-20 mt-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            {/* Footer Container with Gradient */}
            <div className="relative rounded-2xl border-2 border-purple-500/10 overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #0d0b0e 0%, #110d14 50%, #0A0A0A 100%)',
                borderImageSource: 'linear-gradient(to right, rgba(153,69,255,0.3), rgba(255,107,53,0.2))',
                borderImageSlice: 1
              }}
            >
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, rgba(153,69,255,0.6) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }} />

              {/* CTA Section - Highlighted Box */}
              <div className="relative z-10 mx-6 sm:mx-12 mt-8 sm:mt-12 mb-12 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-purple-900/20 to-orange-950/30 p-6 sm:p-8 backdrop-blur-sm overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent mb-2">
                      Ready to Get Started?
                    </h3>
                    <p className="text-sm text-fg-secondary">
                      Connect your wallet and start exploring institutional-grade RWA markets
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <HeroButton
                      onClick={isConnected ? () => navigate(ROUTES.DASHBOARD) : connect}
                      variant="brand"
                      className="!px-6 !py-3 !text-sm"
                      icon={<Wallet className="h-4 w-4" />}
                    >
                      {isConnected ? 'Launch App' : 'Connect Wallet'}
                    </HeroButton>
                    <HeroButton
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                      variant="solana"
                      className="!px-6 !py-3 !text-sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Dashboard
                    </HeroButton>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-6 sm:px-12 pb-12 sm:pb-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                  {/* Brand Column */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <a href={ROUTES.HOME} className="flex items-center gap-2 group">
                      <img src={Logo} alt="SRWA Logo" className="h-auto w-8 transition-transform group-hover:scale-105" />
                      <img src={SRWALetters} alt="SRWA" className="h-auto w-20 transition-transform group-hover:scale-105" />
                    </a>
                    <p className="text-sm text-fg-secondary leading-relaxed">
                      Institutional-grade Real-World Asset lending on Solana with full compliance and transparency.
                    </p>
                  </motion.div>

                  {/* Product Column */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent uppercase tracking-wider">Product</h4>
                    <ul className="space-y-3">
                      {[
                        { href: ROUTES.DASHBOARD, label: "Dashboard" },
                        { href: ROUTES.MARKETS, label: "Markets" },
                        { href: ROUTES.PORTFOLIO, label: "Portfolio" },
                        { href: ROUTES.KYC, label: "KYC Portal" }
                      ].map((link, index) => (
                        <li key={link.href}>
                          <motion.a
                            href={link.href}
                            className="text-sm text-fg-secondary hover:text-purple-400 transition-all inline-flex items-center gap-2 group"
                            whileHover={{ x: 4 }}
                          >
                            <ArrowRight className="h-3 w-3 text-purple-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>{link.label}</span>
                          </motion.a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Resources Column */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent uppercase tracking-wider">Resources</h4>
                    <ul className="space-y-3">
                      {[
                        { href: ROUTES.DOCS, label: "Documentation", icon: BookOpen },
                        { href: "https://github.com/SRWA-Cypherpunk", label: "GitHub", icon: Github },
                        { href: ROUTES.ADMIN, label: "Admin", icon: Shield }
                      ].map((link, index) => (
                        <li key={link.href}>
                          <motion.a
                            href={link.href}
                            target={link.href.startsWith('http') ? '_blank' : undefined}
                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-sm text-fg-secondary hover:text-orange-400 transition-all inline-flex items-center gap-2 group"
                            whileHover={{ x: 4 }}
                          >
                            <link.icon className="h-4 w-4 text-orange-500/60 group-hover:text-orange-400 opacity-60 group-hover:opacity-100 transition-all" />
                            <span>{link.label}</span>
                          </motion.a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Community Column */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                        Join Our Community
                      </h4>
                      <p className="text-xs text-fg-secondary">
                        Stay updated with the latest from SRWA
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {/* GitHub Button */}
                      <motion.a
                        href="https://github.com/SRWA-Cypherpunk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(153,69,255,0.3)] transition-all">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            initial={{ x: '-200%' }}
                            whileHover={{ x: '200%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="relative flex items-center gap-2.5 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                              <Github className="h-4 w-4 text-fg-secondary group-hover:text-purple-400 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-fg-primary group-hover:text-purple-300 transition-colors flex-1">
                              GitHub
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.a>

                      {/* Twitter/X Button */}
                      <motion.a
                        href="https://x.com/SRWAdotsol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            initial={{ x: '-200%' }}
                            whileHover={{ x: '200%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="relative flex items-center gap-2.5 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                              <Twitter className="h-4 w-4 text-fg-secondary group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-fg-primary group-hover:text-blue-300 transition-colors flex-1">
                              Twitter / X
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.a>

                      {/* Discord Button */}
                      <motion.a
                        href="https://discord.gg/your-discord-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stroke-line bg-bg-elev-2 group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_20px_rgba(88,101,242,0.3)] transition-all">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            initial={{ x: '-200%' }}
                            whileHover={{ x: '200%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="relative flex items-center gap-2.5 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]/10 group-hover:bg-[#5865F2]/20 transition-colors">
                              {/* Discord Logo SVG */}
                              <svg className="h-4 w-4 text-fg-secondary group-hover:text-[#5865F2] transition-colors" viewBox="0 0 71 55" fill="none">
                                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-fg-primary group-hover:text-[#5865F2] transition-colors flex-1">
                              Discord
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-fg-muted group-hover:text-[#5865F2] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.a>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                  className="pt-8 border-t border-stroke-line/50"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-fg-muted">
                      <p>© 2025 SRWA Platform. All rights reserved.</p>
                      <div className="flex items-center gap-3">
                        <a
                          href="/privacy"
                          className="hover:text-brand-400 transition-colors"
                        >
                          Privacy Policy
                        </a>
                        <span>•</span>
                        <a
                          href="/terms"
                          className="hover:text-brand-400 transition-colors"
                        >
                          Terms of Service
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-fg-muted/80">
                      Built on{' '}
                      <motion.a
                        href="https://solana.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        Solana
                      </motion.a>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </footer>
        </main>
      </div>
    </div>
  );
}