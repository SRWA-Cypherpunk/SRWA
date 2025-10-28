import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { DashboardLayout, DashboardSection } from "@/components/layout";
import { HeroButton } from "@/components/ui/hero-button";
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Hooks
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { usePurchaseOrders, useRaydiumPools } from '@/hooks/solana';
import type { DeployedToken } from '@/hooks/solana/useDeployedTokens';
import { RaydiumPoolOperations } from '@/components/raydium/RaydiumPoolOperations';

// Icons
import { Plus, Zap, Loader2, RefreshCw, TrendingUp, DollarSign, Users, Activity, ArrowUpRight, Search, SlidersHorizontal, Grid3x3, List, ExternalLink, Copy } from "lucide-react";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const getProtocolBadgeColor = (protocol: string) => {
  switch (protocol.toLowerCase()) {
    case 'marginfi':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'solend':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'raydium':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

function TokenCard({ token, onBuy }: { token: DeployedToken; onBuy: (token: DeployedToken) => void }) {
  const mockData = {
    supplyApy: token.supplyAPY,
    borrowApy: 0.06,
    poolUtilization: 0.63,
    activeUsers: 0,
    volume24h: 0,
    available: token.tvl,
    riskLevel: 'Low' as const,
    status: 'paused' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-purple-500/30 bg-background transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{token.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/10">
                  <span className="mr-1">✓</span> Official
                </Badge>
                <Badge className={`text-xs ${getProtocolBadgeColor(token.yieldConfig.protocol)}`}>
                  {token.symbol}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-xs uppercase text-muted-foreground">
                    {mockData.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Value
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Locked
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(token.tvl)}
              </p>
            </div>
          </div>

          {/* APY Grid */}
          <div className="mb-5 grid grid-cols-2 gap-6">
            <div>
              <div className="mb-2 flex items-center text-[11px] text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium uppercase tracking-wide">Supply APY</span>
                <span className="ml-auto">—</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {mockData.supplyApy.toFixed(2)}%
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center text-[11px] text-muted-foreground">
                <DollarSign className="h-3 w-3 mr-1" />
                <span className="font-medium uppercase tracking-wide">Borrow APY</span>
                <span className="ml-auto">—</span>
              </div>
              <p className="text-2xl font-bold">
                {mockData.borrowApy.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Pool Utilization */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="font-medium uppercase tracking-wide text-muted-foreground">
                Pool Utilization
              </span>
              <span className="font-semibold">
                {(mockData.poolUtilization * 100).toFixed(2)}%
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${mockData.poolUtilization * 100}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="mb-1 flex items-center text-[11px] text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                <span>Active Users</span>
              </p>
              <p className="text-base font-semibold">{mockData.activeUsers}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center text-[11px] text-muted-foreground">
                <Activity className="h-3 w-3 mr-1" />
                <span>24h Volume</span>
              </p>
              <p className="text-base font-semibold">{formatCurrency(mockData.volume24h)}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center text-[11px] text-muted-foreground">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>Available</span>
              </p>
              <p className="text-base font-semibold">{formatCurrency(mockData.available)}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center text-[11px] text-muted-foreground">
                <span className="h-3 w-3 inline-block mr-1" />
                <span>Risk Level</span>
              </p>
              <p className="text-base font-semibold text-purple-400">
                {mockData.riskLevel}
              </p>
            </div>
          </div>

          {/* Performance */}
          <div className="mb-5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">24h Performance:</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-purple-400">←</span>
              <span className="text-purple-400">Fresh</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="flex-1 h-11 text-purple-400 hover:bg-purple-400/10 hover:text-purple-300"
              onClick={() => {
                toast.info('Supply feature coming soon!');
              }}
            >
              Supply
            </Button>
            <Button
              variant="ghost"
              className="flex-1 h-11 text-purple-400 hover:bg-purple-400/10 hover:text-purple-300"
              onClick={() => onBuy(token)}
            >
              Borrow
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 hover:bg-purple-400/10 hover:text-purple-400"
              onClick={() => {
                window.open(`https://solscan.io/token/${token.mint.toBase58()}?cluster=devnet`, '_blank');
              }}
            >
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardMarkets() {
  const navigate = useNavigate();

  // Fetch Blend pools data
  const {
    pools: blendPools,
    loading: poolsLoading,
    error: poolsError,
    refetch: refetchPools
  } = useBlendPools();

  // Enhance pools with DefIndex analytics
  const {
    enhancedPools,
    loading: analyticsLoading,
    error: analyticsError
  } = useEnhancedPoolData(blendPools);

  // Fetch SRWA markets from deployed tokens
  const {
    srwaMarkets,
    loading: srwaLoading,
    error: srwaError,
    refetch: refetchSRWA
  } = useSRWAMarkets();

  const {
    tokens: deployedTokens,
    loading: deployedTokensLoading,
    error: deployedTokensError,
    refresh: refreshDeployedTokens
  } = useDeployedTokens();

  const purchaseOrders = usePurchaseOrders();

  // Fetch Raydium pools registered on-chain
  const {
    pools: raydiumPools,
    loading: raydiumPoolsLoading,
    error: raydiumPoolsError,
    refresh: refreshRaydiumPools
  } = useRaydiumPools();

  // State for new UI
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedToken, setSelectedToken] = useState<DeployedToken | null>(null);
  const [selectedRaydiumPoolId, setSelectedRaydiumPoolId] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);

  // Combined loading and error states
  const loading = poolsLoading || analyticsLoading || srwaLoading;
  const error = poolsError?.message || analyticsError?.message || srwaError?.message || null;

  // Navigation handlers
  const handleViewPoolDetails = (poolAddress: string) => {
    setSelectedRaydiumPoolId(poolAddress);
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
    refreshDeployedTokens();
  };

  const handleBuy = async () => {
    if (!selectedToken || !purchaseQuantity) {
      toast.error('Por favor, informe a quantidade');
      return;
    }

    try {
      setBuyLoading(true);

      const quantity = parseInt(purchaseQuantity);
      if (quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero');
        return;
      }

      await purchaseOrders.createOrder(selectedToken.mint, quantity);

      toast.success(`Purchase order criada! ${quantity} tokens de ${selectedToken.symbol}`);
      setSelectedToken(null);
      setPurchaseQuantity('');
    } catch (error: any) {
      console.error('Erro ao criar purchase order:', error);
      toast.error(error.message || 'Erro ao criar purchase order');
    } finally {
      setBuyLoading(false);
    }
  };

  const filteredTokens = deployedTokens.filter((token) =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalTVL = deployedTokens.reduce((sum, t) => sum + t.tvl, 0);
  const avgSupplyAPY = deployedTokens.length > 0
    ? deployedTokens.reduce((sum, t) => sum + t.supplyAPY, 0) / deployedTokens.length
    : 0;

  return (
    <DashboardLayout>
      {/* Header with Create SRWA Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
            Lending Markets
          </h1>
          <p className="text-base sm:text-lg text-fg-secondary mt-2">
            Discover and interact with lending pools on Solana
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

      {/* SRWA Tokens Section with New UI */}
      <DashboardSection
        title="Tokens SRWA disponíveis"
        description="Compre tokens SRWA com SOL (Devnet POC)"
        decorativeColor="orange"
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total TVL
                  </p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalTVL)}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg Supply APY
                  </p>
                </div>
                <p className="text-3xl font-bold text-purple-400">{avgSupplyAPY.toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    24h Volume
                  </p>
                </div>
                <p className="text-3xl font-bold">$0.0K</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Markets
                  </p>
                </div>
                <p className="text-3xl font-bold">
                  0/{deployedTokens.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">3 Blend • 0 SRWA</p>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Lending Pools</h2>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {deployedTokens.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshDeployedTokens}
                disabled={deployedTokensLoading}
              >
                <RefreshCw className={`h-5 w-5 ${deployedTokensLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-0 rounded-lg bg-muted p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tvl">Total Value Locked</SelectItem>
                <SelectItem value="apy">APY</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tokens Grid */}
          {deployedTokensLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-12 text-center">
              <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'Nenhum token encontrado' : 'Nenhum token disponível'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredTokens.map((token) => (
                <TokenCard
                  key={token.mint.toBase58()}
                  token={token}
                  onBuy={setSelectedToken}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardSection>

      {/* Raydium Pools Section */}
      <DashboardSection
        title="Raydium Liquidity Pools"
        description="Pools de liquidez CPMM criadas no Raydium com tokens SRWA"
        decorativeColor="cyan"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {raydiumPools.length} pools registradas
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshRaydiumPools}
              disabled={raydiumPoolsLoading}
            >
              <RefreshCw className={`h-5 w-5 ${raydiumPoolsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {raydiumPoolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : raydiumPoolsError ? (
            <Card className="border-red-500/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-red-400">{raydiumPoolsError}</p>
              </CardContent>
            </Card>
          ) : raydiumPools.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-base font-medium text-muted-foreground">
                  Nenhuma pool Raydium registrada ainda
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Crie uma pool no painel admin para vê-la aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {raydiumPools.map((pool, index) => {
                const tokenInfo = deployedTokens.find(t => t.mint.toBase58() === pool.tokenMint.toBase58());

                return (
                  <motion.div
                    key={pool.publicKey.toBase58()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="border-cyan-500/30 bg-background hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-base font-bold mb-1">
                                {tokenInfo?.symbol || 'SRWA'} / SOL
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {tokenInfo?.name || 'SRWA Token'}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                              CPMM
                            </Badge>
                          </div>

                          {/* Pool Info */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Pool ID:</span>
                              <span className="font-mono text-[10px]">
                                {pool.poolId.toBase58().slice(0, 4)}...{pool.poolId.toBase58().slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Token:</span>
                              <span className="font-mono text-[10px]">
                                {pool.tokenMint.toBase58().slice(0, 4)}...{pool.tokenMint.toBase58().slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Base:</span>
                              <span className="font-mono text-[10px]">
                                {pool.baseMint.toBase58().slice(0, 4)}...{pool.baseMint.toBase58().slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span className="text-[10px]">
                                {new Date(pool.createdAt * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleViewPoolDetails(pool.poolId.toBase58())}
                            >
                              Ver Pool
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                window.open(`https://raydium.io/clmm/pools/?pool_id=${pool.poolId.toBase58()}&cluster=devnet`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                navigator.clipboard.writeText(pool.poolId.toBase58());
                                toast.success('Pool ID copiado!');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardSection>

      {/* Markets Tab Content */}
      <DashboardSection
        title={
          <>
            Available Lending Pools
            <span className="inline-block ml-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 inline" />
            </span>
          </>
        }
        description="Supply assets to earn interest or borrow against your collateral"
        decorativeColor="purple"
      >
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
      </DashboardSection>

      {/* Raydium Pool Dialog */}
      <Dialog
        open={!!selectedRaydiumPoolId}
        onOpenChange={(open) => !open && setSelectedRaydiumPoolId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Operações Raydium</DialogTitle>
            <DialogDescription>
              Execute swaps ou gerencie liquidez para o pool selecionado diretamente da dashboard.
            </DialogDescription>
          </DialogHeader>
          {selectedRaydiumPoolId && (
            <RaydiumPoolOperations poolId={selectedRaydiumPoolId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedToken} onOpenChange={(open) => !open && setSelectedToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprar {selectedToken?.symbol}</DialogTitle>
            <DialogDescription>
              Informe a quantidade de tokens que deseja comprar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold">{selectedToken?.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedToken?.symbol}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 100"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Preço: 0.01 SOL por token
              </p>
            </div>

            {purchaseQuantity && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-lg font-bold text-purple-400">
                    {(parseFloat(purchaseQuantity) * 0.01).toFixed(4)} SOL
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedToken(null)}
                disabled={buyLoading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleBuy}
                disabled={buyLoading || !purchaseQuantity}
              >
                {buyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Pagar ${(parseFloat(purchaseQuantity || '0') * 0.01).toFixed(4)} SOL`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
