import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWalletTokenBalances } from "@/hooks/solana/useWalletTokenBalances";
import { useDeployedTokens } from "@/hooks/solana/useDeployedTokens";
import type { DeployedToken } from "@/hooks/solana/useDeployedTokens";
import {
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface TokenPosition {
  token: DeployedToken;
  balance: number;
  balanceString: string;
  value: number;
}

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const getProtocolBadgeColor = (protocol: string) => {
  switch (protocol.toLowerCase()) {
    case 'marginfi':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'solend':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'raydium':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

export default function Portfolio() {
  // Fetch wallet token balances
  const {
    tokens: walletTokens,
    loading: walletLoading,
    error: walletError,
    refresh: refreshWallet
  } = useWalletTokenBalances();

  // Fetch deployed SRWA tokens
  const {
    tokens: deployedTokens,
    loading: deployedLoading,
    error: deployedError,
    refresh: refreshDeployed
  } = useDeployedTokens();

  // Match wallet tokens with deployed SRWA tokens
  const positions = useMemo<TokenPosition[]>(() => {
    if (!walletTokens.length || !deployedTokens.length) {
      return [];
    }

    const tokenPositions: TokenPosition[] = [];

    walletTokens.forEach((walletToken) => {
      // Find matching deployed token
      const deployedToken = deployedTokens.find(
        (dt) => dt.mint.toBase58() === walletToken.mint
      );

      if (deployedToken) {
        // Calculate value (assuming 0.01 SOL per token for POC)
        const value = walletToken.uiAmount * 0.01;

        tokenPositions.push({
          token: deployedToken,
          balance: walletToken.uiAmount,
          balanceString: walletToken.uiAmountString,
          value: value
        });
      }
    });

    return tokenPositions;
  }, [walletTokens, deployedTokens]);

  // Calculate portfolio totals
  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const totalTokens = positions.reduce((sum, pos) => sum + pos.balance, 0);
  const avgSupplyAPY = positions.length > 0
    ? positions.reduce((sum, pos) => sum + pos.token.supplyAPY, 0) / positions.length
    : 0;
  const estimatedYearlyReturn = totalValue * (avgSupplyAPY / 100);

  const loading = walletLoading || deployedLoading;
  const error = walletError || deployedError;

  const handleRefresh = () => {
    refreshWallet();
    refreshDeployed();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-start justify-between animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-h1 font-semibold text-fg-primary">My Portfolio</h1>
            <p className="text-body-1 text-fg-secondary">
              SRWA tokens you own in your wallet
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <KPICard
            title="Total Value"
            value={formatCurrency(totalValue)}
            icon={DollarSign}
            subtitle={`${totalTokens.toFixed(2)} tokens`}
          />
          <KPICard
            title="Total Tokens"
            value={positions.length.toString()}
            icon={Wallet}
            subtitle="Different types"
          />
          <KPICard
            title="Average APY"
            value={`${avgSupplyAPY.toFixed(2)}%`}
            icon={TrendingUp}
            trend="up"
            trendValue="Supply APY"
          />
          <KPICard
            title="Estimated Annual Return"
            value={formatCurrency(estimatedYearlyReturn)}
            icon={BarChart3}
            subtitle="Based on APY"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="positions">My Tokens</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : error ? (
              <Card className="card-institutional">
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-h3 text-fg-primary mb-2">Error loading portfolio</h3>
                  <p className="text-body-2 text-fg-muted mb-6">{error}</p>
                  <Button variant="outline" onClick={handleRefresh}>
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : positions.length === 0 ? (
              <Card className="card-institutional">
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                  <h3 className="text-h3 text-fg-primary mb-2">No Tokens Found</h3>
                  <p className="text-body-2 text-fg-muted mb-6">
                    You don't have any SRWA tokens in your wallet yet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard/markets'}
                  >
                    Explore Markets
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {positions.map((position, index) => (
                  <Card
                    key={position.token.mint.toBase58()}
                    className="card-institutional hover-lift animate-fade-in border-purple-500/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-h3 font-semibold text-fg-primary">
                            {position.token.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/10"
                            >
                              ✓ Official
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs border ${getProtocolBadgeColor(position.token.yieldConfig.protocol)}`}
                            >
                              {position.token.yieldConfig.protocol}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {position.token.symbol}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.open(`https://solscan.io/token/${position.token.mint.toBase58()}?cluster=devnet`, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Balance Display */}
                      <div className="space-y-1">
                        <p className="text-micro text-fg-muted uppercase tracking-wide">Balance</p>
                        <div className="flex items-end gap-3">
                          <p className="text-3xl font-bold text-purple-400">
                            {position.balance.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6
                            })}
                          </p>
                          <p className="text-body-1 text-fg-secondary font-mono mb-1">
                            {position.token.symbol}
                          </p>
                        </div>
                      </div>

                      {/* Position Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-micro text-fg-muted uppercase tracking-wide flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Estimated Value
                          </p>
                          <p className="text-body-1 font-semibold text-fg-primary tabular-nums">
                            {formatCurrency(position.value)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ≈ {position.value.toFixed(4)} SOL
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-micro text-fg-muted uppercase tracking-wide flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Supply APY
                          </p>
                          <p className="text-body-1 font-semibold text-purple-400 tabular-nums">
                            {position.token.supplyAPY.toFixed(2)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Annual return
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
                        <div className="space-y-1">
                          <p className="text-micro text-fg-muted uppercase tracking-wide">
                            TVL Total
                          </p>
                          <p className="text-body-2 text-fg-secondary tabular-nums">
                            {formatCurrency(position.token.tvl)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-micro text-fg-muted uppercase tracking-wide">
                            Protocol
                          </p>
                          <p className="text-body-2 text-fg-secondary capitalize">
                            {position.token.yieldConfig.protocol}
                          </p>
                        </div>
                      </div>

                      {/* Estimated Earnings */}
                      <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Estimated annual earnings:</span>
                          <span className="text-sm font-semibold text-purple-400">
                            {formatCurrency(position.value * (position.token.supplyAPY / 100))}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = '/dashboard/markets'}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          View Markets
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            window.open(`https://solscan.io/token/${position.token.mint.toBase58()}?cluster=devnet`, '_blank');
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Solscan
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="card-institutional">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                <h3 className="text-h3 text-fg-primary mb-2">Transaction History</h3>
                <p className="text-body-2 text-fg-muted mb-6">
                  Your transaction history will appear here as you interact with markets.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (positions.length > 0) {
                      window.open('https://solscan.io/account/' + positions[0].token.mint.toBase58() + '?cluster=devnet', '_blank');
                    }
                  }}
                  disabled={positions.length === 0}
                >
                  View on Solscan
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
