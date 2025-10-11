import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Filter,
  Sparkles,
  Shield,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useUserRWATokens } from '@/hooks/useUserRWATokens';
import { RWALendingModal } from './RWALendingModal';
import { cn } from '@/lib/utils';

interface LendingPool {
  address: string;
  name: string;
  description: string;
  tvl: number;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  activeUsers: number;
  supportedAssets: string[];
  rwaFriendly: boolean;
  category: 'stable' | 'volatile' | 'mixed';
  risk: 'low' | 'medium' | 'high';
}

const MOCK_LENDING_POOLS: LendingPool[] = [
  {
    address: "CBLENDPOOLXLMXRP1234567890ABCDEF1234567890ABCDEF123456",
    name: "XLM-XRP Stability Pool",
    description: "Conservative lending pool for stable returns with XLM and XRP",
    tvl: 2400000,
    supplyAPY: 6.8,
    borrowAPY: 9.2,
    utilization: 72,
    activeUsers: 156,
    supportedAssets: ["XLM", "XRP"],
    rwaFriendly: true,
    category: 'stable',
    risk: 'low'
  },
  {
    address: "CBLENDPOOLUSDC1234567890ABCDEF1234567890ABCDEF123456",
    name: "USDC Stablecoin Pool",
    description: "High-liquidity USDC pool with competitive rates",
    tvl: 8900000,
    supplyAPY: 4.5,
    borrowAPY: 6.8,
    utilization: 85,
    activeUsers: 423,
    supportedAssets: ["USDC", "USDT"],
    rwaFriendly: true,
    category: 'stable',
    risk: 'low'
  },
  {
    address: "CBLENDPOOLBTC1234567890ABCDEF1234567890ABCDEF123456",
    name: "BTC Premium Pool",
    description: "High-yield Bitcoin lending with RWA collateral support",
    tvl: 15200000,
    supplyAPY: 3.2,
    borrowAPY: 5.8,
    utilization: 68,
    activeUsers: 89,
    supportedAssets: ["BTC", "ETH"],
    rwaFriendly: true,
    category: 'volatile',
    risk: 'medium'
  },
  {
    address: "CBLENDPOOLDIVERSIFIED1234567890ABCDEF1234567890ABC",
    name: "Diversified Asset Pool",
    description: "Multi-asset pool supporting various tokens including RWA",
    tvl: 5600000,
    supplyAPY: 5.9,
    borrowAPY: 8.4,
    utilization: 76,
    activeUsers: 234,
    supportedAssets: ["XLM", "USDC", "BTC", "ETH", "RWA"],
    rwaFriendly: true,
    category: 'mixed',
    risk: 'medium'
  },
  {
    address: "CBLENDPOOLHIGHYIELD1234567890ABCDEF1234567890ABCDEF",
    name: "High Yield Growth Pool",
    description: "Aggressive growth strategy with higher returns and risk",
    tvl: 3100000,
    supplyAPY: 8.7,
    borrowAPY: 12.3,
    utilization: 89,
    activeUsers: 67,
    supportedAssets: ["Various"],
    rwaFriendly: false,
    category: 'volatile',
    risk: 'high'
  }
];

interface RWALendingPoolsProps {
  showOnlyRWAFriendly?: boolean;
}

