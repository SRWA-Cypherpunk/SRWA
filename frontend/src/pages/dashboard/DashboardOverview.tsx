import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { DashboardLayout, DashboardSection } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Hooks
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry } from '@/hooks/solana';
import { UserRole } from '@/types/srwa-contracts';

// Icons
import { Plus, BarChart3, TrendingUp, DollarSign, Package, Users } from "lucide-react";

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

  const { userRegistry } = useUserRegistry();
  const isIssuer = userRegistry?.role === UserRole.Issuer || userRegistry?.role === UserRole.Admin;

  const loading = poolsLoading || analyticsLoading || srwaLoading;
  const error = poolsError?.message || analyticsError?.message || srwaError?.message || null;

  // Combine Blend pools and SRWA markets for dashboard stats
  const allMarkets = [...enhancedPools, ...srwaMarkets];

  // Dashboard stats for KPI cards (including SRWA)
  const dashboardStats = allMarkets.length > 0 ? {
    totalValueLocked: `$${(allMarkets.reduce((sum, pool) => sum + pool.tvl, 0) / 1e6).toFixed(1)}M`,
    averageAPY: `${(allMarkets.reduce((sum, pool) => sum + pool.supplyAPY, 0) / allMarkets.length).toFixed(2)}%`,
    tokenizedAssets: allMarkets.filter(pool => pool.status === 'Active').length,
    totalUsers: allMarkets.reduce((sum, pool) => sum + pool.activeUsers, 0)
  } : {
    totalValueLocked: "$0.0M",
    averageAPY: "0.00%",
    tokenizedAssets: 0,
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


  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-purple-500/30 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            TVL: <span className="text-purple-400 font-semibold">${payload[0].value.toFixed(1)}M</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleRefresh = () => {
    refetchPools();
    refetchSRWA();
  };

  return (
    <DashboardLayout>

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

            {isIssuer && (
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
            )}
          </div>

          {/* Dashboard Navigation */}
          <DashboardNav />

          {/* Dashboard Content */}
          <DashboardSection decorativeColor="purple">
              {/* Admin Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card text-card-foreground shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-micro text-fg-muted uppercase">Total Value Locked</p>
                      <div className="flex items-center gap-2">
                        <p className="text-h3 font-semibold text-fg-primary">{loading ? "Loading..." : dashboardStats.totalValueLocked}</p>
                        {!loading && enhancedPools.length > 0 && <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">Live</Badge>}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <DollarSign className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card text-card-foreground shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-micro text-fg-muted uppercase">Average APY</p>
                      <p className="text-h3 font-semibold text-fg-primary">{loading ? "Loading..." : dashboardStats.averageAPY}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card text-card-foreground shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-micro text-fg-muted uppercase">Tokenized Assets</p>
                      <p className="text-h3 font-semibold text-fg-primary">{loading ? "..." : dashboardStats.tokenizedAssets}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <Package className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card text-card-foreground shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-micro text-fg-muted uppercase">Total Users</p>
                      <div className="flex items-center gap-2">
                        <p className="text-h3 font-semibold text-fg-primary">{loading ? "..." : dashboardStats.totalUsers.toLocaleString()}</p>
                        {!loading && enhancedPools.length > 0 && <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">Active</Badge>}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Charts */}
              <div className="grid grid-cols-1 gap-6">
                {/* TVL Trend Chart */}
                <div className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card text-card-foreground shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h3 font-medium text-fg-primary">TVL Trend</h3>
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={poolTVLChartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax+0.5"]} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(153, 69, 255, 0.1)' }} />
                        <Bar dataKey="tvl" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
          </DashboardSection>
    </DashboardLayout>
  );
}
