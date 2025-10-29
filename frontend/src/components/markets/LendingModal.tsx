import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpRight, TrendingDown, DollarSign, ShoppingCart, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import type { EnhancedPoolData } from '@/types/markets';
import type { SRWAMarketData } from '@/hooks/markets/useSRWAMarkets';
import { useTokenPurchaseRequests } from '@/hooks/solana/useTokenPurchaseRequests';
import { useKYCStatus } from '@/hooks/solana/useKYCStatus';

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
  const wallet = useWallet();
  const { createPurchaseRequest } = useTokenPurchaseRequests();
  const { kycStatus } = useKYCStatus();

  // Check if this is an SRWA token
  const isSRWAToken = pool && 'marketType' in pool && pool.marketType === 'SRWA';
  const srwaPool = isSRWAToken ? (pool as SRWAMarketData) : null;

  const handleSubmit = async () => {
    if (!amount || !pool || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);

    try {
      // SRWA Token: Create purchase request
      if (isSRWAToken && srwaPool && mode === 'supply') {
        // For SRWA tokens, "supply" means "buy"
        // Calculate mock price (1 SOL = 100 tokens for now)
        const tokenAmount = parseFloat(amount);
        const solAmount = tokenAmount / 100; // Mock price

        // Get admin wallet from SRWA pool data
        // For now, use a hardcoded devnet admin wallet
        // TODO: Get this from on-chain SRWA program data
        const adminWallet = srwaPool.isUserAdmin
          ? wallet.publicKey.toBase58()
          : '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'; // Default devnet admin

        const result = await createPurchaseRequest(
          srwaPool.tokenContract,
          srwaPool.name,
          'SRWA', // TODO: Get from token metadata
          solAmount,
          tokenAmount,
          adminWallet
        );

        if (result.success) {
          toast.success('✅ Purchase successful!', {
            description: `You sent ${solAmount.toFixed(4)} SOL. You will receive ${tokenAmount} tokens shortly.`,
            duration: 8000,
          });

          onTransactionComplete?.(pool.address, parseFloat(amount), mode);
          setAmount('');
          onClose();
        } else {
          throw new Error(result.error || 'Purchase failed');
        }
      } else {
        // Regular Blend pool: simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const actionText = mode === 'supply' ? 'Supply' : 'Borrow';
        toast.success(`${actionText} successful! ${amount} tokens processed for ${pool.name}`);

        onTransactionComplete?.(pool.address, parseFloat(amount), mode);
        setAmount('');
        onClose();
      }
    } catch (error: any) {
      const actionText = isSRWAToken && mode === 'supply' ? 'Purchase' : (mode === 'supply' ? 'Supply' : 'Borrow');
      toast.error(`${actionText} failed: ${error.message}`);
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

  // Customize for SRWA tokens
  const icon = isSRWAToken && isSupply ? ShoppingCart : (isSupply ? ArrowUpRight : TrendingDown);
  const title = isSRWAToken && isSupply ? 'Buy' : (isSupply ? 'Supply' : 'Borrow');
  const description = isSRWAToken && isSupply
    ? 'Purchase SRWA tokens with SOL. Your purchase will be reviewed by the admin.'
    : (isSupply
      ? 'Deposit tokens to earn yield'
      : 'Borrow tokens against your collateral');
  const apy = isSupply ? pool.supplyAPY : pool.borrowAPY;
  const buttonClass = isSRWAToken && isSupply
    ? 'bg-green-500 hover:bg-green-600 text-white'
    : (isSupply
      ? 'bg-brand-400 hover:bg-brand-500 text-white'
      : 'bg-orange-500 hover:bg-orange-600 text-white');

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
          {/* KYC Status Alert - Only for SRWA tokens */}
          {isSRWAToken && isSupply && (
            <>
              {kycStatus.loading ? (
                <Alert className="border-gray-500/30 bg-gray-500/10">
                  <Info className="h-4 w-4 text-gray-400 animate-pulse" />
                  <AlertDescription className="text-sm text-fg-secondary">
                    Verificando seu status de KYC...
                  </AlertDescription>
                </Alert>
              ) : kycStatus.hasKYC ? (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-sm text-green-100">
                    <strong>✅ KYC Verificado</strong> - Você está autorizado a receber SRWA tokens.
                    {kycStatus.topics.accredited && (
                      <div className="mt-1 text-xs">
                        <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10 mr-1">
                          Accredited Investor
                        </Badge>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-sm text-red-100">
                    <strong>⚠️ KYC Necessário</strong> - Você precisa completar o KYC antes de comprar SRWA tokens.
                    <div className="mt-2 text-xs">
                      <strong>Requisitos:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>User Registry ativo</li>
                        <li>Verificação KYC aprovada</li>
                        <li>Compliance validada on-chain</li>
                      </ul>
                      <div className="mt-2">
                        <strong>Entre em contato com o admin para completar o KYC.</strong>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* SRWA Purchase Info */}
          {isSRWAToken && isSupply && kycStatus.hasKYC && (
            <Alert className="border-cyan-500/30 bg-cyan-500/10">
              <Info className="h-4 w-4 text-cyan-400" />
              <AlertDescription className="text-sm text-brand-100">
                <strong>How it works:</strong> You send SOL to purchase tokens. The tokens will be transferred to your wallet after admin approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Pool Info */}
          <div className="p-4 bg-bg-elev-1 rounded-lg border border-stroke-line">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">Pool</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg-primary">{pool.name}</span>
                  {'marketType' in pool && pool.marketType === 'SRWA' && (
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
              disabled={
                isProcessing ||
                !amount ||
                parseFloat(amount) <= 0 ||
                (isSRWAToken && isSupply && !kycStatus.hasKYC)
              }
              className={`flex-1 ${buttonClass}`}
            >
              {isProcessing ? (
                `Processing ${title}...`
              ) : (isSRWAToken && isSupply && !kycStatus.hasKYC) ? (
                '⚠️ KYC Required'
              ) : (
                `Confirm ${title}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};