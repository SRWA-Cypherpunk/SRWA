import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Shield,
  Activity,
  PieChart,
  Calendar,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import MetricCard, { MetricCardGroup } from '@/components/ui/MetricCard';
import { StatusDot, RiskBadge, ComplianceBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { formatCurrency, formatNumber, formatPercent, formatAPY } from '@/lib/format';

interface PortfolioOverviewProps {
  userAddress?: string;
  positions?: any[];
  srwaTokens?: any[];
  purchaseOrders?: any[];
  className?: string;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  userAddress,
  positions = [],
  srwaTokens = [],
  purchaseOrders = [],
  className
}) => {
  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    // Calculate total portfolio value
    const totalSupplied = positions.reduce((sum, pos) => sum + (pos.suppliedValue || 0), 0);
    const totalBorrowed = positions.reduce((sum, pos) => sum + (pos.borrowedValue || 0), 0);
    const srwaValue = srwaTokens.reduce((sum, token) => sum + (token.value || 0), 0);
    const pendingOrders = purchaseOrders
      .filter(order => {
        const status = order.account?.status;
        return status && 'pending' in status;
      })
      .reduce((sum, order) => sum + Number(order.account?.totalLamports || 0) / 1e9, 0); // Convert lamports to SOL

    // Calculate weighted APY
    const totalWeightedAPY = positions.reduce((sum, pos) => {
      const netValue = (pos.suppliedValue || 0) - (pos.borrowedValue || 0);
      return sum + (netValue * (pos.netAPY || 0));
    }, 0);
    const netValue = totalSupplied - totalBorrowed;
    const weightedAPY = netValue > 0 ? totalWeightedAPY / netValue : 0;

    // Calculate average health factor
    const avgHealthFactor = positions.length > 0
      ? positions.reduce((sum, pos) => sum + (pos.healthFactor || 0), 0) / positions.length
      : 0;

    // Risk score calculation (1-10 scale)
    let riskScore = 5; // Base score
    if (avgHealthFactor < 1.5) riskScore += 3;
    else if (avgHealthFactor < 2) riskScore += 1;
    else riskScore -= 1;

    // Diversification bonus
    const uniqueAssets = new Set(positions.map(p => p.marketName)).size;
    if (uniqueAssets > 5) riskScore -= 2;
    else if (uniqueAssets > 3) riskScore -= 1;

    riskScore = Math.max(1, Math.min(10, riskScore)); // Clamp 1-10

    // Calculate unrealized P&L (mock data)
    const unrealizedPL = netValue * 0.052; // Mock 5.2% gain
    const plPercentage = netValue > 0 ? (unrealizedPL / netValue) * 100 : 0;

    return {
      totalPortfolioValue: totalSupplied + srwaValue - totalBorrowed,
      totalSupplied,
      totalBorrowed,
      srwaValue,
      pendingOrders,
      netValue,
      weightedAPY,
      avgHealthFactor,
      riskScore,
      unrealizedPL,
      plPercentage,
      positionCount: positions.length,
      srwaCount: srwaTokens.length,
      pendingOrderCount: purchaseOrders.filter(o => {
        const status = o.account?.status;
        return status && 'pending' in status;
      }).length,
    };
  }, [positions, srwaTokens, purchaseOrders]);

  // Generate performance chart data
  const performanceData = useMemo(() => {
    const days = 30;
    const baseValue = metrics.totalPortfolioValue;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const variance = Math.sin(i / 5) * 0.05 + Math.random() * 0.02;
      const value = baseValue * (1 + variance) * (1 + i * 0.002);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(value.toFixed(2)),
        pnl: Number((value - baseValue).toFixed(2))
      };
    });
  }, [metrics.totalPortfolioValue]);

  // Asset allocation data
  const allocationData = useMemo(() => {
    const allocation: Record<string, number> = {};

    // Group positions by asset type
    positions.forEach(pos => {
      const type = pos.assetClass || 'Other';
      allocation[type] = (allocation[type] || 0) + (pos.suppliedValue || 0);
    });

    // Add SRWA tokens
    if (srwaTokens.length > 0) {
      allocation['RWA Tokens'] = metrics.srwaValue;
    }

    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / metrics.totalPortfolioValue) * 100).toFixed(1)
    }));
  }, [positions, srwaTokens, metrics]);

  // Colors for pie chart
  const COLORS = ['#9945FF', '#14F195', '#FF6B35', '#42A5F5', '#FFA726'];

  // Next distributions/events
  const upcomingEvents = [
    { type: 'Distribution', asset: 'US T-Bills Pool', date: 'Dec 15, 2024', amount: '$125' },
    { type: 'Maturity', asset: 'Brazil CRI Token', date: 'Dec 20, 2024', amount: '$5,000' },
    { type: 'Unlock', asset: 'Real Estate Fund', date: 'Jan 1, 2025', amount: '$10,000' },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Portfolio Value */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-institutional p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-mesh" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/80 mb-1">Total Portfolio Value</p>
              <h1 className="text-4xl font-bold text-white">
                {formatCurrency(metrics.totalPortfolioValue)}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Unrealized P&L</p>
              <div className={cn('flex items-center gap-2', metrics.unrealizedPL >= 0 ? 'text-secondary' : 'text-error')}>
                {metrics.unrealizedPL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-2xl font-semibold">
                  {metrics.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(metrics.unrealizedPL)}
                </span>
                <span className="text-sm opacity-80">
                  ({metrics.plPercentage >= 0 ? '+' : ''}{metrics.plPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60">Weighted APY</p>
              <p className="text-xl font-semibold text-secondary">
                {formatAPY(metrics.weightedAPY)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60">Health Factor</p>
              <p className={cn(
                'text-xl font-semibold',
                metrics.avgHealthFactor >= 2 ? 'text-secondary' :
                metrics.avgHealthFactor >= 1.5 ? 'text-warning' :
                'text-error'
              )}>
                {metrics.avgHealthFactor.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60">Risk Score</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-white">
                  {metrics.riskScore}/10
                </p>
                <RiskBadge
                  level={metrics.riskScore <= 3 ? 'low' : metrics.riskScore <= 6 ? 'medium' : 'high'}
                  showLabel={false}
                  size="xs"
                />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60">Positions</p>
              <p className="text-xl font-semibold text-white">
                {metrics.positionCount + metrics.srwaCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <MetricCardGroup>
        <MetricCard
          title="Total Supplied"
          value={formatCurrency(metrics.totalSupplied)}
          subtitle={`Across ${metrics.positionCount} positions`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="glass"
          highlightColor="primary"
        />
        <MetricCard
          title="Total Borrowed"
          value={formatCurrency(metrics.totalBorrowed)}
          subtitle="Active loans"
          icon={<Activity className="w-5 h-5" />}
          variant="glass"
          highlightColor="warning"
        />
        <MetricCard
          title="RWA Tokens"
          value={formatCurrency(metrics.srwaValue)}
          subtitle={`${metrics.srwaCount} tokens`}
          icon={<Shield className="w-5 h-5" />}
          variant="glass"
          highlightColor="success"
        />
        <MetricCard
          title="Pending Orders"
          value={formatCurrency(metrics.pendingOrders)}
          subtitle={`${metrics.pendingOrderCount} orders`}
          icon={<Lock className="w-5 h-5" />}
          variant="glass"
          highlightColor="info"
        />
      </MetricCardGroup>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-elev-1 border-border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9945FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9945FF"
                  strokeWidth={2}
                  fill="url(#valueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Allocation Pie Chart */}
        <Card className="bg-elev-1 border-border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="bg-elev-1 border-border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Upcoming Events</CardTitle>
            <StatusDot status="active" pulse />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-elev-2 rounded-lg">
                <div className="flex items-center gap-3">
                  {event.type === 'Distribution' && <DollarSign className="w-5 h-5 text-success" />}
                  {event.type === 'Maturity' && <Calendar className="w-5 h-5 text-warning" />}
                  {event.type === 'Unlock' && <Lock className="w-5 h-5 text-info" />}
                  <div>
                    <p className="text-sm font-medium text-primary">{event.type}</p>
                    <p className="text-xs text-muted">{event.asset}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-secondary">{event.amount}</p>
                  <p className="text-xs text-muted">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card className="bg-glass backdrop-blur-md border-glass">
        <CardHeader>
          <CardTitle className="text-primary">Compliance & Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-elev-1 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm">KYC Status</span>
              </div>
              <ComplianceBadge type="KYC Required" size="xs" />
            </div>
            <div className="flex items-center justify-between p-3 bg-elev-1 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm">Accredited</span>
              </div>
              <span className="text-xs text-success font-medium">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-elev-1 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-sm">Institutional</span>
              </div>
              <span className="text-xs text-warning font-medium">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;