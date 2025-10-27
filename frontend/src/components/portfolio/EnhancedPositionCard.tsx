import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Lock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssetClassBadge, RiskBadge, YieldBadge, StatusDot, PhaseBadge } from '@/components/ui/StatusBadge';
import { CompactMetric } from '@/components/ui/MetricCard';
import { formatCurrency, formatPercent, formatAPY, formatRelativeTime } from '@/lib/format';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Position {
  id: string;
  marketName: string;
  assetClass?: string;
  suppliedAmount: number;
  suppliedValue: number;
  borrowedAmount: number;
  borrowedValue: number;
  collateralValue: number;
  supplyAPY: number;
  borrowAPY: number;
  netAPY: number;
  healthFactor: number;
  liquidationPrice?: number;
  lastUpdated: number;
  protocol: 'Blend' | 'SRWA';
  phase?: string;
  maturityDate?: number;
  nextDistribution?: number;
  unrealizedPL?: number;
  plPercentage?: number;
}

interface EnhancedPositionCardProps {
  position: Position;
  onSupply?: () => void;
  onWithdraw?: () => void;
  onBorrow?: () => void;
  onRepay?: () => void;
  onManage?: () => void;
  className?: string;
}

const EnhancedPositionCard: React.FC<EnhancedPositionCardProps> = ({
  position,
  onSupply,
  onWithdraw,
  onBorrow,
  onRepay,
  onManage,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine health factor status
  const getHealthStatus = () => {
    if (position.healthFactor >= 2) return { color: 'text-success', bg: 'bg-success', label: 'Healthy', icon: Shield };
    if (position.healthFactor >= 1.5) return { color: 'text-warning', bg: 'bg-warning', label: 'Moderate', icon: AlertTriangle };
    return { color: 'text-error', bg: 'bg-error', label: 'At Risk', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  // Calculate net position value
  const netValue = position.suppliedValue - position.borrowedValue;
  const utilizationRate = position.suppliedValue > 0
    ? (position.borrowedValue / position.suppliedValue) * 100
    : 0;

  // Determine asset class
  const assetClass = position.assetClass || 'T-Bills';

  return (
    <div
      className={cn(
        'bg-elev-1 border border-border-primary rounded-xl transition-all duration-300',
        'hover:border-border-accent hover:shadow-card-hover',
        className
      )}
    >
      {/* Main Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary">
                {position.marketName}
              </h3>
              <StatusDot status="active" pulse size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AssetClassBadge type={assetClass as any} size="xs" />
              {position.protocol === 'SRWA' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  SRWA
                </span>
              )}
              {position.phase && <PhaseBadge phase={position.phase as any} size="xs" />}
            </div>
          </div>

          {/* Health Factor */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <p className="text-xs text-muted">Health Factor</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Health factor indicates your position's safety.
                      Above 2.0 is healthy, below 1.5 risks liquidation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <HealthIcon className={cn('w-5 h-5', healthStatus.color)} />
              <span className={cn('text-2xl font-bold', healthStatus.color)}>
                {position.healthFactor.toFixed(2)}
              </span>
            </div>
            <p className={cn('text-xs mt-1', healthStatus.color)}>
              {healthStatus.label}
            </p>
          </div>
        </div>

        {/* Value Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted mb-1">Supplied</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <p className="text-base font-semibold text-primary">
                {formatCurrency(position.suppliedValue)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Borrowed</p>
            <div className="flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-warning" />
              <p className="text-base font-semibold text-primary">
                {formatCurrency(position.borrowedValue)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Net Value</p>
            <p className={cn(
              'text-base font-semibold',
              netValue >= 0 ? 'text-success' : 'text-error'
            )}>
              {formatCurrency(Math.abs(netValue))}
            </p>
          </div>
        </div>

        {/* APY Display */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-elev-2 rounded-lg">
          <div>
            <p className="text-xs text-muted mb-1">Supply APY</p>
            <YieldBadge apy={position.supplyAPY} size="sm" />
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Borrow APY</p>
            <p className="text-sm font-semibold text-orange">
              -{formatAPY(position.borrowAPY)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Net APY</p>
            <p className={cn(
              'text-sm font-semibold',
              position.netAPY >= 0 ? 'text-success' : 'text-error'
            )}>
              {position.netAPY >= 0 ? '+' : ''}{formatAPY(position.netAPY)}
            </p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted">Utilization Rate</p>
            <p className="text-xs font-medium text-secondary">
              {utilizationRate.toFixed(1)}%
            </p>
          </div>
          <Progress
            value={utilizationRate}
            className="h-2"
            indicatorClassName={cn(
              utilizationRate < 50 ? 'bg-success' :
              utilizationRate < 80 ? 'bg-warning' :
              'bg-error'
            )}
          />
        </div>

        {/* P&L Display (if available) */}
        {position.unrealizedPL !== undefined && (
          <div className="flex items-center justify-between p-3 mb-4 bg-glass backdrop-blur-sm rounded-lg border border-glass">
            <span className="text-sm text-muted">Unrealized P&L</span>
            <div className={cn(
              'flex items-center gap-2',
              position.unrealizedPL >= 0 ? 'text-success' : 'text-error'
            )}>
              {position.unrealizedPL >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {position.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPL)}
              </span>
              {position.plPercentage !== undefined && (
                <span className="text-xs opacity-80">
                  ({position.plPercentage >= 0 ? '+' : ''}{position.plPercentage.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {onSupply && (
            <Button
              onClick={onSupply}
              size="sm"
              variant="default"
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              Supply
            </Button>
          )}
          {onWithdraw && (
            <Button
              onClick={onWithdraw}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Withdraw
            </Button>
          )}
          {onRepay && position.borrowedValue > 0 && (
            <Button
              onClick={onRepay}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Repay
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-5 py-3 flex items-center justify-between border-t border-border-subtle hover:bg-elev-2 transition-colors">
            <span className="text-sm text-muted">
              {isExpanded ? 'Hide' : 'Show'} Details
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-2 space-y-4">
            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <CompactMetric
                label="Collateral Value"
                value={formatCurrency(position.collateralValue)}
                highlightColor="primary"
              />
              {position.liquidationPrice && (
                <CompactMetric
                  label="Liquidation Price"
                  value={formatCurrency(position.liquidationPrice)}
                  highlightColor="error"
                />
              )}
              {position.maturityDate && (
                <CompactMetric
                  label="Maturity"
                  value={formatRelativeTime(position.maturityDate)}
                  highlightColor="info"
                />
              )}
              {position.nextDistribution && (
                <CompactMetric
                  label="Next Distribution"
                  value={formatRelativeTime(position.nextDistribution)}
                  highlightColor="success"
                />
              )}
            </div>

            {/* Risk Warning (if needed) */}
            {position.healthFactor < 1.5 && (
              <div className="flex items-start gap-2 p-3 bg-error-bg rounded-lg border border-error/20">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error mb-1">
                    Liquidation Risk
                  </p>
                  <p className="text-xs text-error/80">
                    Your position is at risk of liquidation. Consider adding collateral or reducing borrowed amount.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Actions */}
            <div className="pt-2">
              {onManage && (
                <Button
                  onClick={onManage}
                  variant="ghost"
                  className="w-full"
                >
                  Manage Position
                </Button>
              )}
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Clock className="w-3 h-3" />
              <span>Updated {formatRelativeTime(position.lastUpdated)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EnhancedPositionCard;