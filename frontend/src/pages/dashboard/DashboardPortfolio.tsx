import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header, Footer } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Gradiente Harmonioso */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* SVG Noise Overlay */}
        <svg className="absolute inset-0 opacity-[0.015] w-full h-full">
          <filter id="dashboardNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#dashboardNoiseFilter)" />
        </svg>

        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-60" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(153,69,255,0.15), transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,53,0.12), transparent 50%),
            linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
          `
        }} />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* Header with Create SRWA Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Portfolio Management
              </h1>
              <p className="text-base sm:text-lg text-fg-secondary mt-2">
                Monitor your RWA lending positions and health factors
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <HeroButton
                onClick={() => window.location.href = '/srwa-issuance'}
                variant="brand"
                className="w-full sm:w-auto"
                icon={<Plus className="h-4 w-4" />}
              >
                Create SRWA
              </HeroButton>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <DashboardNav />

          {/* Portfolio Tab Content */}
          <div className="dashboard-tab-content dashboard-portfolio-tab relative space-y-8">
            {/* Decorative Background - Orange */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,107,53,0.12), transparent 70%)'
              }} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 bg-clip-text text-transparent">
                  Your Portfolio Overview
                  <span className="inline-block ml-2">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 inline" />
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                  Track your lending positions, yields, and portfolio health in real-time
                </p>
              </div>

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
                        disabled={connecting}
                        className="btn-primary w-full px-6 py-3 text-sm font-medium relative overflow-hidden group"
                      >
                        <span className="relative">
                          {connecting ? "Connecting..." : "Connect Wallet"}
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 relative" />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {(isIssuer || isInvestor) && (
                    <div className="space-y-6">
                      {isIssuer && (
                        <div className="card-institutional rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-fg-primary">Suas emissões SRWA</h3>
                              <p className="text-sm text-fg-secondary">
                                Acompanhe quais tokens foram aprovados ou rejeitados pelo comitê.
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

                  {/* DEPLOYED SRWA TOKENS SECTION */}
                  <div className="space-y-6">
                    <DeployedTokensGrid />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer
          showCTA
          ctaAction="top"
          ctaTitle="Manage Your Portfolio"
          ctaDescription="Track and optimize your positions"
        />
      </div>
    </div>
  );
}
