import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { PageBackground } from '@/components/layout/PageBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import MetricCard, { MetricCardGroup, HeroMetricCard } from '@/components/ui/MetricCard';
import { AssetClassBadge, StatusDot, PhaseBadge, ComplianceBadge } from '@/components/ui/StatusBadge';
import EnhancedPoolCard from '@/components/markets/EnhancedPoolCard';
import { CreateSRWAModal } from '@/components/srwa/CreateSRWAModal';
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Activity, Users, DollarSign, Shield, BarChart3,
  Plus, Settings, RefreshCw, Filter, FileText, Building2,
  CheckCircle, Clock, AlertCircle, Lock
} from 'lucide-react';
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useIssuanceRequests } from '@/hooks/solana/useIssuanceRequests';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatCurrency, formatNumber, formatAPY } from '@/lib/format';

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { publicKey } = useWallet();
  const { pools: blendPools, loading: blendLoading } = useBlendPools();
  const { srwaMarkets, loading: srwaLoading } = useSRWAMarkets();
  const { requests, loading: requestsLoading } = useIssuanceRequests();

  // Calculate platform metrics
  const metrics = useMemo(() => {
    const allPools = [...(blendPools || []), ...(srwaMarkets || [])];
    const totalTVL = allPools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
    const avgAPY = allPools.length > 0
      ? allPools.reduce((sum, pool) => sum + (pool.supplyAPY || 0), 0) / allPools.length
      : 0;
    const activePools = allPools.filter(p => p.status === 'active').length;
    const totalUsers = allPools.reduce((sum, pool) => sum + (pool.activeUsers || 0), 0);

    // SRWA specific metrics
    const pendingRequests = requests?.filter(r => r.status === 'Pending').length || 0;
    const deployedTokens = requests?.filter(r => r.status === 'Deployed').length || 0;
    const totalTokenValue = srwaMarkets?.reduce((sum, market) => sum + (market.tvl || 0), 0) || 0;

    return {
      totalTVL,
      avgAPY,
      activePools,
      totalPools: allPools.length,
      totalUsers,
      pendingRequests,
      deployedTokens,
      totalTokenValue,
      blendTVL: blendPools?.reduce((sum, p) => sum + (p.tvl || 0), 0) || 0,
      srwaTVL: srwaMarkets?.reduce((sum, m) => sum + (m.tvl || 0), 0) || 0,
    };
  }, [blendPools, srwaMarkets, requests]);

  // Generate TVL trend data
  const tvlTrendData = useMemo(() => {
    const days = 30;
    const baseValue = metrics.totalTVL / 1000000;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const variance = Math.sin(i / 5) * 0.05 + Math.random() * 0.02;
      const value = baseValue * (1 + variance) * (1 + i * 0.003);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: Number(value.toFixed(2)),
        blend: Number((value * 0.6).toFixed(2)),
        srwa: Number((value * 0.4).toFixed(2))
      };
    });
  }, [metrics.totalTVL]);

  // Distribution data for pie chart
  const distributionData = [
    { name: 'T-Bills', value: metrics.totalTVL * 0.35, color: '#42A5F5' },
    { name: 'Receivables', value: metrics.totalTVL * 0.25, color: '#9945FF' },
    { name: 'Real Estate', value: metrics.totalTVL * 0.20, color: '#FF6B35' },
    { name: 'Debentures', value: metrics.totalTVL * 0.15, color: '#14F195' },
    { name: 'Other', value: metrics.totalTVL * 0.05, color: '#666666' }
  ];

  const loading = blendLoading || srwaLoading || requestsLoading;

  // Recent requests for admin view
  const recentRequests = requests?.slice(0, 5) || [];

  return (
    <PageBackground variant="subtle">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-lg text-fg-secondary mt-1">
              Platform overview and management
            </p>
          </div>
          <div className="flex gap-3">
            <HeroButton
              onClick={() => setShowCreateModal(true)}
              variant="brand"
              className="!px-4 !py-2.5 !text-sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Create SRWA
            </HeroButton>
            <Button
              variant="outline"
              size="sm"
              className="bg-glass border-glass hover:bg-elev-1"
              onClick={() => console.log('Refresh')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-glass border-glass hover:bg-elev-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <MetricCardGroup>
              <HeroMetricCard
                title="Total Value Locked"
                value={`$${formatNumber(metrics.totalTVL / 1000000)}M`}
                trend={{ value: 15.2, direction: 'up', period: '30d' }}
                icon={<DollarSign className="w-5 h-5" />}
                variant="glass"
                highlightColor="primary"
                loading={loading}
                tooltip="Total value locked across all pools and tokens"
              />
              <MetricCard
                title="Average APY"
                value={`${formatAPY(metrics.avgAPY)}`}
                subtitle="Across all pools"
                trend={{ value: 0.5, direction: 'up', period: '7d' }}
                icon={<TrendingUp className="w-5 h-5" />}
                variant="glass"
                highlightColor="secondary"
                loading={loading}
              />
              <MetricCard
                title="Active Pools"
                value={metrics.activePools}
                subtitle={`of ${metrics.totalPools} total`}
                icon={<Activity className="w-5 h-5" />}
                variant="glass"
                highlightColor="success"
                loading={loading}
              />
              <MetricCard
                title="Total Users"
                value={formatNumber(metrics.totalUsers)}
                subtitle="Active investors"
                trend={{ value: 8.3, direction: 'up', period: '30d' }}
                icon={<Users className="w-5 h-5" />}
                variant="glass"
                highlightColor="info"
                loading={loading}
              />
            </MetricCardGroup>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TVL Trend Chart */}
              <Card className="lg:col-span-2 bg-elev-1 border-border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">TVL Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={tvlTrendData}>
                      <defs>
                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9945FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="blendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14F195" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}M`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => `$${value}M`}
                      />
                      <Area type="monotone" dataKey="total" stroke="#9945FF" strokeWidth={2}
                        fill="url(#totalGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribution Pie Chart */}
              <Card className="bg-elev-1 border-border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Asset Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${((entry.value / metrics.totalTVL) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-primary">Active Pools</h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...(blendPools || []), ...(srwaMarkets || [])].slice(0, 6).map((pool, index) => (
                <EnhancedPoolCard
                  key={pool.publicKey || `pool-${index}`}
                  pool={pool}
                  onSupply={() => console.log('Supply', pool.publicKey)}
                  onBorrow={() => console.log('Borrow', pool.publicKey)}
                  onDetails={() => console.log('Details', pool.publicKey)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Requests */}
              <Card className="bg-elev-1 border-border-primary">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center justify-between">
                    <span>Pending Requests</span>
                    <StatusDot status="pending" pulse />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentRequests.filter(r => r.status === 'Pending').map((request) => (
                    <div key={request.requestId} className="p-3 bg-elev-2 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">{request.name}</span>
                        <PhaseBadge phase="PreOffer" size="xs" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{request.symbol}</span>
                        <span>•</span>
                        <span>{formatCurrency(request.offering?.target?.hardCap || 0)}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="default" className="flex-1">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recentRequests.filter(r => r.status === 'Pending').length === 0 && (
                    <p className="text-center text-muted py-6">No pending requests</p>
                  )}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-elev-1 border-border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-elev-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusDot status="active" pulse size="sm" />
                      <span className="text-sm">Smart Contracts</span>
                    </div>
                    <span className="text-xs text-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-elev-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusDot status="active" pulse size="sm" />
                      <span className="text-sm">Oracle Feed</span>
                    </div>
                    <span className="text-xs text-success">Live</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-elev-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusDot status="active" pulse size="sm" />
                      <span className="text-sm">KYC Provider</span>
                    </div>
                    <span className="text-xs text-success">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-elev-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusDot status="pending" size="sm" />
                      <span className="text-sm">Yield Adapter</span>
                    </div>
                    <span className="text-xs text-warning">Syncing</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <Card className="bg-glass backdrop-blur-md border-glass">
              <CardHeader>
                <CardTitle className="text-primary">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-xs">Reports</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <Building2 className="h-6 w-6 mb-2" />
                    <span className="text-xs">KYC Settings</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <Shield className="h-6 w-6 mb-2" />
                    <span className="text-xs">Compliance</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-xs">Configure</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create SRWA Modal */}
      <CreateSRWAModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </PageBackground>
  );
}