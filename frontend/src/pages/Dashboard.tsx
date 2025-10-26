import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header, Footer } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import Logo from "@/assets/logo.png";
import SRWALetters from "@/assets/srwa_letters.png";

// Hooks
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletAssets } from '@/hooks/wallet/useWalletAssets';
import { useUserBlendPositions, formatPositionValue } from '@/hooks/markets/useUserBlendPositions';
import { useWalletTransactions } from '@/hooks/wallet/useWalletTransactions';
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";
import { DeployedTokensGrid } from '@/components/srwa/DeployedTokensGrid';
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
  const { connected, publicKey, connecting } = useWallet();
  const address = publicKey?.toBase58() || '';
  
  // Real wallet data hooks
  const walletAssets = useWalletAssets();
  const blendPositions = useUserBlendPositions();
  const recentTransactions = useWalletTransactions();
  
  // User positions based on connected wallet (for backward compatibility)
  const userPositions = connected && blendPositions.positions.length > 0 
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
  const totalSupplied = connected && blendPositions.summary 
    ? blendPositions.summary.totalSupplied / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.supplied.replace(/[$M,K]/g, '')), 0);
    
  const totalBorrowed = connected && blendPositions.summary 
    ? blendPositions.summary.totalBorrowed / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.borrowed.replace(/[$M,K]/g, '')), 0);
    
  const avgHealthFactor = connected && blendPositions.summary 
    ? blendPositions.summary.averageHealthFactor
    : userPositions.length > 0 
      ? userPositions.reduce((acc, pos) => acc + parseFloat(pos.healthFactor), 0) / userPositions.length
      : 0;
      
  const netApy = connected && blendPositions.summary 
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
                {!connected ? (
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
                        
                        <SolanaWalletButton className="w-full !px-6 !py-3 !text-sm" />
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
                        trendValue={userPositions.length > 0 && connected && blendPositions.summary.netProfitLoss !== 0 
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


                    {/* 🚀 DEPLOYED SRWA TOKENS SECTION */}
                    <div className="space-y-6">
                      <DeployedTokensGrid />
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

        </main>

        {/* Footer */}
        <Footer
          showCTA
          ctaAction="top"
          ctaTitle="Ready to Get Started?"
          ctaDescription="Connect your wallet and start exploring institutional-grade RWA markets"
        />
      </div>
    </div>
  );
}
