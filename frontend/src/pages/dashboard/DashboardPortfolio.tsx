import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header, Footer } from "@/components/layout";
import { PageBackground } from "@/components/layout/PageBackground";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { cn } from '@/lib/utils';
import { DeployedTokensGrid } from '@/components/srwa/DeployedTokensGrid';
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";
import { DASHBOARD_ROUTES } from "@/lib/constants";

// Hooks
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useWalletAssets } from '@/hooks/wallet/useWalletAssets';
import { useUserBlendPositions, formatPositionValue } from '@/hooks/markets/useUserBlendPositions';
import { useUserRegistry, useIssuanceRequests, useDeployedTokens, useWalletTokenBalances } from '@/hooks/solana';
import type { SrwaRequestAccount } from '@/hooks/solana';
import type { DeployedToken } from '@/hooks/solana/useDeployedTokens';
import type { WalletTokenBalance } from '@/hooks/solana/useWalletTokenBalances';
import { PublicKey } from '@solana/web3.js';

// Icons
import {
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Plus,
  Wallet,
  ArrowRight,
  Loader2,
  RefreshCw
} from "lucide-react";

// Function to get user positions based on wallet address
const getUserPositions = (address: string): UserPosition[] => {
  if (!address) return [];
  // For now, return mock data. In the future, this would query the blockchain
  // using the user's address to get actual positions
  return mockUserPositions;
};

type IssuanceRequestStatus = {
  pending?: unknown;
  rejected?: unknown;
  deployed?: unknown;
};

interface IssuanceRequestAccountData {
  issuer?: PublicKey;
  name?: string;
  symbol?: string;
  status?: IssuanceRequestStatus;
  mint?: PublicKey | null;
  decimals?: number;
  createdAt?: { toNumber?: () => number };
  updatedAt?: { toNumber?: () => number };
}

type WalletHolding = WalletTokenBalance & { metadata?: DeployedToken };

const formatMintAddress = (mint: PublicKey | null | undefined) => {
  if (!mint) {
    return null;
  }

  return mint.toBase58();
};

