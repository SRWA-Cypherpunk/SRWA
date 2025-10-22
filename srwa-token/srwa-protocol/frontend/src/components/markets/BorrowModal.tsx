import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  Wallet,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Shield,
  Activity
} from 'lucide-react';
import { BlendPool, TransactionPreview } from '@/types/lending';
import { useLendingOperations } from '@/hooks/markets/useLendingOperations';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { TransactionPreview as TransactionPreviewComponent } from './TransactionPreview';
import { cn } from '@/lib/utils';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: BlendPool;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({ 
  isOpen, 
  onClose, 
  pool 
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<TransactionPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { isConnected, address } = useWallet();
  const lendingOps = useLendingOperations(pool.address);

  // Mock user portfolio data (in real implementation, would fetch from API)
  const mockCollateral = {
    totalValueUSD: 2500,
    healthFactor: 2.1,
    borrowCapacityUSD: 1250,
    assets: [
      { symbol: 'USDC', amount: 1000, valueUSD: 1000 },
      { symbol: 'XLM', amount: 12500, valueUSD: 1500 }
    ]
  };

  // Available assets for borrowing
  const borrowableAssets = useMemo(() => {
    return pool.reserves.filter(reserve => reserve.borrowable && reserve.enabled).map(reserve => ({
      code: reserve.asset.code,
      symbol: reserve.asset.symbol,
      name: reserve.asset.name,
      borrowAPY: reserve.borrowAPY,
      availableLiquidity: reserve.availableLiquidity,
      decimals: reserve.asset.decimals
    }));
  }, [pool.reserves]);

  // Set default asset when modal opens
  useEffect(() => {
    if (isOpen && borrowableAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(borrowableAssets[0].code);
    }
  }, [isOpen, borrowableAssets, selectedAsset]);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setSelectedAsset('');
      setPreview(null);
      setPreviewError(null);
      setTxHash(null);
    }
  }, [isOpen]);

  // Generate preview when amount or asset changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!selectedAsset || !amount || parseFloat(amount) <= 0) {
        setPreview(null);
        setPreviewError(null);
        return;
      }

      try {
        setPreviewError(null);
        const selectedReserve = pool.reserves.find(r => r.asset.code === selectedAsset);
        if (!selectedReserve) return;

        const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedReserve.asset.decimals)));
        const transactionPreview = await lendingOps.previewTransaction('borrow', selectedAsset, amountBigInt);
        setPreview(transactionPreview);
      } catch (error) {
        setPreviewError(error.message || 'Failed to generate preview');
        setPreview(null);
      }
    };

    const debounceTimer = setTimeout(generatePreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedAsset, amount, pool.reserves, lendingOps]);

  const calculateMaxBorrow = () => {
    if (!selectedAsset) return '0';
    
    // Mock calculation - in real implementation would use actual prices and LTV ratios
    const assetPrice = selectedAsset === 'USDC' ? 1 : 0.12; // Mock prices
    const maxBorrowUSD = mockCollateral.borrowCapacityUSD * 0.8; // 80% of capacity for safety
    const maxBorrowAmount = maxBorrowUSD / assetPrice;
    
    return maxBorrowAmount.toFixed(2);
  };

  const handleMaxClick = () => {
    setAmount(calculateMaxBorrow());
  };

  const handleBorrow = async () => {
    if (!preview || !preview.canProceed) return;

    setIsLoading(true);
    try {
      const selectedReserve = pool.reserves.find(r => r.asset.code === selectedAsset);
      if (!selectedReserve) throw new Error('Asset not found');

      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedReserve.asset.decimals)));
      const hash = await lendingOps.borrow(selectedAsset, amountBigInt);
      setTxHash(hash);
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formatAPY = (apy: number): string => {
    return `${(apy * 100).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const getHealthFactorColor = (factor: number) => {
    if (factor >= 2) return 'text-green-400';
    if (factor >= 1.5) return 'text-yellow-400';
    if (factor >= 1.2) return 'text-orange-400';
    return 'text-red-400';
  };

  const selectedAssetData = borrowableAssets.find(asset => asset.code === selectedAsset);

  // Success state
  if (txHash) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <CheckCircle className="h-5 w-5" />
              Borrow Successful
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <div className="text-body-1 text-fg-secondary">
                Successfully borrowed{' '}
                <span className="font-semibold text-fg-primary">
                  {amount} {selectedAsset}
                </span>
              </div>
              <div className="text-micro text-fg-muted">
                Transaction Hash: {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </div>
            </div>
            
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <div className="text-body-2 text-orange-400 font-medium">
                    Interest rate: {selectedAssetData ? formatAPY(selectedAssetData.borrowAPY) : '0%'} APY
                  </div>
                  <div className="text-micro text-fg-muted">
                    Interest accrues continuously
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-400" />
            Borrow from {pool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Connection Check */}
          {!isConnected && (
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Wallet className="h-4 w-4" />
                  <span className="text-body-2 font-medium">
                    Connect your wallet to borrow assets
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collateral Overview */}
          {isConnected && (
            <Card className="bg-bg-elev-1">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-fg-primary flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Your Collateral
                    </h3>
                    <div className="text-right">
                      <div className="text-body-1 font-semibold text-fg-primary">
                        {formatCurrency(mockCollateral.totalValueUSD)}
                      </div>
                      <div className="text-micro text-fg-muted">Total Value</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-micro text-fg-muted">Health Factor</div>
                      <div className={cn("text-body-1 font-semibold", getHealthFactorColor(mockCollateral.healthFactor))}>
                        {mockCollateral.healthFactor.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-micro text-fg-muted">Borrow Capacity</div>
                      <div className="text-body-1 font-semibold text-fg-primary">
                        {formatCurrency(mockCollateral.borrowCapacityUSD)}
                      </div>
                    </div>
                  </div>

                  {/* Collateral Assets */}
                  <div className="space-y-2">
                    {mockCollateral.assets.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between text-body-2">
                        <span className="text-fg-secondary">
                          {asset.amount.toLocaleString()} {asset.symbol}
                        </span>
                        <span className="text-fg-primary font-medium">
                          {formatCurrency(asset.valueUSD)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pool Info */}
          <Card className="bg-bg-elev-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-fg-primary">{pool.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-micro">
                      {pool.class}
                    </Badge>
                    {pool.poolType === 'community' && (
                      <Badge variant="outline" className="text-micro bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Community
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-micro text-fg-muted">Available Liquidity</div>
                  <div className="text-body-1 font-semibold text-fg-primary">
                    ${(Number(pool.totalLiquidity) / 1e12).toFixed(1)}M
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Asset to Borrow</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={!isConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose asset to borrow" />
                </SelectTrigger>
                <SelectContent>
                  {borrowableAssets.map((asset) => (
                    <SelectItem key={asset.code} value={asset.code}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="text-fg-muted">{asset.name}</span>
                        </div>
                        <div className="text-orange-400 text-sm font-medium">
                          {formatAPY(asset.borrowAPY)} APY
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Amount to Borrow</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMaxClick}
                  disabled={!selectedAsset || !isConnected}
                  className="text-brand-400 hover:text-brand-300 p-1 h-auto"
                >
                  SAFE MAX
                </Button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!selectedAsset || !isConnected}
                  className="pr-16"
                />
                {selectedAsset && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-body-2 text-fg-muted">
                    {selectedAssetData?.symbol}
                  </div>
                )}
              </div>
              {selectedAsset && (
                <div className="text-micro text-fg-muted">
                  Max safe borrow: {calculateMaxBorrow()} {selectedAssetData?.symbol}
                </div>
              )}
            </div>

            {/* Borrow Capacity Indicator */}
            {selectedAsset && amount && parseFloat(amount) > 0 && (
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-2 text-fg-muted">Borrow Capacity Used</span>
                      <span className="text-body-2 font-medium text-fg-primary">
                        {((parseFloat(amount) * (selectedAsset === 'USDC' ? 1 : 0.12) / mockCollateral.borrowCapacityUSD) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(parseFloat(amount) * (selectedAsset === 'USDC' ? 1 : 0.12) / mockCollateral.borrowCapacityUSD) * 100}
                      className="h-2"
                    />
                    <div className="text-micro text-orange-400">
                      Keep capacity below 80% to maintain healthy collateral ratio
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Error */}
          {previewError && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-body-2">{previewError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Preview */}
          {preview && (
            <TransactionPreviewComponent 
              preview={preview}
              className="border-stroke-line"
            />
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBorrow}
            disabled={!preview || !preview.canProceed || isLoading || !isConnected}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Borrowing...
              </>
            ) : (
              'Borrow Assets'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};