import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowUpRight, DollarSign, Users, Activity } from 'lucide-react';
import type { DeployedToken } from '@/hooks/solana/useDeployedTokens';

interface AvailableTokenCardProps {
  token: DeployedToken;
  priceLabel?: string;
  className?: string;
  disabled?: boolean;
  onAction?: () => void;
}

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

export function AvailableTokenCard({
  token,
  priceLabel = '0.01 SOL',
  className = '',
  disabled,
  onAction
}: AvailableTokenCardProps) {
  // Mock data para demonstração
  const mockData = {
    supplyApy: token.supplyAPY,
    activeUsers: 0,
    volume24h: 0,
    available: token.tvl,
    riskLevel: 'Low' as const,
    status: 'paused' as const,
  };

  return (
    <Card className={`group relative overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-400/10 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight mb-2">{token.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/10">
                Official
              </Badge>
              <Badge variant="secondary" className={`text-xs border ${getProtocolBadgeColor(token.yieldConfig.protocol)}`}>
                {token.yieldConfig.protocol}
              </Badge>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <span className="text-xs uppercase text-muted-foreground">
                  {mockData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Value Locked */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Value Locked
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Preço
            </p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-brand-400">
              {formatCurrency(token.tvl)}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {priceLabel}
            </p>
          </div>
        </div>

        {/* APY & Symbol */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium uppercase">Target APY</span>
              <span className="ml-auto">—</span>
            </div>
            <p className="text-xl font-semibold text-purple-400">
              {mockData.supplyApy.toFixed(2)}%
            </p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium uppercase">Symbol</span>
              <span className="ml-auto">—</span>
            </div>
            <p className="text-xl font-semibold text-foreground font-mono">
              {token.symbol}
            </p>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Token Disponível
            </span>
            <span className="text-xs font-semibold">
              100%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-purple-500 transition-all"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3 border-t border-border/30 pt-4">
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Compradores</span>
            </p>
            <p className="text-sm font-semibold">{mockData.activeUsers}</p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>24h Volume</span>
            </p>
            <p className="text-sm font-semibold">{formatCurrency(mockData.volume24h)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 inline mr-1" />
              Disponível
            </p>
            <p className="text-sm font-semibold">{formatCurrency(mockData.available)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Risk Level
            </p>
            <p className="text-sm font-semibold text-green-400">
              {mockData.riskLevel}
            </p>
          </div>
        </div>

        {/* Protocol Info */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            Protocolo:
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold capitalize text-brand-400">
            {token.yieldConfig.protocol}
            <span className="text-xs text-purple-400">Fresh</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onAction}
            disabled={disabled}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Comprar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-brand-400/10 hover:text-brand-400"
            onClick={() => {
              window.open(`https://solscan.io/token/${token.mint.toBase58()}?cluster=devnet`, '_blank');
            }}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
