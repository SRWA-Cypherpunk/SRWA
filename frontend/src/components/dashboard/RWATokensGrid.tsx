import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, 
  Crown, 
  ExternalLink, 
  RefreshCw,
  Copy,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import { useUserRWATokens, type RWAToken } from "@/hooks/useUserRWATokens";
import { RWALendingModal } from "@/components/rwa/RWALendingModal";

const RWATokenCard = ({ token, index }: { token: RWAToken; index: number }) => {
  const [copied, setCopied] = useState(false);
  const [lendingModal, setLendingModal] = useState<{ isOpen: boolean; defaultTab: 'supply' | 'borrow' }>({
    isOpen: false,
    defaultTab: 'supply'
  });

  const formatBalance = (balance: string, decimals: number) => {
    const balanceNum = parseFloat(balance);
    if (balanceNum === 0) return "0";
    
    const formatted = (balanceNum / Math.pow(10, decimals)).toFixed(decimals > 2 ? 2 : decimals);
    return parseFloat(formatted).toLocaleString();
  };

  const formatTotalSupply = (supply: string, decimals: number) => {
    const supplyNum = parseFloat(supply);
    if (supplyNum === 0) return "0";
    
    const formatted = (supplyNum / Math.pow(10, decimals));
    if (formatted >= 1e9) return `${(formatted / 1e9).toFixed(2)}B`;
    if (formatted >= 1e6) return `${(formatted / 1e6).toFixed(2)}M`;
    if (formatted >= 1e3) return `${(formatted / 1e3).toFixed(2)}K`;
    return formatted.toFixed(2);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      toast.success("Contract address copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleViewOnExplorer = () => {
    window.open(`https://stellar.expert/explorer/testnet/contract/${token.contractAddress}`, '_blank');
  };

  const handleSupply = () => {
    setLendingModal({ isOpen: true, defaultTab: 'supply' });
  };

  const handleBorrow = () => {
    setLendingModal({ isOpen: true, defaultTab: 'borrow' });
  };

  const closeLendingModal = () => {
    setLendingModal({ isOpen: false, defaultTab: 'supply' });
  };

  const hasBalance = parseFloat(token.balance) > 0;

  return (
    <div>
      <Card className="card-institutional relative overflow-hidden pointer-events-auto">
        {/* Admin Badge */}
        {token.isUserAdmin && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
        )}

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-h3 font-semibold text-fg-primary flex items-center gap-2">
                  <Coins className="w-5 h-5 text-brand-400" />
                  {token.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {token.symbol}
                  </Badge>
                  <span className="text-micro text-fg-muted">
                    {token.decimals} decimals
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contract Address */}
            <div className="space-y-2">
              <p className="text-micro text-fg-muted uppercase tracking-wider">Contract Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-fg-secondary bg-bg-elev-1 px-2 py-1 rounded border">
                  {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewOnExplorer}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase tracking-wider">Your Balance</p>
              <p className="text-h4 font-semibold text-fg-primary">
                {formatBalance(token.balance, token.decimals)}
              </p>
              {!hasBalance && !token.isUserAdmin && (
                <p className="text-xs text-fg-muted">No tokens held</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase tracking-wider">Total Supply</p>
              <p className="text-h4 font-semibold text-fg-primary">
                {formatTotalSupply(token.totalSupply, token.decimals)}
              </p>
            </div>
          </div>

          {/* Lending Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-bg-elev-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSupply}
              className="flex items-center gap-2 pointer-events-auto"
            >
              <ArrowUpRight className="w-3 h-3" />
              Supply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBorrow}
              className="flex items-center gap-2 pointer-events-auto"
            >
              <TrendingDown className="w-3 h-3" />
              Borrow
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-brand-400" />
                <span className="text-xs text-fg-muted">SRWA Token</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-fg-muted" />
                <span className="text-xs text-fg-muted">Compliant</span>
              </div>
            </div>
            <div className="text-xs text-fg-muted">
              Updated {token.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* RWA Lending Modal */}
        <RWALendingModal
          isOpen={lendingModal.isOpen}
          onClose={closeLendingModal}
          token={token}
          defaultTab={lendingModal.defaultTab}
        />
      </Card>
    </div>
  );
};

const RWATokensGrid = () => {
  const { tokens, loading, error, refetch } = useUserRWATokens();

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: "Refreshing RWA tokens...",
      success: "RWA tokens updated!",
      error: "Failed to refresh tokens"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-semibold text-fg-primary">Your RWA Tokens</h2>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-semibold text-fg-primary">Your RWA Tokens</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <div className="text-red-400 text-h4">Failed to load RWA tokens</div>
            <p className="text-fg-muted">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-h2 font-semibold text-fg-primary">Your RWA Tokens</h2>
          <p className="text-body-2 text-fg-muted">
            {tokens.length === 0 
              ? "No RWA tokens found in your wallet" 
              : `${tokens.length} token${tokens.length === 1 ? '' : 's'} found`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.location.href = '/srwa-issuance'}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Create New Token
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tokens Grid */}
      {tokens.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-bg-elev-2 rounded-full flex items-center justify-center">
              <Coins className="w-8 h-8 text-fg-muted" />
            </div>
            <div className="space-y-2">
              <h3 className="text-h3 font-medium text-fg-primary">No RWA Tokens Yet</h3>
              <p className="text-body-2 text-fg-muted max-w-md mx-auto">
                Create your first SRWA token using the Token Wizard or import existing tokens.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = '/srwa-issuance'}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Create Your First Token
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tokens.map((token, index) => (
            <RWATokenCard key={token.contractAddress} token={token} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RWATokensGrid;
