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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Shield,
  Activity,
  Coins,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Info
} from 'lucide-react';
import { RWAToken } from '@/hooks/useUserRWATokens';
import { useRWALending, RWALendingPreview } from '@/hooks/useRWALending';
import { useWallet } from '@/components/wallet/WalletProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RWALendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: RWAToken;
  defaultTab?: 'supply' | 'borrow';
}

type OperationType = 'supply' | 'withdraw' | 'borrow' | 'repay';

const MOCK_POOLS = [
  {
    address: "CBLENDPOOLXLMXRP1234567890ABCDEF1234567890ABCDEF123456",
    name: "XLM-XRP Pool",
    tvl: "$2.4M",
    apy: 6.8
  },
  {
    address: "CBLENDPOOLUSDC1234567890ABCDEF1234567890ABCDEF123456",
    name: "USDC Pool", 
    tvl: "$8.9M",
    apy: 4.5
  },
  {
    address: "CBLENDPOOLBTC1234567890ABCDEF1234567890ABCDEF123456",
    name: "BTC Pool",
    tvl: "$15.2M",
    apy: 3.2
  }
];

const BORROW_ASSETS = [
  { code: "XLM", name: "Stellar Lumens", decimals: 7 },
  { code: "USDC", name: "USD Coin", decimals: 6 },
  { code: "BTC", name: "Bitcoin", decimals: 8 }
];

