import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header } from '@/components/layout/Header';
import { PageBackground } from '@/components/layout/PageBackground';
import { DashboardSection } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Hooks
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useWallet } from '@/contexts/wallet/WalletContext';

// Icons
import { Plus, BarChart3 } from "lucide-react";

export default function DashboardOverview() {
  const navigate = useNavigate();

  // Wallet connection
  const { isConnected, address, connect, isConnecting } = useWallet();

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

  // Combine Blend pools and SRWA markets for dashboard stats
  const allMarkets = [...enhancedPools, ...srwaMarkets];

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

  const handleRefresh = () => {
    refetchPools();
    refetchSRWA();
  };

  return (
    <PageBackground variant="subtle">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <DashboardNav />

        {/* Header with Create SRWA Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-base sm:text-lg text-fg-secondary mt-2">
                Real-time lending pool metrics and analytics
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

          {/* Dashboard Navigation */}
          <DashboardNav />

          {/* Dashboard Content */}
          <DashboardSection decorativeColor="blue">
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
          </DashboardSection>
      </main>
    </PageBackground>
  );
}