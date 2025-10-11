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
import { 
  TrendingUp, 
  Wallet,
  AlertTriangle,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { BlendPool, TransactionPreview } from '@/types/lending';
import { useLendingOperations } from '@/hooks/markets/useLendingOperations';
import { useWallet } from '@/components/wallet/WalletProvider';
import { TransactionPreview as TransactionPreviewComponent } from './TransactionPreview';
import { cn } from '@/lib/utils';

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: BlendPool;
}

export const SupplyModal: React.FC<SupplyModalProps> = ({ 
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

  // Available assets in the pool
  const availableAssets = useMemo(() => {
    return pool.reserves.filter(reserve => reserve.enabled).map(reserve => ({
      code: reserve.asset.code,
      symbol: reserve.asset.symbol,
      name: reserve.asset.name,
      supplyAPY: reserve.supplyAPY,
      decimals: reserve.asset.decimals
    }));
  }, [pool.reserves]);

  // Set default asset when modal opens
  useEffect(() => {
    if (isOpen && availableAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(availableAssets[0].code);
    }
  }, [isOpen, availableAssets, selectedAsset]);

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
        const transactionPreview = await lendingOps.previewTransaction('supply', selectedAsset, amountBigInt);
        setPreview(transactionPreview);
      } catch (error) {
        setPreviewError(error.message || 'Failed to generate preview');
        setPreview(null);
      }
    };

    const debounceTimer = setTimeout(generatePreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedAsset, amount, pool.reserves, lendingOps]);

  const handleMaxClick = () => {
    // Mock user balance - in real implementation, would fetch from wallet
    const mockBalance = selectedAsset === 'USDC' ? '1000' : selectedAsset === 'XLM' ? '5000' : '500';
    setAmount(mockBalance);
  };

  const handleSupply = async () => {
    if (!preview || !preview.canProceed) return;

    setIsLoading(true);
    try {
      const selectedReserve = pool.reserves.find(r => r.asset.code === selectedAsset);
      if (!selectedReserve) throw new Error('Asset not found');

      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedReserve.asset.decimals)));
      const hash = await lendingOps.supply(selectedAsset, amountBigInt);
      setTxHash(hash);
    } catch (error) {
      console.error('Supply failed:', error);
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

  const selectedAssetData = availableAssets.find(asset => asset.code === selectedAsset);

  // Success state
  if (txHash) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Supply Successful
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <div className="text-body-1 text-fg-secondary">
                Successfully supplied{' '}
                <span className="font-semibold text-fg-primary">
                  {amount} {selectedAsset}
                </span>
              </div>
              <div className="text-micro text-fg-muted">
                Transaction Hash: {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </div>
            </div>
            
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <div className="text-body-2 text-green-400 font-medium">
                    You are now earning {selectedAssetData ? formatAPY(selectedAssetData.supplyAPY) : '0%'} APY
                  </div>
                  <div className="text-micro text-fg-muted">
                    Interest compounds automatically
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
            <TrendingUp className="h-5 w-5 text-green-400" />
            Supply to {pool.name}
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
                    Connect your wallet to supply assets
                  </span>
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
                  <div className="text-micro text-fg-muted">Pool TVL</div>
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
              <Label>Select Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={!isConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose asset to supply" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map((asset) => (
                    <SelectItem key={asset.code} value={asset.code}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="text-fg-muted">{asset.name}</span>
                        </div>
                        <div className="text-green-400 text-sm font-medium">
                          {formatAPY(asset.supplyAPY)} APY
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
                <Label>Amount</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMaxClick}
                  disabled={!selectedAsset || !isConnected}
                  className="text-brand-400 hover:text-brand-300 p-1 h-auto"
                >
                  MAX
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
                  Balance: {selectedAsset === 'USDC' ? '1,000' : selectedAsset === 'XLM' ? '5,000' : '500'} {selectedAssetData?.symbol}
                </div>
              )}
            </div>
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
            onClick={handleSupply}
            disabled={!preview || !preview.canProceed || isLoading || !isConnected}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Supplying...
              </>
            ) : (
              'Supply Assets'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};