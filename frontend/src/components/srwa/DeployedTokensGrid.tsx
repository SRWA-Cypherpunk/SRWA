import { useState } from 'react';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { useUserRegistry } from '@/hooks/solana';
import { UserRole } from '@/types/srwa-contracts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IssuerWizard } from '@/components/srwa/IssuerWizard';
import { toast } from 'sonner';
import { Coins, TrendingUp, DollarSign, RefreshCw, Copy, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const truncateAddress = (address: string, start = 8, end = 6) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export function DeployedTokensGrid() {
  const { tokens, loading, error, refresh } = useDeployedTokens();
  const { isIssuer, isInvestor, isAdmin } = useUserRegistry();
  const canCreateSRWA = (isIssuer || isAdmin) && !isInvestor;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline" className="border-red-500/30">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Coins className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-semibold mb-2">No tokens deployed yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {canCreateSRWA
              ? "Get started by creating your first SRWA token using the Token Wizard"
              : "No SRWA tokens have been deployed yet. Check back soon for available tokens."}
          </p>
          {canCreateSRWA && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              <Coins className="h-4 w-4 mr-2" />
              Create Your First Token
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="rounded-xl bg-brand-400/10 p-2">
              <Coins className="h-6 w-6 text-brand-400" />
            </div>
            SRWA Tokens
            <Badge variant="secondary" className="text-sm">
              {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'}
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your deployed tokenized assets
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tokens Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token, index) => (
          <motion.div
            key={token.mint.toBase58()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-400/10">
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-tight mb-1">
                        {token.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {token.symbol}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 bg-green-500/10">
                          Live
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-lg bg-brand-400/10 p-2">
                      <Coins className="h-5 w-5 text-brand-400" />
                    </div>
                  </div>
                </div>

                {/* Mint Address */}
                <div className="mb-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Mint Address
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-foreground">
                      {truncateAddress(token.mint.toBase58())}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:bg-brand-400/20"
                      onClick={() => {
                        navigator.clipboard.writeText(token.mint.toBase58());
                        toast.success('Address copied!');
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* TVL & APY */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium uppercase">Target TVL</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(token.tvl)}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium uppercase">Target APY</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-400">
                      {token.supplyAPY.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Yield Strategy */}
                <div className="mb-4 rounded-lg border border-border/30 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                        Yield Strategy
                      </p>
                      <p className="text-sm font-semibold capitalize text-foreground">
                        {token.yieldConfig.protocol}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {token.yieldConfig.protocol === 'none' ? 'No Strategy' : 'Active'}
                    </Badge>
                  </div>
                </div>

                {/* Issuer */}
                <div className="mb-4 rounded-lg bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Issuer
                  </p>
                  <p className="font-mono text-xs text-foreground">
                    {truncateAddress(token.issuer.toBase58())}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-brand-400/10 hover:border-brand-400/50 hover:text-brand-400"
                    onClick={() => {
                      // Navigate to token details
                      window.location.href = `/token/${token.mint.toBase58()}`;
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-brand-400/10 hover:border-brand-400/50 hover:text-brand-400"
                    onClick={() => {
                      window.open(`https://solscan.io/token/${token.mint.toBase58()}?cluster=devnet`, '_blank');
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* SRWA Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create SRWA Token</DialogTitle>
          </DialogHeader>
          <IssuerWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