const shortenAddress = (address: string, chars = 4) => {
  if (address.length <= chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export default function DashboardPortfolio() {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);

  // Wallet connection
  const { connected, address, connect, connecting } = useWallet();
  const { isIssuer, isInvestor } = useUserRegistry();
  const {
    requests: issuanceRequests,
    loading: issuanceLoading,
    error: issuanceError
  } = useIssuanceRequests();
  const {
    tokens: deployedTokens,
    loading: deployedTokensLoading
  } = useDeployedTokens();
  const {
    tokens: walletTokenBalances,
    loading: walletTokenLoading,
    error: walletTokenError,
    refresh: refreshWalletTokens
  } = useWalletTokenBalances();

  // Real wallet data hooks
  const walletAssets = useWalletAssets();
  const blendPositions = useUserBlendPositions();

  const issuerRequestBreakdown = useMemo(() => {
    const empty: { approved: SrwaRequestAccount[]; rejected: SrwaRequestAccount[]; pending: SrwaRequestAccount[] } = {
      approved: [],
      rejected: [],
      pending: [],
    };

    if (!address) {
      return empty;
    }

    issuanceRequests.forEach((request) => {
      const account = request.account as IssuanceRequestAccountData | undefined;
      if (!account) {
        return;
      }

      const issuerAddress = account.issuer?.toBase58();
      if (!issuerAddress || issuerAddress !== address) {
        return;
      }

      const status = account.status;
      if (status && 'deployed' in status) {
        empty.approved.push(request);
      } else if (status && 'rejected' in status) {
        empty.rejected.push(request);
      } else {
        empty.pending.push(request);
      }
    });

    return empty;
  }, [address, issuanceRequests]);

  const deployedTokenByMint = useMemo(() => {
    const map = new Map<string, DeployedToken>();
    deployedTokens.forEach((token) => {
      map.set(token.mint.toBase58(), token);
    });
    return map;
  }, [deployedTokens]);

  const walletHoldings = useMemo<WalletHolding[]>(() => {
    return walletTokenBalances.map((token) => ({
      ...token,
      metadata: deployedTokenByMint.get(token.mint),
    }));
  }, [walletTokenBalances, deployedTokenByMint]);

  // User positions based on connected wallet
  const userPositions = connected && blendPositions.positions.length > 0
    ? blendPositions.positions.map(pos => ({
        marketId: pos.poolAddress,
        marketName: pos.poolName,
        supplied: formatPositionValue(pos.suppliedValue),
        borrowed: formatPositionValue(pos.borrowedValue),
        healthFactor: pos.healthFactor.toFixed(2),
        netApy: (pos.supplyAPY * 100).toFixed(2) + '%',
        collateralValue: formatPositionValue(pos.collateralValue)
      }))
    : getUserPositions(address);

  // Portfolio calculations based on real wallet data
  const totalSupplied = connected && blendPositions.summary
    ? blendPositions.summary.totalSupplied / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.supplied.replace(/[$M,K]/g, '')), 0);

  const totalBorrowed = connected && blendPositions.summary
    ? blendPositions.summary.totalBorrowed / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.borrowed.replace(/[$M,K]/g, '')), 0);

  const avgHealthFactor = connected && blendPositions.summary
    ? blendPositions.summary.averageHealthFactor
    : userPositions.length > 0
      ? userPositions.reduce((acc, pos) => acc + parseFloat(pos.healthFactor), 0) / userPositions.length
      : 0;

  const netApy = connected && blendPositions.summary
    ? (blendPositions.summary.netAPY * 100).toFixed(2) + '%'
    : "3.78%";

  return (
    <PageBackground variant="subtle">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* Dashboard Navigation */}
          <DashboardNav />

          {/* Enhanced Portfolio Content */}
          <div className="space-y-8">
            {/* Wallet Connection Check */}
            {!connected ? (
              <div className="flex justify-center">
                <div className="card-institutional max-w-md w-full rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="text-center space-y-6 p-6 sm:p-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 mx-auto border border-brand-500/20">
                      <Wallet className="h-8 w-8 text-brand-400" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-fg-primary">
                        Connect Your Wallet
                      </h3>
                      <p className="text-body-2 text-fg-secondary leading-relaxed">
                        Connect your Solana wallet to view your lending positions, health factors, and portfolio analytics.
                      </p>
                    </div>

                    <Button
                      onClick={connect}
                      disabled={isConnecting}
                      className="btn-primary w-full px-6 py-3 text-sm font-medium relative overflow-hidden group"
                    >
                      <span className="relative">
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4 relative" />
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Portfolio Header Section */}
                <div className="relative">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-orange-500/5 blur-3xl" />

                  {/* Header Content */}
                  <div className="relative bg-black/40 backdrop-blur-xl border border-brand-500/20 rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Total Portfolio Value */}
                  <div className="text-center lg:text-left">
                    <p className="text-sm text-fg-muted mb-2">Total Portfolio Value</p>
                    <div className="flex items-baseline justify-center lg:justify-start gap-2">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-orange-400 bg-clip-text text-transparent">
                        ${totalValue}
                      </h2>
                      <span className="text-green-400 text-sm font-medium">+12.5%</span>
                    </div>
                    <p className="text-xs text-fg-muted mt-1">Last 30 days</p>
                  </div>

                  {/* Net APY */}
                  <div className="text-center">
                    <p className="text-sm text-fg-muted mb-2">Net APY</p>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-3xl font-bold text-green-400">{netApy}</span>
                    </div>
                    <p className="text-xs text-fg-muted mt-1">Weighted average</p>
                  </div>

                  {/* Health Factor */}
                  <div className="text-center lg:text-right">
                    <p className="text-sm text-fg-muted mb-2">Health Factor</p>
                    <div className="flex items-center justify-center lg:justify-end gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-3xl font-bold text-green-400">2.45</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">Excellent</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <HeroButton
                    onClick={() => window.location.href = '/markets'}
                    variant="brand"
                    className="!px-6 !py-2 !text-sm"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    New Position
                  </HeroButton>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rebalance
                  </Button>
                </div>
              </div>
            </div>

            {/* Content continues */}
            <div className="space-y-8">
                  {/* Active Positions Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">Active Positions</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-fg-muted hover:text-white"
                      >
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Position Cards */}
                      {blendPositions.positions.length > 0 ? (
                        blendPositions.positions.slice(0, 6).map((position, index) => (
                          <div
                            key={position.reserve || index}
                            className="relative bg-black/40 backdrop-blur-xl border border-brand-500/20 rounded-xl p-5 hover:border-brand-500/40 transition-all duration-300 group"
                          >
                            {/* Pool Name */}
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-white">{position.poolName || 'Blend Pool'}</h4>
                                <p className="text-xs text-fg-muted">Since {new Date().toLocaleDateString()}</p>
                              </div>
                              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                                Active
                              </Badge>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-fg-muted">Your Supply</span>
                                <span className="text-sm font-medium text-white">{formatPositionValue(position.supplyBalance)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-fg-muted">APY</span>
                                <span className="text-sm font-medium text-green-400">{(position.supplyApy * 100).toFixed(2)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-fg-muted">Earnings</span>
                                <span className="text-sm font-medium text-brand-400">+${((position.supplyBalance * position.supplyApy) / 12).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-brand-400 to-orange-400" style={{ width: '65%' }} />
                              </div>
                              <p className="text-xs text-fg-muted mt-1">65% of pool capacity</p>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                className="flex-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border-brand-500/30"
                              >
                                Supply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                              >
                                Withdraw
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 text-center py-12">
                          <Wallet className="w-12 h-12 text-fg-muted mx-auto mb-4" />
                          <p className="text-fg-muted">No active positions yet</p>
                          <Button
                            onClick={() => navigate(DASHBOARD_ROUTES.MARKETS)}
                            className="mt-4"
                          >
                            Explore Markets
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SRWA Tokens Section */}
                  {(isIssuer || isInvestor) && (
                    <div className="space-y-6">
                      {isIssuer && (
                        <div className="bg-black/40 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">Your SRWA Emissions</h3>
                              <p className="text-sm text-fg-secondary">
                                Track your approved and rejected token requests
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
                                {issuerRequestBreakdown.approved.length} aprovados
                              </Badge>
                              <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-300">
                                {issuerRequestBreakdown.rejected.length} rejeitados
                              </Badge>
                            </div>
                          </div>

                          {issuanceError && (
                            <p className="text-xs text-red-400">
                              Erro ao carregar solicitações: {issuanceError}
                            </p>
                          )}

                          {issuanceLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                                    Tokens aprovados
                                  </h4>
                                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
                                    {issuerRequestBreakdown.approved.length}
                                  </Badge>
                                </div>
                                {issuerRequestBreakdown.approved.length === 0 ? (
                                  <p className="text-xs text-fg-muted">
                                    Nenhum token aprovado ainda. Envie sua solicitação para revisão.
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {issuerRequestBreakdown.approved.map((request) => {
                                      const account = request.account as IssuanceRequestAccountData | undefined;
                                      const mintAddress = formatMintAddress(account?.mint);
                                      const metadata = mintAddress ? deployedTokenByMint.get(mintAddress) : undefined;
                                      const displayName =
                                        account?.name ??
                                        metadata?.name ??
                                        `Token ${shortenAddress(request.publicKey.toBase58())}`;
                                      const displaySymbol =
                                        account?.symbol ??
                                        metadata?.symbol ??
                                        (mintAddress ? shortenAddress(mintAddress) : '---');

                                      return (
                                        <div
                                          key={request.publicKey.toBase58()}
                                          className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div>
                                              <p className="text-sm font-semibold text-fg-primary">{displayName}</p>
                                              <p className="text-xs text-fg-muted font-mono">{displaySymbol}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
                                              Aprovado
                                            </Badge>
                                          </div>
                                          {mintAddress && (
                                            <p className="text-[10px] text-fg-muted font-mono">
                                              Mint: {shortenAddress(mintAddress, 6)}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                    Tokens rejeitados
                                  </h4>
                                  <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-300">
                                    {issuerRequestBreakdown.rejected.length}
                                  </Badge>
                                </div>
                                {issuerRequestBreakdown.rejected.length === 0 ? (
                                  <p className="text-xs text-fg-muted">
                                    Nenhuma solicitação rejeitada. Continue construindo!
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {issuerRequestBreakdown.rejected.map((request) => {
                                      const account = request.account as IssuanceRequestAccountData | undefined;
                                      const mintAddress = formatMintAddress(account?.mint);
                                      const displayName =
                                        account?.name ?? `Token ${shortenAddress(request.publicKey.toBase58())}`;
                                      const displaySymbol =
                                        account?.symbol ?? (mintAddress ? shortenAddress(mintAddress) : '---');

                                      return (
                                        <div
                                          key={`rejected-${request.publicKey.toBase58()}`}
                                          className="rounded-md border border-red-500/20 bg-red-500/5 p-3 space-y-2"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div>
                                              <p className="text-sm font-semibold text-fg-primary">{displayName}</p>
                                              <p className="text-xs text-fg-muted font-mono">{displaySymbol}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-300">
                                              Rejeitado
                                            </Badge>
                                          </div>
                                          {mintAddress && (
                                            <p className="text-[10px] text-fg-muted font-mono">
                                              Mint: {shortenAddress(mintAddress, 6)}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isInvestor && (
                        <div className="card-institutional rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-fg-primary">Seus tokens stakados</h3>
                              <p className="text-sm text-fg-secondary">
                                Visualize os tokens SRWA que estão na sua carteira conectada.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={refreshWalletTokens}
                              disabled={walletTokenLoading}
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span className="ml-2">Atualizar</span>
                            </Button>
                          </div>

                          {walletTokenError && (
                            <p className="text-xs text-red-400">
                              Erro ao carregar tokens da carteira: {walletTokenError}
                            </p>
                          )}

                          {walletTokenLoading || deployedTokensLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                            </div>
                          ) : walletHoldings.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-6 text-center space-y-2">
                              <Wallet className="h-8 w-8 mx-auto text-fg-muted opacity-70" />
                              <p className="text-sm text-fg-muted">
                                Nenhum token SRWA encontrado na carteira conectada.
                              </p>
                              <p className="text-xs text-fg-muted">
                                Compre tokens nos mercados SRWA para ver seus saldos aqui.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {walletHoldings.map((holding) => {
                                const mintShort = shortenAddress(holding.mint, 6);
                                const displayName = holding.metadata?.name ?? `Token ${mintShort}`;
                                const displaySymbol = holding.metadata?.symbol ?? mintShort;
                                const fractionDigits = Math.min(4, Math.max(0, holding.decimals));
                                const formattedAmount = holding.uiAmount.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: fractionDigits,
                                });

                                return (
                                  <div
                                    key={holding.accountAddress}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-4"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-fg-primary">{displayName}</p>
                                      <p className="text-xs text-fg-muted font-mono">
                                        {displaySymbol} • Mint {mintShort}
                                      </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                      <p className="text-lg font-semibold text-fg-primary">{formattedAmount}</p>
                                      <p className="text-xs text-fg-muted">Quantidade em carteira</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Portfolio Overview KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <KPICard
                      title="Total Supplied"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? `$${totalSupplied.toFixed(1)}M` : "$0.0M"}
                      icon={DollarSign}
                      trend={userPositions.length > 0 ? "up" : undefined}
                      trendValue={userPositions.length > 0 && blendPositions.summary.totalYieldEarned > 0
                        ? `+$${(blendPositions.summary.totalYieldEarned / 1000).toFixed(1)}K earned`
                        : userPositions.length > 0 ? "+5.2%" : undefined}
                    />
                    <KPICard
                      title="Total Borrowed"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? `$${totalBorrowed.toFixed(1)}M` : "$0.0M"}
                      icon={TrendingUp}
                      subtitle={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0
                          ? `${userPositions.length} active position${userPositions.length > 1 ? 's' : ''}`
                          : "No positions"}
                    />
                    <KPICard
                      title="Net APY"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? netApy : "0.00%"}
                      icon={BarChart3}
                      trend={userPositions.length > 0 && blendPositions.summary.netProfitLoss > 0 ? "up" :
                        userPositions.length > 0 && blendPositions.summary.netProfitLoss < 0 ? "down" : undefined}
                      trendValue={userPositions.length > 0 && connected && blendPositions.summary.netProfitLoss !== 0
                        ? `${blendPositions.summary.netProfitLoss > 0 ? '+' : ''}$${(blendPositions.summary.netProfitLoss / 1000).toFixed(1)}K P&L`
                        : userPositions.length > 0 ? "+0.15%" : undefined}
                    />
                    <KPICard
                      title="Avg Health Factor"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? avgHealthFactor.toFixed(2) : "--"}
                      icon={Shield}
                      trend={userPositions.length > 0 && avgHealthFactor >= 2.0 ? "up" :
                        userPositions.length > 0 && avgHealthFactor < 1.5 ? "down" :
                        userPositions.length > 0 ? "neutral" : undefined}
                      trendValue={userPositions.length > 0
                        ? avgHealthFactor >= 2.0 ? "Healthy" : avgHealthFactor >= 1.5 ? "Moderate" : "At Risk"
                        : undefined}
                    />
                  </div>

                  {/* Performance Dashboard */}
                  <div className="bg-black/40 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Performance Overview</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Yield Chart */}
                      <div>
                        <h4 className="text-sm text-fg-muted mb-4">Yield History (30 days)</h4>
                        <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-fg-muted" />
                          <span className="ml-2 text-sm text-fg-muted">Chart coming soon</span>
                        </div>
                      </div>

                      {/* Asset Distribution */}
                      <div>
                        <h4 className="text-sm text-fg-muted mb-4">Asset Distribution</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-brand-400" />
                              <span className="text-sm text-white">Blend Pools</span>
                            </div>
                            <span className="text-sm font-medium text-white">65%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-400" />
                              <span className="text-sm text-white">SRWA Tokens</span>
                            </div>
                            <span className="text-sm font-medium text-white">35%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-black/40 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-fg-muted hover:text-white"
                      >
                        View All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Mock transactions */}
                      {[
                        { type: 'Supply', pool: 'USDC Pool', amount: '$5,000', time: '2 hours ago', status: 'completed' },
                        { type: 'Withdraw', pool: 'DAI Pool', amount: '$2,500', time: '5 hours ago', status: 'completed' },
                        { type: 'Claim', pool: 'USDT Pool', amount: '$150', time: '1 day ago', status: 'completed' }
                      ].map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              tx.type === 'Supply' ? 'bg-green-500/20' :
                              tx.type === 'Withdraw' ? 'bg-orange-500/20' : 'bg-brand-500/20'
                            )}>
                              {tx.type === 'Supply' ? <Plus className="w-4 h-4 text-green-400" /> :
                               tx.type === 'Withdraw' ? <ArrowRight className="w-4 h-4 text-orange-400" /> :
                               <DollarSign className="w-4 h-4 text-brand-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{tx.type}</p>
                              <p className="text-xs text-fg-muted">{tx.pool}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{tx.amount}</p>
                            <p className="text-xs text-fg-muted">{tx.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DEPLOYED SRWA TOKENS SECTION */}
                  <div className="space-y-6">
                    <DeployedTokensGrid />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <Footer
          showCTA
          ctaAction="top"
          ctaTitle="Manage Your Portfolio"
          ctaDescription="Track and optimize your positions"
        />
      </PageBackground>
    );
  }
