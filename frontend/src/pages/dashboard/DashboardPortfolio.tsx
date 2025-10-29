import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { DashboardLayout, DashboardSection } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Card } from "@/components/ui/card";
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

  const tvl = totalSupplied + totalBorrowed;

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
      label: "Approved Tokens",
      description: "Tokens ready for distribution.",
      count: issuanceCounts.approved,
      badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
      borderClass: "border-emerald-500/20",
      items: issuerRequestBreakdown.approved,
      emptyText: "No approved tokens yet. Submit your first issuance."
    },
    {
      key: "pending",
      label: "Under Review",
      description: "Requests awaiting committee approval.",
      count: issuanceCounts.pending,
      badgeClass: "bg-amber-400/10 border-amber-400/30 text-amber-200",
      borderClass: "border-amber-400/20",
      items: issuerRequestBreakdown.pending,
      emptyText: "Submit a new request to get started."
    },
    {
      key: "rejected",
      label: "Needs Adjustments",
      description: "Requests that were rejected and need to be revised.",
      count: issuanceCounts.rejected,
      badgeClass: "bg-rose-500/10 border-rose-500/30 text-rose-200",
      borderClass: "border-rose-500/20",
      items: issuerRequestBreakdown.rejected,
      emptyText: "No rejected requests so far."
    }
  ] as const;

  const handleCreateSrwa = () => navigate('/srwa-issuance');
  const walletShortAddress = address ? shortenAddress(address, 4) : null;

  return (
    <DashboardLayout>
      {/* Header with Create SRWA Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
            Portfolio Dashboard
          </h1>
          <p className="text-base sm:text-lg text-fg-secondary mt-2">
            A clear view of your SRWA issuances and positions
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <HeroButton
            onClick={handleCreateSrwa}
            variant="brand"
            className="w-full sm:w-auto"
            icon={<Plus className="h-4 w-4" />}
          >
            Create New SRWA
          </HeroButton>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Portfolio Stats */}
      {connected && (
        <DashboardSection decorativeColor="purple">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KPICard
                title="TVL"
                value={walletAssets.loading || blendPositions.loading
                  ? "Loading..."
                  : userPositions.length > 0
                    ? `$${tvl.toFixed(1)}M`
                    : "$0.0M"}
                subtitle="Total Value Locked"
                icon={DollarSign}
                trend={userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0
                  ? `${userPositions.length} position${userPositions.length > 1 ? 's' : ''}`
                  : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
              <KPICard
                title="Net APY"
                value={walletAssets.loading || blendPositions.loading
                  ? "Loading..."
                  : userPositions.length > 0
                    ? netApy
                    : "0.00%"}
                subtitle="Average portfolio profitability"
                icon={BarChart3}
                trend={userPositions.length > 0 && netProfitLoss > 0 ? "up"
                  : userPositions.length > 0 && netProfitLoss < 0 ? "down"
                  : userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0 && connected && netProfitLoss !== 0
                  ? `${netProfitLoss > 0 ? '+' : ''}$${(netProfitLoss / 1000).toFixed(1)}K`
                  : userPositions.length > 0 ? "Stable" : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
              <KPICard
                title="Avg Health Factor"
                value={walletAssets.loading || blendPositions.loading
                  ? "Loading..."
                  : userPositions.length > 0
                    ? avgHealthFactor.toFixed(2)
                    : "--"}
                subtitle="Position risk indicator"
                icon={Shield}
                trend={userPositions.length > 0 && avgHealthFactor >= 2.0 ? "up"
                  : userPositions.length > 0 && avgHealthFactor < 1.5 ? "down"
                  : userPositions.length > 0 ? "neutral" : undefined}
                trendValue={userPositions.length > 0
                  ? avgHealthFactor >= 2.0 ? "Healthy"
                    : avgHealthFactor >= 1.5 ? "Caution"
                      : "At Risk"
                  : undefined}
                className="!cursor-default hover:shadow-none transition-none"
              />
          </div>
        </DashboardSection>
      )}

      {/* Wallet Connection Prompt */}
      {!connected && (
        <DashboardSection>
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Wallet className="h-8 w-8 text-brand-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-fg-primary">
                Connect Your Wallet
              </h3>
              <p className="text-sm sm:text-base text-fg-secondary max-w-md mx-auto">
                View positions, metrics, and SRWA tokens by securely connecting your Solana wallet.
              </p>
            </div>
            <Button
              onClick={connect}
              disabled={connecting}
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-semibold"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </DashboardSection>
      )}

      {/* Issuer Section: Issuance Pipeline */}
      {connected && isIssuer && (
        <DashboardSection
          title="Issuance Pipeline"
          description="Track the status of requests submitted to the SRWA committee"
          decorativeColor="blue"
        >
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
                              +{section.items.length - 4} additional record(s).
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
        </DashboardSection>
      )}

      {/* Investor Section: Wallet Tokens */}
      {connected && isInvestor && (
        <DashboardSection
          title="Wallet Tokens"
          description="Your active SRWA tokens"
          decorativeColor="orange"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-fg-secondary">
                          Summary of SRWA tokens available for staking or liquidity.
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
                        Refresh
                      </Button>
                    </div>

                    <div className="border-t border-border/40 pt-4 space-y-4">
                      {walletTokenError && (
                        <p className="text-xs text-red-400">
                          Error loading wallet tokens: {walletTokenError}
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
                            No SRWA tokens found in connected wallet.
                          </p>
                          <p className="text-xs text-fg-muted">
                            Buy tokens in SRWA markets to see your balances here.
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
                              +{extraWalletHoldings} additional token(s) not displayed.
                            </p>
                          )}
                        </>
                      )}
                    </div>
          </div>
        </DashboardSection>
      )}
    </DashboardLayout>
  );
}
