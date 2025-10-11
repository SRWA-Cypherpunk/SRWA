import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Zap,
  Shield
} from 'lucide-react';
import { EnhancedPoolData } from '@/types/markets';
import { BlendPool } from '@/types/lending';
import { SRWAMarketData } from '@/hooks/markets/useSRWAMarkets';
import { cn } from '@/lib/utils';

interface PoolCardProps {
  pool: (EnhancedPoolData & Partial<BlendPool>) | SRWAMarketData; // Support Blend pools and SRWA markets
  onViewDetails: (poolAddress: string) => void;
  onSupply: (poolAddress: string) => void;
  onBorrow: (poolAddress: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

export const PoolCard: React.FC<PoolCardProps> = ({ 
  pool, 
  onViewDetails, 
  onSupply, 
  onBorrow,
  compact = false,
  showActions = true 
}) => {
  // ===== UTILITY FUNCTIONS =====
  
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || !isFinite(amount)) {
      return "$0.00";
    }
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (value: number): string => {
    if (isNaN(value) || value === 0 || !isFinite(value)) {
      return "—"; // Em dash for better visual appearance
    }
    return `${value.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-brand-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-fg-muted" />;
    }
  };

  const getStatusIndicator = (status: EnhancedPoolData['status']) => {
    const config = {
      'Active': { color: 'bg-brand-400', pulse: true },
      'Paused': { color: 'bg-yellow-400', pulse: false },
      'Degraded': { color: 'bg-red-400', pulse: false }
    };
    
    const statusConfig = config[status];
    
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          statusConfig.color,
          statusConfig.pulse && "animate-pulse"
        )} />
        <span className="text-micro text-fg-secondary uppercase tracking-wide">
          {status}
        </span>
      </div>
    );
  };

  const getClassBadge = (poolClass: EnhancedPoolData['class']) => {
    const configs = {
      'TBill': { color: 'bg-brand-500/10 text-brand-400 border-brand-500/20', icon: Shield },
      'Receivables': { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Activity },
      'CRE': { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: DollarSign }
    };
    
    const config = configs[poolClass];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        {poolClass}
      </Badge>
    );
  };

  const getPoolTypeBadge = () => {
    // Check if this is an SRWA market
    if ('marketType' in pool && pool.marketType === 'srwa') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          <Zap className="h-3 w-3" />
          SRWA Token
        </Badge>
      );
    }
    
    const poolType = pool.poolType || 'official';
    
    if (poolType === 'community') {
      const verified = pool.verified;
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "flex items-center gap-1",
            verified 
              ? "bg-green-500/10 text-green-400 border-green-500/20" 
              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
          )}
        >
          <Users className="h-3 w-3" />
          {verified ? 'Verified Community' : 'Community'}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
        <CheckCircle className="h-3 w-3" />
        Official
      </Badge>
    );
  };

  const getRiskLevelBadge = () => {
    if (!pool.riskLevel) return null;
    
    const configs = {
      'Low': { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: Shield },
      'Medium': { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: AlertTriangle },
      'High': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertTriangle },
      'Experimental': { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Zap }
    };
    
    const config = configs[pool.riskLevel];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        {pool.riskLevel} Risk
      </Badge>
    );
  };

  const getRiskIndicator = (riskScore: number) => {
    if (riskScore < 0.3) return { color: 'text-brand-400', label: 'Low Risk' };
    if (riskScore < 0.6) return { color: 'text-yellow-400', label: 'Medium Risk' };
    return { color: 'text-red-400', label: 'High Risk' };
  };

  const getCommunityPoolWarnings = () => {
    if (pool.poolType !== 'community') return [];
    
    const warnings: Array<{ level: 'info' | 'warning' | 'error'; message: string; icon: React.ReactNode }> = [];
    
    // Verification warnings
    if (!pool.verified) {
      warnings.push({
        level: 'warning',
        message: 'Unverified community pool. Code and security not audited.',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    // Risk level warnings
    if (pool.riskLevel === 'High' || pool.riskLevel === 'Experimental') {
      warnings.push({
        level: pool.riskLevel === 'Experimental' ? 'error' : 'warning',
        message: pool.riskLevel === 'Experimental' 
          ? 'Experimental pool - may contain untested features'
          : 'High risk pool - potential for significant losses',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    // Data freshness warnings
    if (pool.dataFreshness === 'Stale' || pool.dataFreshness === 'Outdated') {
      warnings.push({
        level: pool.dataFreshness === 'Outdated' ? 'error' : 'warning',
        message: pool.dataFreshness === 'Outdated'
          ? 'Pool data is outdated - rates may be inaccurate'
          : 'Pool data is stale - rates may not be current',
        icon: <Clock className="h-4 w-4" />
      });
    }
    
    // Status warnings
    if (pool.status === 'Degraded') {
      warnings.push({
        level: 'error',
        message: 'Pool is experiencing issues - deposits/withdrawals may be limited',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    if (pool.status === 'Paused') {
      warnings.push({
        level: 'error',
        message: 'Pool is paused - no new transactions allowed',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    // New pool warning (less than 7 days old)
    const poolAge = Date.now() - (pool.createdAt || 0);
    if (poolAge < 7 * 24 * 60 * 60 * 1000) {
      warnings.push({
        level: 'info',
        message: 'New community pool - limited transaction history',
        icon: <Clock className="h-4 w-4" />
      });
    }
    
    return warnings;
  };

  const getWarningColor = (level: 'info' | 'warning' | 'error') => {
    switch (level) {
      case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'warning': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (isNaN(rate) || !isFinite(rate)) return 'bg-gray-400';
    if (rate < 0.5) return 'bg-brand-400';
    if (rate < 0.8) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const risk = getRiskIndicator(pool.riskScore);

  // ===== RENDER =====

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-brand-400/50 bg-card border-stroke-line hover:shadow-lg hover:shadow-brand-400/10",
      compact ? "h-64" : "h-auto min-h-[320px]"
    )}>
      {/* Top gradient indicator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardContent className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-h3 font-semibold text-fg-primary mb-1">
                {pool.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {getPoolTypeBadge()}
                {getClassBadge(pool.class)}
                {getRiskLevelBadge()}
                {getStatusIndicator(pool.status)}
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-micro text-fg-muted uppercase tracking-wide">Total Value Locked</div>
            <div className="text-h3 font-bold text-fg-primary tabular-nums">
              {formatCurrency(pool.tvl)}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-400" />
              <span className="text-micro text-fg-muted uppercase tracking-wide">Supply APY</span>
              {getTrendIcon(pool.apyTrend)}
            </div>
            <div className="text-body-1 font-semibold text-brand-400 tabular-nums">
              {formatPercent(pool.supplyAPY)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-fg-muted" />
              <span className="text-micro text-fg-muted uppercase tracking-wide">Borrow APY</span>
              {getTrendIcon(pool.apyTrend)}
            </div>
            <div className="text-body-1 font-semibold text-fg-primary tabular-nums">
              {formatPercent(pool.borrowAPY)}
            </div>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-micro text-fg-muted uppercase tracking-wide">Pool Utilization</span>
            <span className="text-body-2 font-medium text-fg-secondary tabular-nums">
              {formatPercent(pool.utilizationRate)}
            </span>
          </div>
          <div className="relative h-2 bg-bg-elev-2 rounded-full overflow-hidden group-hover:h-2.5 transition-all duration-300">
            <div 
              className={cn(
                "h-full transition-all duration-700 rounded-full relative overflow-hidden",
                getUtilizationColor(pool.utilizationRate / 100)
              )}
              style={{ width: `${Math.min(100, pool.utilizationRate)}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </div>
          </div>
        </div>

        {!compact && (
          <>
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-stroke-line">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-fg-muted" />
                  <span className="text-micro text-fg-muted">Active Users</span>
                </div>
                <span className="text-body-2 font-medium text-fg-secondary tabular-nums">
                  {pool.activeUsers}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-fg-muted" />
                  <span className="text-micro text-fg-muted">24h Volume</span>
                </div>
                <span className="text-body-2 font-medium text-fg-secondary tabular-nums">
                  {formatCurrency(pool.volume24h)}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-fg-muted" />
                  <span className="text-micro text-fg-muted">Available</span>
                </div>
                <span className="text-body-2 font-medium text-fg-secondary tabular-nums">
                  {formatCurrency(pool.availableLiquidity)}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-fg-muted" />
                  <span className="text-micro text-fg-muted">Risk Level</span>
                </div>
                <span className={cn("text-body-2 font-medium tabular-nums", risk.color)}>
                  {risk.label.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Community Pool Info */}
            {pool.poolType === 'community' && (
              <div className="space-y-3 py-4 border-t border-stroke-line bg-bg-elev-1/50 -mx-6 px-6">
                <div className="flex items-center gap-2 text-fg-secondary">
                  <Users className="h-4 w-4" />
                  <span className="text-micro uppercase tracking-wide">Community Pool</span>
                </div>
                
                {pool.description && (
                  <p className="text-body-2 text-fg-secondary">
                    {pool.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {pool.creator && (
                    <div className="space-y-1">
                      <span className="text-micro text-fg-muted">Creator</span>
                      <span className="text-body-2 font-medium text-fg-secondary truncate block">
                        {pool.creator.split('@')[0]}
                      </span>
                    </div>
                  )}
                  
                  {pool.tags && pool.tags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-micro text-fg-muted">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {pool.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-bg-elev-2 text-fg-muted border-stroke-line">
                            {tag}
                          </Badge>
                        ))}
                        {pool.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-bg-elev-2 text-fg-muted border-stroke-line">
                            +{pool.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Community Pool Warnings */}
                {getCommunityPoolWarnings().map((warning, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center gap-2 p-2 border rounded-md",
                    getWarningColor(warning.level)
                  )}>
                    <div className="flex-shrink-0">
                      {warning.icon}
                    </div>
                    <span className="text-micro">
                      {warning.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Performance & Data Freshness */}
            <div className="flex items-center justify-between text-micro">
              <div className="flex items-center gap-2">
                <span className="text-fg-muted">24h Performance:</span>
                <span className={cn(
                  "font-medium tabular-nums",
                  pool.performance24h >= 0 ? 'text-brand-400' : 'text-red-400'
                )}>
                  {pool.performance24h >= 0 ? '+' : ''}{formatPercent(pool.performance24h * 100)}
                </span>
              </div>
              
              <div className={cn(
                "font-medium",
                pool.dataFreshness === 'Fresh' ? 'text-brand-400' :
                pool.dataFreshness === 'Stale' ? 'text-yellow-400' : 'text-red-400'
              )}>
                {pool.dataFreshness}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 pt-4 border-t border-stroke-line">
            <Button 
              variant="outline"
              className="flex-1 border-brand-400/20 hover:border-brand-400 hover:bg-brand-400/10 text-brand-400 transition-all duration-200 hover:shadow-md hover:shadow-brand-400/20 pointer-events-auto"
              onClick={() => onSupply(pool.address)}
              disabled={pool.status !== 'Active'}
            >
              Supply
            </Button>
            
            <Button 
              variant="outline"
              className="flex-1 border-stroke-line hover:border-fg-muted hover:bg-bg-elev-2 transition-all duration-200 pointer-events-auto"
              onClick={() => onBorrow(pool.address)}
              disabled={pool.status !== 'Active'}
            >
              Borrow
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="px-3 hover:bg-bg-elev-2 group-hover:text-brand-400 transition-all duration-200 pointer-events-auto"
              onClick={() => onViewDetails(pool.address)}
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};