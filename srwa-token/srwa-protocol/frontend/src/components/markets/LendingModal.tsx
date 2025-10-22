import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { EnhancedPoolData } from '@/types/markets';
import type { SRWAMarketData } from '@/hooks/markets/useSRWAMarkets';

interface LendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: (EnhancedPoolData | SRWAMarketData) | null;
  mode: 'supply' | 'borrow';
  onTransactionComplete?: (poolAddress: string, amount: number, mode: 'supply' | 'borrow') => void;
}

export const LendingModal: React.FC<LendingModalProps> = ({
  isOpen,
  onClose,
  pool,
  mode,
  onTransactionComplete
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !pool || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Always show success toast
      const actionText = mode === 'supply' ? 'Supply' : 'Borrow';
      toast.success(`${actionText} successful! ${amount} tokens processed for ${pool.name}`);
      
      // Call transaction complete callback to update pool data
      onTransactionComplete?.(pool.address, parseFloat(amount), mode);
      
      // Reset form and close modal
      setAmount('');
      onClose();
    } catch (error) {
      toast.error(`${mode === 'supply' ? 'Supply' : 'Borrow'} failed. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!pool) return null;

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (value: number): string => {
    if (isNaN(value) || value === 0 || !isFinite(value)) return "—";
    return `${value.toFixed(2)}%`;
  };

  const isSupply = mode === 'supply';
  const icon = isSupply ? ArrowUpRight : TrendingDown;
  const title = isSupply ? 'Supply' : 'Borrow';
  const description = isSupply 
    ? 'Deposit tokens to earn yield' 
    : 'Borrow tokens against your collateral';
  const apy = isSupply ? pool.supplyAPY : pool.borrowAPY;
  const buttonClass = isSupply 
    ? 'bg-brand-400 hover:bg-brand-500 text-white'
    : 'bg-orange-500 hover:bg-orange-600 text-white';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-stroke-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fg-primary">
            {React.createElement(icon, { className: "h-5 w-5" })}
            {title} to {pool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pool Info */}
          <div className="p-4 bg-bg-elev-1 rounded-lg border border-stroke-line">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">Pool</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg-primary">{pool.name}</span>
                  {'marketType' in pool && pool.marketType === 'srwa' && (
                    <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                      SRWA
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">{title} APY</span>
                <span className="text-sm font-medium text-brand-400">
                  {formatPercent(apy)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">Total Value Locked</span>
                <span className="text-sm font-medium text-fg-primary">
                  {formatCurrency(pool.tvl)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">Available {isSupply ? 'Capacity' : 'Liquidity'}</span>
                <span className="text-sm font-medium text-fg-primary">
                  {formatCurrency(pool.availableLiquidity)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-fg-primary">
                Amount to {title}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-fg-muted" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 bg-bg-elev-1 border-stroke-line text-fg-primary"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="text-xs text-fg-muted">
              {description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              className={`flex-1 ${buttonClass}`}
            >
              {isProcessing ? `Processing ${title}...` : `Confirm ${title}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};