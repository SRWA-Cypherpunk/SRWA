import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarginFiLendingManager } from '@/components/srwa/admin/MarginFiLendingManager';

type PoolStatus = 'active' | 'paused' | 'closed';

type Pool = {
  id: string;
  name: string;
  type: 'raydium' | 'solend' | 'marginfi';
  badges: string[];
  status: PoolStatus;
  totalValueLocked: number;
  supplyApy: number;
  borrowApy: number;
  poolUtilization: number;
  activeUsers: number;
  volume24h: number;
  available: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  performance24h: number;
  tokenSymbol?: string;
};

const MOCK_POOLS: Pool[] = [
  {
    id: '1',
    name: 'Commercial Real Estate Pool',
    type: 'marginfi',
    badges: ['Official', 'CRE'],
    status: 'paused',
    totalValueLocked: 5800000,
    supplyApy: 0.07,
    borrowApy: 0.09,
    poolUtilization: 0.63,
    activeUsers: 116,
    volume24h: 366100,
    available: 5800000,
    riskLevel: 'Low',
    performance24h: 2.5,
    tokenSymbol: 'CRE',
  },
  {
    id: '2',
    name: 'US Treasury Bills Pool',
    type: 'solend',
    badges: ['Official', 'TBill'],
    status: 'paused',
    totalValueLocked: 3600000,
    supplyApy: 0.05,
    borrowApy: 0.06,
    poolUtilization: 0.71,
    activeUsers: 71,
    volume24h: 254500,
    available: 3600000,
    riskLevel: 'Medium',
    performance24h: -1.2,
    tokenSymbol: 'TBILL',
  },
  {
    id: '3',
    name: 'Corporate Bonds Pool',
    type: 'raydium',
    badges: ['Official', 'Receivables'],
    status: 'paused',
    totalValueLocked: 3300000,
    supplyApy: 0.06,
    borrowApy: 0.08,
    poolUtilization: 0.58,
    activeUsers: 66,
    volume24h: 191200,
    available: 3300000,
    riskLevel: 'Low',
    performance24h: 1.8,
    tokenSymbol: 'BOND',
  },
];

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
};

const getStatusColor = (status: PoolStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'paused':
      return 'bg-yellow-500';
    case 'closed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getRiskLevelColor = (risk: 'Low' | 'Medium' | 'High') => {
  switch (risk) {
    case 'Low':
      return 'text-green-400';
    case 'Medium':
      return 'text-yellow-400';
    case 'High':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const getBadgeVariant = (badge: string) => {
  switch (badge.toLowerCase()) {
    case 'official':
      return 'default';
    case 'tbill':
      return 'secondary';
    case 'receivables':
      return 'outline';
    case 'cre':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function PoolsOverview() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate pool loading
    const timer = setTimeout(() => {
      setPools(MOCK_POOLS);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  let poolsContent;

  if (loading) {
    poolsContent = (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  } else if (pools.length === 0) {
    poolsContent = (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">
          No pools created yet. Use the Pool Manager to create your first pool.
        </p>
      </div>
    );
  } else {
    poolsContent = (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-400/10">
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-semibold leading-tight">{pool.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(pool.status)}`} />
                      <span className="text-xs uppercase text-muted-foreground">
                        {pool.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pool.badges.map((badge) => (
                      <Badge key={badge} variant={getBadgeVariant(badge) as any} className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Total Value Locked */}
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Value Locked
                  </p>
                  <p className="text-3xl font-bold text-brand-400">
                    {formatCurrency(pool.totalValueLocked)}
                  </p>
                </div>

                {/* APY */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium uppercase">Supply APY</span>
                    </div>
                    <p className="text-xl font-semibold text-purple-400">
                      {formatPercentage(pool.supplyApy)}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      <span className="font-medium uppercase">Borrow APY</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground">
                      {formatPercentage(pool.borrowApy)}
                    </p>
                  </div>
                </div>

                {/* Pool Utilization */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Pool Utilization
                    </span>
                    <span className="text-xs font-semibold">
                      {formatPercentage(pool.poolUtilization)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-purple-500 transition-all"
                      style={{ width: `${pool.poolUtilization * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3 border-t border-border/30 pt-4">
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Active Users</span>
                    </p>
                    <p className="text-sm font-semibold">{pool.activeUsers}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">24h Volume</p>
                    <p className="text-sm font-semibold">{formatCurrency(pool.volume24h)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Available</p>
                    <p className="text-sm font-semibold">{formatCurrency(pool.available)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Risk Level</p>
                    <p className={`text-sm font-semibold ${getRiskLevelColor(pool.riskLevel)}`}>
                      {pool.riskLevel}
                    </p>
                  </div>
                </div>

                {/* Performance */}
                <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    24h Performance:
                  </span>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      pool.performance24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {pool.performance24h >= 0 ? '+' : ''}
                    {pool.performance24h.toFixed(1)}%
                    <span className="text-xs text-brand-400">Fresh</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-purple-400 hover:bg-purple-400/10 hover:text-purple-300"
                  >
                    Supply
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-foreground hover:bg-muted"
                  >
                    Borrow
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-brand-400/10 hover:text-brand-400"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarginFiLendingManager />
      {poolsContent}
    </div>
  );
}
