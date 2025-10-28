import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  ChevronRight,
  Clock,
  DollarSign,
  BarChart3,
  Info,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssetClassBadge, RiskBadge, ComplianceBadge, YieldBadge, StatusDot, PhaseBadge } from '@/components/ui/StatusBadge';
import { CompactMetric } from '@/components/ui/MetricCard';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';

interface EnhancedPoolCardProps {
  pool: any; // Using any for now, should be properly typed
  onSupply?: () => void;
  onBorrow?: () => void;
  onDetails?: () => void;
  className?: string;
}

const EnhancedPoolCard: React.FC<EnhancedPoolCardProps> = ({
  pool,
  onSupply,
  onBorrow,
  onDetails,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine asset class from pool data
  const getAssetClass = () => {
    const name = pool.name?.toLowerCase() || '';
    if (name.includes('bill') || name.includes('treasury')) return 'T-Bills';
    if (name.includes('receivable') || name.includes('cri') || name.includes('cra')) return 'Receivables';
    if (name.includes('real estate') || name.includes('cre')) return 'CRE';
    if (name.includes('debenture')) return 'Debentures';
    if (name.includes('fidc')) return 'FIDC';
    return 'T-Bills';
  };

  // Get risk level based on pool data
  const getRiskLevel = () => {
    // Validate pool.riskLevel if it exists
    const validRiskLevels = ['low', 'medium', 'high', 'experimental'];
    if (pool.riskLevel && validRiskLevels.includes(pool.riskLevel)) {
      return pool.riskLevel;
    }

    // Fallback to APY-based calculation
    const apy = pool.supplyAPY || 0;
    if (apy < 5) return 'low';
    if (apy < 10) return 'medium';
    if (apy < 15) return 'high';
    return 'experimental';
  };

  // Calculate pool utilization
  const utilization = pool.utilization || ((pool.borrowedAmount || 0) / (pool.tvl || 1)) * 100;
  const utilizationColor = utilization < 50 ? 'bg-green-400' : utilization < 80 ? 'bg-orange-400' : 'bg-red-400';

  // Determine pool status
  const isActive = pool.status === 'active';
  const isLocked = pool.phase === 'OfferLocked' || pool.phase === 'OfferClosed';
  const hasWarning = pool.type === 'unverified' || getRiskLevel() === 'high' || getRiskLevel() === 'experimental';

  // Calculate funding progress (for offering pools)
  const fundingProgress = pool.raised ? (pool.raised / (pool.hardCap || pool.raised)) * 100 : 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300',
        'bg-bg-elev-1 hover:bg-bg-elev-2',
        'border-brand-500/20 hover:border-brand-500/30',
        isHovered && 'shadow-2xl shadow-brand-500/20',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay for premium feel */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(153,69,255,0.05), transparent 50%)'
        }}
      />

      {/* Header Section */}
      <div className="relative p-4 pb-3 border-b border-brand-500/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Pool Name and Status */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary line-clamp-1">
                {pool.name}
              </h3>
              <StatusDot
                status={isActive ? 'active' : isLocked ? 'pending' : 'inactive'}
                pulse={isActive}
              />
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <AssetClassBadge type={getAssetClass()} size="xs" />
              <RiskBadge level={getRiskLevel()} showLabel={false} size="xs" />
              {pool.phase && <PhaseBadge phase={pool.phase} size="xs" />}
              {pool.isOfficial && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  Official
                </span>
              )}
              {pool.type === 'community' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange rounded-full text-xs">
                  <Users className="w-3 h-3" />
                  Community
                </span>
              )}
            </div>
          </div>

          {/* TVL Display */}
          <div className="text-right">
            <p className="text-xs text-fg-muted">TVL</p>
            <p className="text-xl font-bold text-brand-400">
              ${formatNumber(pool.tvl / 1000000)}M
            </p>
          </div>
        </div>

        {/* Warning Banner (if needed) */}
        {hasWarning && (
          <div className="flex items-center gap-2 p-2 mt-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-xs text-orange-400">
              {pool.type === 'unverified' ? 'Unverified pool - invest with caution' :
               getRiskLevel() === 'experimental' ? 'Experimental asset - higher risk' :
               'High risk investment - suitable for experienced investors'}
            </p>
          </div>
        )}
      </div>

      {/* Yields Section */}
      <div className="p-4 pb-3 border-b border-brand-500/10">
        <div className="grid grid-cols-2 gap-4">
          {/* Supply APY */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-fg-muted">Supply APY</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-fg-muted cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-bg-elev-2 border-brand-500/30">
                    <p>Annual percentage yield for supplying liquidity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <YieldBadge
                apy={pool.supplyAPY || 0}
                trending={pool.supplyAPYTrend}
                size="sm"
              />
            </div>
          </div>

          {/* Borrow APY */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-muted">Borrow APY</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Annual percentage yield for borrowing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg font-semibold text-orange">
              {formatPercent(pool.borrowAPY || 0)}%
            </p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted">Pool Utilization</p>
            <p className="text-xs font-medium text-secondary">
              {utilization.toFixed(1)}%
            </p>
          </div>
          <div className="h-2 bg-elev-2 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500', utilizationColor)}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Funding Progress (for offerings) */}
        {pool.raised !== undefined && pool.hardCap && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted">Funding Progress</p>
              <p className="text-xs font-medium text-primary">
                ${formatNumber(pool.raised / 1000000)}M / ${formatNumber(pool.hardCap / 1000000)}M
              </p>
            </div>
            <Progress value={fundingProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="p-4 pb-3 grid grid-cols-2 gap-3">
        <CompactMetric
          label="Active Users"
          value={formatNumber(pool.activeUsers || 0)}
          highlightColor="info"
        />
        <CompactMetric
          label="24h Volume"
          value={`$${formatNumber((pool.volume24h || 0) / 1000000)}M`}
          highlightColor="success"
        />
        <CompactMetric
          label="Available"
          value={`$${formatNumber((pool.availableLiquidity || pool.tvl * 0.3) / 1000000)}M`}
          highlightColor="primary"
        />
        <CompactMetric
          label="Min Investment"
          value={`$${formatNumber(pool.minTicket || 100)}`}
          highlightColor="warning"
        />
      </div>

      {/* Additional Info (for offerings) */}
      {pool.phase && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-4 text-xs">
            {pool.startTs && (
              <div className="flex items-center gap-1 text-muted">
                <Clock className="w-3 h-3" />
                <span>Ends {new Date(pool.endTs * 1000).toLocaleDateString()}</span>
              </div>
            )}
            {pool.maxInvestors && (
              <div className="flex items-center gap-1 text-muted">
                <Users className="w-3 h-3" />
                <span>{pool.investors || 0}/{pool.maxInvestors} investors</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compliance Info */}
      <div className="px-4 pb-3">
        <ComplianceBadge
          type={pool.requireKYC ? 'KYC Required' :
                pool.eligibility?.includes('Accredited') ? 'Accredited Only' :
                pool.eligibility?.includes('Institutional') ? 'Institutional' :
                'Open'}
          size="xs"
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-3 border-t border-brand-500/10">
        <div className="flex gap-2">
          <Button
            onClick={onSupply}
            disabled={!isActive || isLocked}
            size="sm"
            className="flex-1 bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 hover:from-brand-500 hover:via-brand-400 hover:to-orange-400 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-brand-500/25"
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Earn
              </>
            )}
          </Button>
          <Button
            onClick={onDetails}
            size="sm"
            variant="ghost"
            className="px-3 hover:bg-brand-500/10 border border-brand-500/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Data Freshness Indicator */}
      <div className="absolute top-2 right-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                'w-2 h-2 rounded-full',
                pool.dataFresh ? 'bg-success' : 'bg-warning'
              )} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {pool.dataFresh ? 'Real-time data' : 'Data may be stale'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Premium/Featured Indicator */}
      {pool.featured && (
        <div className="absolute top-4 left-0">
          <div className="bg-gradient-premium text-white px-2 py-1 text-xs font-semibold rounded-r-lg">
            <Star className="w-3 h-3 inline mr-1" />
            Featured
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPoolCard;