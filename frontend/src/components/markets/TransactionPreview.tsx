import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Shield,
  DollarSign,
  Clock,
  Activity,
  ArrowRight
} from 'lucide-react';
import { TransactionPreview as ITransactionPreview } from '@/types/lending';
import { cn } from '@/lib/utils';

interface TransactionPreviewProps {
  preview: ITransactionPreview;
  className?: string;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({ 
  preview, 
  className 
}) => {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatAmount = (amount: bigint, decimals: number = 7): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(decimals === 6 ? 2 : 4);
  };

  const getActionIcon = () => {
    switch (preview.type) {
      case 'supply':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'borrow':
        return <TrendingDown className="h-5 w-5 text-orange-400" />;
      case 'withdraw':
        return <TrendingDown className="h-5 w-5 text-blue-400" />;
      case 'repay':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      default:
        return <Activity className="h-5 w-5 text-fg-muted" />;
    }
  };

  const getActionColor = () => {
    switch (preview.type) {
      case 'supply':
      case 'repay':
        return 'text-green-400';
      case 'borrow':
        return 'text-orange-400';
      case 'withdraw':
        return 'text-blue-400';
      default:
        return 'text-fg-muted';
    }
  };

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 2) return 'text-green-400';
    if (healthFactor >= 1.5) return 'text-yellow-400';
    if (healthFactor >= 1.2) return 'text-orange-400';
    return 'text-red-400';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 0.5) return 'text-green-400';
    if (rate < 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className={cn("bg-card border-stroke-line", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-h3">
          {getActionIcon()}
          <span className={getActionColor()}>
            {preview.type.charAt(0).toUpperCase() + preview.type.slice(1)} Preview
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-body-2 text-fg-muted">Asset</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-brand-500/10 text-brand-400 border-brand-500/20">
                {preview.asset.symbol}
              </Badge>
              <span className="text-body-2 font-medium text-fg-primary">
                {preview.asset.name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-body-2 text-fg-muted">Amount</span>
            <div className="text-right">
              <div className="text-body-1 font-semibold text-fg-primary tabular-nums">
                {formatAmount(preview.amount, preview.asset.decimals)} {preview.asset.symbol}
              </div>
              <div className="text-micro text-fg-muted">
                {formatCurrency(preview.amountUSD)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-body-2 text-fg-muted">Estimated Gas Fee</span>
            <div className="text-right">
              <div className="text-body-2 text-fg-primary tabular-nums">
                {formatAmount(preview.estimatedGasFee)} XLM
              </div>
              <div className="text-micro text-fg-muted">
                {formatCurrency(Number(preview.estimatedGasFee) / 1e7 * 0.12)}
              </div>
            </div>
          </div>

          {preview.slippage && (
            <div className="flex items-center justify-between">
              <span className="text-body-2 text-fg-muted">Max Slippage</span>
              <div className="text-body-2 text-fg-primary tabular-nums">
                {(preview.slippage * 100).toFixed(2)}%
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-stroke-line" />

        {/* Impact Analysis */}
        <div className="space-y-4">
          <h4 className="text-body-1 font-semibold text-fg-primary flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Impact Analysis
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-2 text-fg-muted">New Pool Utilization</span>
              <div className="flex items-center gap-2">
                <span className={cn("text-body-2 font-medium tabular-nums", getUtilizationColor(preview.newUtilizationRate))}>
                  {(preview.newUtilizationRate * 100).toFixed(1)}%
                </span>
                <div className="w-16 h-2 bg-bg-elev-2 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      preview.newUtilizationRate < 0.5 ? 'bg-green-400' :
                      preview.newUtilizationRate < 0.8 ? 'bg-yellow-400' : 'bg-red-400'
                    )}
                    style={{ width: `${preview.newUtilizationRate * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {preview.newHealthFactor && (
              <div className="flex items-center justify-between">
                <span className="text-body-2 text-fg-muted">Health Factor</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-body-2 font-medium tabular-nums", getHealthFactorColor(preview.newHealthFactor))}>
                    {preview.newHealthFactor.toFixed(2)}
                  </span>
                  {preview.newHealthFactor < 1.5 && (
                    <Shield className="h-4 w-4 text-orange-400" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warnings */}
        {preview.warnings.length > 0 && (
          <>
            <Separator className="bg-stroke-line" />
            <div className="space-y-3">
              <h4 className="text-body-1 font-semibold text-orange-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </h4>
              
              <div className="space-y-2">
                {preview.warnings.map((warning, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-md"
                  >
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-body-2 text-orange-400">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-stroke-line" />

        {/* Transaction Status */}
        <div className="flex items-center justify-between p-3 bg-bg-elev-1 rounded-md">
          <div className="flex items-center gap-2">
            {preview.canProceed ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-body-2 text-green-400 font-medium">
                  Ready to proceed
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-body-2 text-red-400 font-medium">
                  Cannot proceed
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-micro text-fg-muted">
            <Clock className="h-3 w-3" />
            Live preview
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-brand-500/5 to-transparent border border-brand-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-brand-400" />
            <span className="text-body-2 font-medium text-brand-400">Transaction Summary</span>
          </div>
          <p className="text-body-2 text-fg-secondary leading-relaxed">
            You are about to <span className="font-medium text-fg-primary">{preview.type}</span>{' '}
            <span className="font-medium text-brand-400">
              {formatAmount(preview.amount, preview.asset.decimals)} {preview.asset.symbol}
            </span>{' '}
            ({formatCurrency(preview.amountUSD)}) with an estimated gas fee of{' '}
            <span className="font-medium text-fg-primary">
              {formatAmount(preview.estimatedGasFee)} XLM
            </span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};