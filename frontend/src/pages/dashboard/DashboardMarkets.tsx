import { useState } from 'react';
import '@/styles/features/dashboard.css';
import { DashboardLayout, DashboardSection } from "@/components/layout";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IssuerWizard } from "@/components/srwa/IssuerWizard";

// Hooks
import { useRaydiumPools, useUserRegistry } from '@/hooks/solana';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { RaydiumPoolOperations } from '@/components/raydium/RaydiumPoolOperations';
import { UserRole } from '@/types/srwa-contracts';

// Icons
import { Plus, Zap, Loader2, RefreshCw, TrendingUp, DollarSign, Activity, ExternalLink, Shield } from "lucide-react";
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

// Mock pool data helper (until real data is available)
const getMockPoolMetrics = (poolId: string) => {
  const seed = poolId.charCodeAt(0) + poolId.charCodeAt(poolId.length - 1);
  return {
    apy: 12.5 + (seed % 20), // 12.5-32.5%
    tvl: 50000 + (seed % 50) * 1000, // $50K-100K
    minInvestment: 0.1,
    riskLevel: seed % 3 === 0 ? 'Low' : seed % 3 === 1 ? 'Medium' : 'High' as 'Low' | 'Medium' | 'High',
    availableSOL: (seed % 100) + 10, // 10-110 SOL
    availableToken: (seed % 1000) + 100, // 100-1100 tokens
    price: 0.01 + (seed % 10) / 100, // 0.01-0.11 SOL per token
  };
};

const getRiskBadgeColor = (risk: 'Low' | 'Medium' | 'High') => {
  switch (risk) {
    case 'Low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'High':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
  }
};

export default function DashboardMarkets() {
  // Fetch deployed tokens (for token info display in cards)
  const { tokens: deployedTokens } = useDeployedTokens();

  // Fetch Raydium pools registered on-chain
  const {
    pools: raydiumPools,
    loading: raydiumPoolsLoading,
    error: raydiumPoolsError,
    refresh: refreshRaydiumPools
  } = useRaydiumPools();

  // Check user role
  const { userRegistry } = useUserRegistry();
  const isIssuer = (userRegistry?.role === UserRole.Issuer || userRegistry?.role === UserRole.Admin) && userRegistry?.role !== UserRole.Investor;

  // State for pool operations dialog
  const [selectedRaydiumPoolId, setSelectedRaydiumPoolId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Navigation handler
  const handleViewPoolDetails = (poolAddress: string) => {
    setSelectedRaydiumPoolId(poolAddress);
  };

  return (
    <DashboardLayout>
      {/* Header with Create SRWA Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
            Available Investments
          </h1>
          <p className="text-base sm:text-lg text-fg-secondary mt-2">
            Discover high-yield investment opportunities on Solana
          </p>
        </div>

        {isIssuer && (
          <div className="w-full sm:w-auto">
            <HeroButton
              onClick={() => setIsCreateModalOpen(true)}
              variant="brand"
              className="w-full sm:w-auto"
              icon={<Plus className="h-4 w-4" />}
            >
              Create SRWA
            </HeroButton>
          </div>
        )}
      </div>

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Available Investments Section */}
      <DashboardSection decorativeColor="purple">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {raydiumPools.length} registered pools
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshRaydiumPools}
              disabled={raydiumPoolsLoading}
            >
              <RefreshCw className={`h-5 w-5 ${raydiumPoolsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {raydiumPoolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : raydiumPoolsError ? (
            <Card className="border-red-500/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-red-400">{raydiumPoolsError}</p>
              </CardContent>
            </Card>
          ) : raydiumPools.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-base font-medium text-muted-foreground">
                  No Raydium pools registered yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a pool in the admin panel to see it here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {raydiumPools.map((pool, index) => {
                const tokenInfo = deployedTokens.find(t => t.mint.toBase58() === pool.tokenMint.toBase58());
                const metrics = getMockPoolMetrics(pool.poolId.toBase58());

                return (
                  <motion.div
                    key={pool.publicKey.toBase58()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="border-purple-500/30 bg-background hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                      <CardContent className="p-6">
                        <div className="space-y-5">
                          {/* Header with Token Pair and TVL */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2">
                                {tokenInfo?.symbol || 'SRWA'} / SOL
                              </h3>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                  CPMM
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getRiskBadgeColor(metrics.riskLevel)}`}>
                                  {metrics.riskLevel} Risk
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">TVL</p>
                              <p className="text-2xl font-bold text-purple-400">{formatCurrency(metrics.tvl)}</p>
                            </div>
                          </div>

                          {/* APY Section */}
                          <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-400" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">APY</span>
                              </div>
                              <p className="text-3xl font-bold text-purple-400">{metrics.apy.toFixed(2)}%</p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="flex items-center text-[11px] text-muted-foreground mb-1">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span>Available (SOL)</span>
                              </p>
                              <p className="text-base font-semibold">{metrics.availableSOL.toFixed(2)} SOL</p>
                            </div>
                            <div>
                              <p className="flex items-center text-[11px] text-muted-foreground mb-1">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span>Available (Token)</span>
                              </p>
                              <p className="text-base font-semibold">{metrics.availableToken.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="flex items-center text-[11px] text-muted-foreground mb-1">
                                <Shield className="h-3 w-3 mr-1" />
                                <span>Min. Investment</span>
                              </p>
                              <p className="text-base font-semibold">{metrics.minInvestment} SOL</p>
                            </div>
                            <div>
                              <p className="flex items-center text-[11px] text-muted-foreground mb-1">
                                <Activity className="h-3 w-3 mr-1" />
                                <span>Price</span>
                              </p>
                              <p className="text-base font-semibold">{metrics.price.toFixed(4)}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                            <HeroButton
                              variant="brand"
                              className="flex-1 h-11 !text-sm !px-4 !py-2.5"
                              icon={<Zap className="h-4 w-4" />}
                              onClick={() => handleViewPoolDetails(pool.poolId.toBase58())}
                            >
                              Earn
                            </HeroButton>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11"
                              onClick={() => {
                                window.open(`https://solscan.io/account/${pool.poolId.toBase58()}?cluster=devnet`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardSection>

      {/* SRWA Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create SRWA Token</DialogTitle>
          </DialogHeader>
          <IssuerWizard />
        </DialogContent>
      </Dialog>

      {/* Raydium Pool Dialog */}
      <Dialog
        open={!!selectedRaydiumPoolId}
        onOpenChange={(open) => !open && setSelectedRaydiumPoolId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Investment Management</DialogTitle>
            <DialogDescription>
              Invest or withdraw funds from this liquidity pool
            </DialogDescription>
          </DialogHeader>
          {selectedRaydiumPoolId && (
            <RaydiumPoolOperations poolId={selectedRaydiumPoolId} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
