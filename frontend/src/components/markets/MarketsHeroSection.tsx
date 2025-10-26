import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Activity, Users, DollarSign, Percent, BarChart3 } from 'lucide-react';
import MetricCard, { MetricCardGroup, HeroMetricCard } from '@/components/ui/MetricCard';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';

interface MarketsHeroSectionProps {
  className?: string;
}

const MarketsHeroSection: React.FC<MarketsHeroSectionProps> = ({ className }) => {
  const { pools: blendPools, loading: blendLoading } = useBlendPools();
  const { srwaMarkets, loading: srwaLoading } = useSRWAMarkets();

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const allPools = [...(blendPools || []), ...(srwaMarkets || [])];

    const totalTVL = allPools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
    const avgAPY = allPools.length > 0
      ? allPools.reduce((sum, pool) => sum + (pool.supplyAPY || 0), 0) / allPools.length
      : 0;
    const totalVolume24h = allPools.reduce((sum, pool) => sum + (pool.volume24h || 0), 0);
    const activeMarkets = allPools.filter(pool => pool.status === 'active').length;
    const totalInvestors = allPools.reduce((sum, pool) => sum + (pool.activeUsers || 0), 0);
    const successRate = 87.5; // Mock for now

    return {
      totalTVL,
      avgAPY,
      totalVolume24h,
      activeMarkets,
      totalMarkets: allPools.length,
      totalInvestors,
      successRate,
    };
  }, [blendPools, srwaMarkets]);

  // Generate mock TVL trend data
  const tvlTrendData = useMemo(() => {
    const days = 30;
    const baseValue = metrics.totalTVL / 1000000; // Convert to millions
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const variance = Math.random() * 0.2 - 0.1; // ±10% variance
      const value = baseValue * (1 + variance) * (1 + i * 0.01); // Slight upward trend

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(value.toFixed(2)),
      };
    });
  }, [metrics.totalTVL]);

  const loading = blendLoading || srwaLoading;

  // TVL trend chart
  const TVLChart = () => (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={tvlTrendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9945FF" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#9945FF"
          strokeWidth={2}
          fill="url(#tvlGradient)"
        />
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--text-muted)' }}
          formatter={(value: any) => [`$${value}M`, 'TVL']}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero Title Section with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-dark-subtle p-8">
        {/* Background mesh gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'var(--gradient-mesh)',
          }}
        />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-primary mb-2">
            RWA Markets
          </h1>
          <p className="text-muted text-lg">
            Discover and invest in tokenized real-world assets with institutional-grade security
          </p>
        </div>
      </div>

      {/* Main metrics grid */}
      <MetricCardGroup>
        <HeroMetricCard
          title="Total Value Locked"
          value={`$${(metrics.totalTVL / 1000000).toFixed(2)}M`}
          trend={{
            value: 12.5,
            direction: 'up',
            period: '30d'
          }}
          icon={<DollarSign className="w-5 h-5" />}
          variant="glass"
          highlightColor="primary"
          loading={loading}
          chart={<TVLChart />}
          tooltip="Total value locked across all SRWA markets and pools"
        />

        <MetricCard
          title="Average Yield"
          value={`${metrics.avgAPY.toFixed(2)}%`}
          subtitle="APY across all pools"
          trend={{
            value: 0.8,
            direction: 'up',
            period: '7d'
          }}
          icon={<Percent className="w-5 h-5" />}
          variant="glass"
          highlightColor="secondary"
          loading={loading}
          tooltip="Weighted average yield across all active markets"
        />

        <MetricCard
          title="24h Volume"
          value={`$${(metrics.totalVolume24h / 1000000).toFixed(2)}M`}
          trend={{
            value: 24.3,
            direction: 'up',
            period: '24h'
          }}
          icon={<Activity className="w-5 h-5" />}
          variant="glass"
          highlightColor="info"
          loading={loading}
          tooltip="Total trading volume in the last 24 hours"
        />

        <MetricCard
          title="Active Markets"
          value={metrics.activeMarkets}
          subtitle={`of ${metrics.totalMarkets} total`}
          icon={<BarChart3 className="w-5 h-5" />}
          variant="glass"
          highlightColor="success"
          loading={loading}
          tooltip="Number of markets currently accepting investments"
        />
      </MetricCardGroup>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Total Investors"
          value={metrics.totalInvestors.toLocaleString()}
          subtitle="Unique wallet addresses"
          trend={{
            value: 8.2,
            direction: 'up',
            period: '30d'
          }}
          icon={<Users className="w-5 h-5" />}
          variant="bordered"
          size="sm"
          loading={loading}
          tooltip="Total number of unique investors across all markets"
        />

        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          subtitle="Pools reaching target"
          trend={{
            value: 2.1,
            direction: 'up',
            period: '90d'
          }}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="bordered"
          size="sm"
          loading={loading}
          tooltip="Percentage of pools that successfully reached their funding target"
        />
      </div>

      {/* Market Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: 'T-Bills', count: 12, color: 'bg-asset-tbills', textColor: 'text-asset-tbills' },
          { name: 'Receivables', count: 8, color: 'bg-asset-receivables', textColor: 'text-asset-receivables' },
          { name: 'Real Estate', count: 6, color: 'bg-asset-cre', textColor: 'text-asset-cre' },
          { name: 'Debentures', count: 4, color: 'bg-asset-debentures', textColor: 'text-asset-debentures' },
        ].map((category) => (
          <div
            key={category.name}
            className={cn(
              'relative overflow-hidden rounded-lg border border-border-subtle',
              'bg-elev-1 hover:bg-elev-2 transition-all duration-200',
              'p-4 cursor-pointer group'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity',
                category.color
              )}
            />
            <div className="relative z-10">
              <p className="text-sm text-muted mb-1">{category.name}</p>
              <p className={cn('text-2xl font-bold', category.textColor)}>
                {category.count}
              </p>
              <p className="text-xs text-muted mt-1">Active pools</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-glass backdrop-blur-md border border-glass rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted">Live Activity</h3>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs text-success ml-1">Live</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { action: 'New Investment', pool: 'US T-Bills Pool #3', amount: '$50,000', time: '2 mins ago' },
            { action: 'Pool Opened', pool: 'Brazil CRI Fund', amount: '$2.5M target', time: '5 mins ago' },
            { action: 'Settlement Complete', pool: 'Real Estate Token #12', amount: '$1.2M', time: '12 mins ago' },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 text-xs animate-fadeIn"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted">{activity.action}</span>
                <span className="text-primary">{activity.pool}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary font-semibold">{activity.amount}</span>
                <span className="text-muted">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketsHeroSection;