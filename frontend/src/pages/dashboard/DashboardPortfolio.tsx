import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header, Footer } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";

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
  const netProfitLoss = blendPositions.summary?.netProfitLoss ?? 0;

  const issuanceCounts = {
    approved: issuerRequestBreakdown.approved.length,
    pending: issuerRequestBreakdown.pending.length,
    rejected: issuerRequestBreakdown.rejected.length,
  };

  const walletHoldingsPreview = walletHoldings.slice(0, 6);
  const extraWalletHoldings = Math.max(walletHoldings.length - walletHoldingsPreview.length, 0);

  const describeRequest = (request: SrwaRequestAccount) => {
    const account = request.account as IssuanceRequestAccountData | undefined;
    const mintAddress = formatMintAddress(account?.mint);
    const metadata = mintAddress ? deployedTokenByMint.get(mintAddress) : undefined;

    return {
      key: request.publicKey.toBase58(),
      name: account?.name ?? metadata?.name ?? `Token ${shortenAddress(request.publicKey.toBase58())}`,
      symbol: account?.symbol ?? metadata?.symbol ?? (mintAddress ? shortenAddress(mintAddress) : '---'),
      mintAddress,
    };
  };

  const issuanceSections = [
    {
      key: "approved",
      label: "Tokens aprovados",
      description: "Tokens prontos para distribuição.",
      count: issuanceCounts.approved,
      badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
      borderClass: "border-emerald-500/20",
      items: issuerRequestBreakdown.approved,
      emptyText: "Nenhum token aprovado ainda. Envie sua primeira emissão."
    },
    {
      key: "pending",
      label: "Em análise",
      description: "Solicitações aguardando aprovação do comitê.",
      count: issuanceCounts.pending,
      badgeClass: "bg-amber-400/10 border-amber-400/30 text-amber-200",
      borderClass: "border-amber-400/20",
      items: issuerRequestBreakdown.pending,
      emptyText: "Envie uma nova solicitação para começar."
    },
    {
      key: "rejected",
      label: "Necessitam ajustes",
      description: "Pedidos que foram rejeitados e precisam ser revisados.",
      count: issuanceCounts.rejected,
      badgeClass: "bg-rose-500/10 border-rose-500/30 text-rose-200",
      borderClass: "border-rose-500/20",
      items: issuerRequestBreakdown.rejected,
      emptyText: "Nenhuma solicitação rejeitada até agora."
    }
  ] as const;

  const handleCreateSrwa = () => navigate('/srwa-issuance');
  const walletShortAddress = address ? shortenAddress(address, 4) : null;

  return (
    <div className="min-h-screen bg-background">

      <Header />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
        <section className="rounded-3xl border border-border/60 bg-card/80 shadow-[0_20px_50px_rgba(12,10,18,0.45)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-muted">Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-fg-primary">
                Cockpit do portfólio SRWA
              </h1>
              <p className="text-sm sm:text-base text-fg-secondary max-w-2xl">
                Uma visão clara das suas emissões e posições para decidir com confiança, sem ruído visual.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {walletShortAddress && (
                <div className="rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs font-semibold text-brand-200 text-center">
                  Carteira {walletShortAddress}
                </div>
              )}
              <HeroButton
                onClick={handleCreateSrwa}
                variant="brand"
                className="w-full sm:w-auto"
                icon={<Plus className="h-4 w-4" />}
              >
                Criar novo SRWA
              </HeroButton>
            </div>
          </div>

          {connected && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KPICard
                title="Total Supplied"
                value={walletAssets.loading || blendPositions.loading
                  ? "Carregando..."
                  : userPositions.length > 0
                    ? `$${totalSupplied.toFixed(1)}M`
                    : "$0.0M"}
                subtitle="Volume depositado em protocolos SRWA"
                icon={DollarSign}
                className="!cursor-default hover:shadow-none transition-none"
              />
              <KPICard
                title="Total Borrowed"
                value={walletAssets.loading || blendPositions.loading
                  ? "Carregando..."
                  : userPositions.length > 0
                    ? `$${totalBorrowed.toFixed(1)}M`
                    : "$0.0M"}
                subtitle={userPositions.length > 0
                  ? "Posições ativas na sua carteira"
                  : "Nenhuma posição ativa"}
                icon={TrendingUp}
                trend={userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0
                  ? `${userPositions.length} posição${userPositions.length > 1 ? 's' : ''}`
                  : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
              <KPICard
                title="Net APY"
                value={walletAssets.loading || blendPositions.loading
                  ? "Carregando..."
                  : userPositions.length > 0
                    ? netApy
                    : "0.00%"}
                subtitle="Rentabilidade média do portfólio"
                icon={BarChart3}
                trend={userPositions.length > 0 && netProfitLoss > 0 ? "up"
                  : userPositions.length > 0 && netProfitLoss < 0 ? "down"
                  : userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0 && connected && netProfitLoss !== 0
                  ? `${netProfitLoss > 0 ? '+' : ''}$${(netProfitLoss / 1000).toFixed(1)}K`
                  : userPositions.length > 0 ? "Estável" : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
              <KPICard
                title="Avg Health Factor"
                value={walletAssets.loading || blendPositions.loading
                  ? "Carregando..."
                  : userPositions.length > 0
                    ? avgHealthFactor.toFixed(2)
                    : "--"}
                subtitle="Indicador de risco das posições"
                icon={Shield}
                trend={userPositions.length > 0 && avgHealthFactor >= 2.0 ? "up"
                  : userPositions.length > 0 && avgHealthFactor < 1.5 ? "down"
                  : userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0
                  ? avgHealthFactor >= 2.0 ? "Saudável"
                    : avgHealthFactor >= 1.5 ? "Atenção"
                      : "Em risco"
                  : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
            </div>
          )}
        </section>

        <DashboardNav />

        {!connected ? (
          <section className="rounded-3xl border border-border/60 bg-card/80 shadow-[0_12px_35px_rgba(12,10,18,0.45)] p-8 sm:p-10 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Wallet className="h-8 w-8 text-brand-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-fg-primary">
                Conecte sua carteira
              </h3>
              <p className="text-sm sm:text-base text-fg-secondary max-w-md mx-auto">
                Visualize posições, métricas e tokens SRWA conectando sua carteira Solana de forma segura.
              </p>
            </div>
            <Button
              onClick={connect}
              disabled={connecting}
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-semibold"
            >
              {connecting ? "Conectando..." : "Conectar carteira"}
            </Button>
          </section>
        ) : (
          <>
            {(isIssuer || isInvestor) && (
              <section className="grid gap-6 lg:grid-cols-5">
                {isIssuer && (
                  <div className={`rounded-3xl border border-border/60 bg-card/70 shadow-[0_12px_35px_rgba(12,10,18,0.45)] p-6 space-y-6 ${isInvestor ? "lg:col-span-3" : "lg:col-span-5"}`}>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                        Espaço do emissor
                      </span>
                      <h2 className="text-lg font-semibold text-fg-primary">Pipeline de emissões</h2>
                      <p className="text-sm text-fg-secondary">
                        Acompanhe o status das solicitações enviadas para o comitê SRWA.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {issuanceSections.map((section) => (
                        <div
                          key={section.key}
                          className={`rounded-2xl border bg-background/40 p-4 ${section.borderClass}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                                {section.label}
                              </p>
                              <p className="text-xs text-fg-secondary">
                                {section.description}
                              </p>
                            </div>
                            <Badge variant="outline" className={section.badgeClass}>
                              {section.count}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-1">
                            {section.items.length === 0 ? (
                              <p className="text-xs text-fg-muted leading-relaxed">
                                {section.emptyText}
                              </p>
                            ) : (
                              section.items.slice(0, 4).map((request) => {
                                const { key, name, symbol, mintAddress } = describeRequest(request);
                                return (
                                  <div
                                    key={key}
                                    className="rounded-xl border border-border/40 bg-card/40 p-3 space-y-2"
                                  >
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-fg-primary">{name}</p>
                                      <p className="text-xs text-fg-muted font-mono">{symbol}</p>
                                    </div>
                                    {mintAddress && (
                                      <p className="text-[10px] text-fg-muted font-mono uppercase">
                                        Mint · {shortenAddress(mintAddress, 6)}
                                      </p>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                          {section.items.length > 4 && (
                            <p className="text-[11px] text-fg-muted">
                              +{section.items.length - 4} registro(s) adicionais.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isInvestor && (
                  <div className={`rounded-3xl border border-border/60 bg-card/70 shadow-[0_12px_35px_rgba(12,10,18,0.45)] p-6 space-y-6 ${isIssuer ? "lg:col-span-2" : "lg:col-span-5"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                          Espaço do investidor
                        </span>
                        <h2 className="text-lg font-semibold text-fg-primary">Tokens na carteira</h2>
                        <p className="text-sm text-fg-secondary">
                          Resumo dos tokens SRWA disponíveis para staking ou liquidez.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshWalletTokens}
                        disabled={walletTokenLoading}
                        className="gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${walletTokenLoading ? "animate-spin" : ""}`} />
                        Atualizar
                      </Button>
                    </div>

                    <div className="border-t border-border/40 pt-4 space-y-4">
                      {walletTokenError && (
                        <p className="text-xs text-red-400">
                          Erro ao carregar tokens da carteira: {walletTokenError}
                        </p>
                      )}

                      {walletTokenLoading || deployedTokensLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                        </div>
                      ) : walletHoldingsPreview.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-6 text-center space-y-2">
                          <Wallet className="h-8 w-8 mx-auto text-fg-muted opacity-70" />
                          <p className="text-sm text-fg-muted">
                            Nenhum token SRWA encontrado na carteira conectada.
                          </p>
                          <p className="text-xs text-fg-muted">
                            Compre tokens nos mercados SRWA para ver seus saldos aqui.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {walletHoldingsPreview.map((holding) => {
                              const mintShort = shortenAddress(holding.mint, 6);
                              const displayName = holding.metadata?.name ?? `Token ${mintShort}`;
                              const displaySymbol = holding.metadata?.symbol ?? mintShort;
                              const formattedAmount = holding.uiAmount.toLocaleString(undefined, {
                                maximumFractionDigits: holding.uiAmount < 1 ? 5 : 2,
                              });

                              return (
                                <div
                                  key={holding.mint}
                                  className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/40 p-4"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-fg-primary">{displayName}</p>
                                    <p className="text-xs text-fg-muted font-mono">{displaySymbol}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-fg-primary">
                                      {formattedAmount}
                                    </p>
                                    <p className="text-[10px] text-fg-muted font-mono uppercase">
                                      {mintShort}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {extraWalletHoldings > 0 && (
                            <p className="text-xs text-fg-muted">
                              +{extraWalletHoldings} token(s) adicionais não exibidos.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

          </>
        )}
      </main>

      <Footer
        showCTA
        ctaAction="top"
        ctaTitle="Gerencie seu portfólio"
        ctaDescription="Acompanhe e otimize suas posições"
      />
    </div>
  );
}