export const RWALendingModal: React.FC<RWALendingModalProps> = ({ 
  isOpen, 
  onClose, 
  token,
  defaultTab = 'supply'
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>(defaultTab);
  const [operationType, setOperationType] = useState<OperationType>('supply');
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [borrowAsset, setBorrowAsset] = useState<string>('');
  const [preview, setPreview] = useState<RWALendingPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Hooks
  const { isConnected, address } = useWallet();
  const {
    supplyRWAToken,
    withdrawRWAToken,
    borrowAgainstRWA,
    repayWithRWA,
    previewOperation,
    approveRWAForLending,
    checkRWAAllowance,
    loading,
    error
  } = useRWALending();

  // Format token balance for display
  const formatBalance = useMemo(() => {
    const balanceNum = parseFloat(token.balance);
    const formatted = (balanceNum / Math.pow(10, token.decimals)).toFixed(2);
    return parseFloat(formatted).toLocaleString();
  }, [token]);

  // Set default pool when modal opens
  useEffect(() => {
    if (isOpen && MOCK_POOLS.length > 0 && !selectedPool) {
      setSelectedPool(MOCK_POOLS[0].address);
    }
  }, [isOpen, selectedPool]);

  // Set default borrow asset
  useEffect(() => {
    if (activeTab === 'borrow' && !borrowAsset) {
      setBorrowAsset(BORROW_ASSETS[0].code);
    }
  }, [activeTab, borrowAsset]);

  // Update operation type when tab changes
  useEffect(() => {
    setOperationType(activeTab === 'supply' ? 'supply' : 'borrow');
  }, [activeTab]);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setSelectedPool('');
      setBorrowAsset('');
      setPreview(null);
      setTxHash(null);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Generate preview when inputs change
  useEffect(() => {
    const generatePreview = async () => {
      if (!amount || !selectedPool || parseFloat(amount) <= 0) {
        setPreview(null);
        return;
      }

      setIsLoadingPreview(true);
      try {
        const operation = {
          tokenAddress: token.contractAddress,
          poolAddress: selectedPool,
          amount,
          type: operationType
        };

        const previewResult = await previewOperation(operation);
        setPreview(previewResult);
      } catch (err) {
        console.error("Preview error:", err);
        setPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const debounceTimer = setTimeout(generatePreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, selectedPool, operationType, token.contractAddress, previewOperation]);

  const handleMaxAmount = () => {
    const maxAmount = (parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(token.decimals);
    setAmount(maxAmount);
  };

  const handleExecute = async () => {
    if (!selectedPool || !amount) return;

    try {
      let txHash: string;

      switch (operationType) {
        case 'supply':
          txHash = await supplyRWAToken(token, selectedPool, amount);
          break;
        case 'withdraw':
          txHash = await withdrawRWAToken(token, selectedPool, amount);
          break;
        case 'borrow':
          if (!borrowAsset) throw new Error("Please select an asset to borrow");
          txHash = await borrowAgainstRWA(token, selectedPool, amount, borrowAsset);
          break;
        case 'repay':
          txHash = await repayWithRWA(token, selectedPool, amount);
          break;
        default:
          throw new Error("Invalid operation type");
      }

      setTxHash(txHash);
      toast.success(`${operationType} operation successful!`);
      
    } catch (err) {
      console.error("Transaction error:", err);
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Success state
  if (txHash) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Transaction Successful
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="space-y-2">
              <p className="text-body-1 text-fg-primary">
                Your {operationType} operation was completed successfully!
              </p>
              <p className="text-body-2 text-fg-muted font-mono">
                {txHash.slice(0, 16)}...{txHash.slice(-16)}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-brand-400" />
            {token.name} Lending Operations
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
                    Connect your wallet to use lending features
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token Info */}
          <Card className="bg-bg-elev-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-brand-400" />
                    <span className="font-medium">{token.symbol}</span>
                    <Badge variant="outline" className="text-xs">RWA Token</Badge>
                  </div>
                  <p className="text-body-2 text-fg-muted">{token.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-body-2 text-fg-muted">Your Balance</p>
                  <p className="font-semibold">{formatBalance} {token.symbol}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operation Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'supply' | 'borrow')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supply" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Supply & Earn
              </TabsTrigger>
              <TabsTrigger value="borrow" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Use as Collateral
              </TabsTrigger>
            </TabsList>

            {/* Supply Tab */}
            <TabsContent value="supply" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant={operationType === 'supply' ? 'default' : 'outline'}
                  onClick={() => setOperationType('supply')}
                  className="flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Supply to Pool
                </Button>
                <Button 
                  variant={operationType === 'withdraw' ? 'default' : 'outline'}
                  onClick={() => setOperationType('withdraw')}
                  className="flex items-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Withdraw from Pool
                </Button>
              </div>
            </TabsContent>

            {/* Borrow Tab */}
            <TabsContent value="borrow" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant={operationType === 'borrow' ? 'default' : 'outline'}
                  onClick={() => setOperationType('borrow')}
                  className="flex items-center gap-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  Borrow Against RWA
                </Button>
                <Button 
                  variant={operationType === 'repay' ? 'default' : 'outline'}
                  onClick={() => setOperationType('repay')}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Repay Loan
                </Button>
              </div>

              {/* Borrow Asset Selection */}
              {operationType === 'borrow' && (
                <div className="space-y-2">
                  <Label htmlFor="borrow-asset">Asset to Borrow</Label>
                  <Select value={borrowAsset} onValueChange={setBorrowAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset to borrow" />
                    </SelectTrigger>
                    <SelectContent>
                      {BORROW_ASSETS.map((asset) => (
                        <SelectItem key={asset.code} value={asset.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{asset.code}</span>
                            <span className="text-fg-muted">- {asset.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pool Selection */}
          <div className="space-y-2">
            <Label htmlFor="pool">Lending Pool</Label>
            <Select value={selectedPool} onValueChange={setSelectedPool}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lending pool" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_POOLS.map((pool) => (
                  <SelectItem key={pool.address} value={pool.address}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{pool.name}</span>
                      <div className="flex items-center gap-2 text-xs text-fg-muted">
                        <span>TVL: {pool.tvl}</span>
                        <span>APY: {pool.apy}%</span>
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
              <Label htmlFor="amount">
                {operationType === 'borrow' ? `${borrowAsset || 'Asset'} Amount` : `${token.symbol} Amount`}
              </Label>
              {(operationType === 'supply' || operationType === 'repay') && (
                <Button variant="ghost" size="sm" onClick={handleMaxAmount}>
                  Max: {formatBalance} {token.symbol}
                </Button>
              )}
            </div>
            <Input
              id="amount"
              type="number"
              placeholder={`Enter ${operationType === 'borrow' ? borrowAsset || 'asset' : token.symbol} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Transaction Preview */}
          {isLoadingPreview && (
            <Card className="bg-bg-elev-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-body-2">Calculating preview...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {preview && !isLoadingPreview && (
            <Card className="bg-bg-elev-1">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-brand-400" />
                  <span className="font-medium">Transaction Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-fg-muted">Estimated APY</p>
                    <p className="font-semibold text-green-400">{preview.estimatedAPY.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-fg-muted">Health Factor</p>
                    <p className={cn("font-semibold", preview.healthFactorAfter >= 2 ? "text-green-400" : "text-amber-400")}>
                      {preview.healthFactorAfter.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-fg-muted">Fees</p>
                    <p className="font-semibold">{preview.fees}</p>
                  </div>
                  {preview.requiredCollateral && (
                    <div>
                      <p className="text-fg-muted">Required Collateral</p>
                      <p className="font-semibold">{preview.requiredCollateral}</p>
                    </div>
                  )}
                </div>
                {preview.warnings.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                      {preview.warnings.map((warning, index) => (
                        <p key={index} className="text-xs text-amber-400">{warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-body-2 font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute} 
            disabled={!isConnected || !selectedPool || !amount || parseFloat(amount) <= 0 || loading}
            className="min-w-32"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {operationType === 'supply' && <ArrowUpRight className="w-4 h-4 mr-2" />}
                {operationType === 'withdraw' && <ArrowDownLeft className="w-4 h-4 mr-2" />}
                {operationType === 'borrow' && <TrendingDown className="w-4 h-4 mr-2" />}
                {operationType === 'repay' && <DollarSign className="w-4 h-4 mr-2" />}
                {operationType.charAt(0).toUpperCase() + operationType.slice(1)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