export const RWALendingPools: React.FC<RWALendingPoolsProps> = ({
  showOnlyRWAFriendly = true
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'tvl' | 'supplyAPY' | 'borrowAPY' | 'utilization'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<LendingPool | null>(null);
  const [lendingModal, setLendingModal] = useState<{
    isOpen: boolean;
    defaultTab: 'supply' | 'borrow';
    selectedTokenIndex: number;
  }>({
    isOpen: false,
    defaultTab: 'supply',
    selectedTokenIndex: 0
  });

  // Hooks
  const { tokens, loading: tokensLoading } = useUserRWATokens();

  // Filtered and sorted pools
  const filteredPools = useMemo(() => {
    let pools = showOnlyRWAFriendly 
      ? MOCK_LENDING_POOLS.filter(pool => pool.rwaFriendly)
      : MOCK_LENDING_POOLS;

    // Apply filters
    if (searchQuery) {
      pools = pools.filter(pool =>
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      pools = pools.filter(pool => pool.category === selectedCategory);
    }

    if (selectedRisk !== 'all') {
      pools = pools.filter(pool => pool.risk === selectedRisk);
    }

    // Sort pools
    pools.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return pools;
  }, [searchQuery, selectedCategory, selectedRisk, sortBy, sortOrder, showOnlyRWAFriendly]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-fg-muted bg-bg-elev-1 border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stable': return Shield;
      case 'volatile': return TrendingUp;
      case 'mixed': return BarChart3;
      default: return Activity;
    }
  };

  const handleSupplyToPool = (pool: LendingPool, tokenIndex: number = 0) => {
    setSelectedPool(pool);
    setLendingModal({
      isOpen: true,
      defaultTab: 'supply',
      selectedTokenIndex: tokenIndex
    });
  };

  const handleBorrowFromPool = (pool: LendingPool, tokenIndex: number = 0) => {
    setSelectedPool(pool);
    setLendingModal({
      isOpen: true,
      defaultTab: 'borrow',
      selectedTokenIndex: tokenIndex
    });
  };

  const closeLendingModal = () => {
    setLendingModal({
      isOpen: false,
      defaultTab: 'supply',
      selectedTokenIndex: 0
    });
    setSelectedPool(null);
  };

  if (tokensLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-h2 font-semibold text-fg-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-400" />
              RWA Lending Pools
            </h2>
            <p className="text-body-2 text-fg-muted">
              Supply your RWA tokens or use them as collateral in these lending pools
            </p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-muted w-4 h-4" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="volatile">Volatile</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tvl">TVL</SelectItem>
              <SelectItem value="supplyAPY">Supply APY</SelectItem>
              <SelectItem value="borrowAPY">Borrow APY</SelectItem>
              <SelectItem value="utilization">Utilization</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-fg-muted">Total RWA TVL</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(filteredPools.reduce((sum, pool) => sum + pool.tvl, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-fg-muted">Avg Supply APY</p>
                <p className="text-lg font-semibold text-green-400">
                  {(filteredPools.reduce((sum, pool) => sum + pool.supplyAPY, 0) / filteredPools.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-fg-muted">Active Users</p>
                <p className="text-lg font-semibold">
                  {filteredPools.reduce((sum, pool) => sum + pool.activeUsers, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pools Grid */}
      {filteredPools.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-bg-elev-2 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-fg-muted" />
            </div>
            <div className="space-y-2">
              <h3 className="text-h3 font-medium text-fg-primary">No Pools Found</h3>
              <p className="text-body-2 text-fg-muted max-w-md mx-auto">
                No lending pools match your current filters. Try adjusting your search criteria.
              </p>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRisk('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPools.map((pool, index) => {
            const CategoryIcon = getCategoryIcon(pool.category);
            
            return (
              <div key={pool.address}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <CategoryIcon className="w-4 h-4 text-brand-400" />
                          {pool.name}
                        </CardTitle>
                        <p className="text-sm text-fg-muted">{pool.description}</p>
                      </div>
                      <Badge className={getRiskColor(pool.risk)}>
                        {pool.risk}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-fg-muted uppercase tracking-wider">TVL</p>
                        <p className="font-semibold">{formatCurrency(pool.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-fg-muted uppercase tracking-wider">Users</p>
                        <p className="font-semibold">{pool.activeUsers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-fg-muted uppercase tracking-wider">Supply APY</p>
                        <p className="font-semibold text-green-400">{pool.supplyAPY}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-fg-muted uppercase tracking-wider">Borrow APY</p>
                        <p className="font-semibold text-blue-400">{pool.borrowAPY}%</p>
                      </div>
                    </div>

                    {/* Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-fg-muted">Utilization</span>
                        <span className="font-medium">{pool.utilization}%</span>
                      </div>
                      <div className="w-full bg-bg-elev-2 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pool.utilization}%` }}
                        />
                      </div>
                    </div>

                    {/* Supported Assets */}
                    <div className="space-y-2">
                      <p className="text-xs text-fg-muted uppercase tracking-wider">Supported Assets</p>
                      <div className="flex flex-wrap gap-1">
                        {pool.supportedAssets.slice(0, 3).map((asset) => (
                          <Badge key={asset} variant="secondary" className="text-xs">
                            {asset}
                          </Badge>
                        ))}
                        {pool.supportedAssets.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{pool.supportedAssets.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSupplyToPool(pool)}
                        className="flex items-center gap-1"
                        disabled={tokens.length === 0}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        Supply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBorrowFromPool(pool)}
                        className="flex items-center gap-1"
                        disabled={tokens.length === 0}
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        Borrow
                      </Button>
                    </div>

                    {tokens.length === 0 && (
                      <p className="text-xs text-amber-400 text-center">
                        Create RWA tokens to use lending pools
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* RWA Lending Modal */}
      {selectedPool && tokens.length > 0 && (
        <RWALendingModal
          isOpen={lendingModal.isOpen}
          onClose={closeLendingModal}
          token={tokens[lendingModal.selectedTokenIndex]}
          defaultTab={lendingModal.defaultTab}
        />
      )}
    </div>
  );
};
