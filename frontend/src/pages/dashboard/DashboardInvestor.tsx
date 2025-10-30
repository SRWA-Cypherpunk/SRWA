import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/layout";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KYCRegistrationForm } from '@/components/kyc/KYCRegistrationForm';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Activity
} from 'lucide-react';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry, useDeployedTokens, useWalletTokenBalances } from '@/hooks/solana';

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

export default function DashboardInvestor() {
  const { publicKey } = useWallet();
  const { userRegistry } = useUserRegistry();
  const { tokens: deployedTokens } = useDeployedTokens();
  const {
    tokens: walletTokens,
    loading: walletTokensLoading,
    error: walletTokensError,
    refresh: refreshWalletTokens,
  } = useWalletTokenBalances();

  const [showKYCForm, setShowKYCForm] = useState(false);

  // Check if user has completed KYC
  const hasCompletedKYC = userRegistry?.kyc_completed || false;

  // Combine wallet tokens with deployed token metadata
  const walletTokenHoldings = useMemo(
    () =>
      walletTokens.map((token) => {
        const metadata = deployedTokens.find(
          (deployedToken) => deployedToken.mint.toBase58() === token.mint
        );
        return { ...token, metadata };
      }),
    [deployedTokens, walletTokens]
  );

  // Calculate total value
  const totalValue = walletTokenHoldings.reduce((sum, token) => {
    return sum + (token.uiAmount * 0.01); // 0.01 SOL per token
  }, 0);

  const handleKYCComplete = () => {
    setShowKYCForm(false);
    toast.success('KYC completado com sucesso!');
  };

  // Show KYC form if not completed
  if (showKYCForm || !hasCompletedKYC) {
    return <KYCRegistrationForm onComplete={handleKYCComplete} />;
  }

  if (!publicKey) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Wallet className="h-16 w-16 text-brand-400 mb-6" />
          <h2 className="text-2xl font-semibold mb-3">Investor Dashboard</h2>
          <p className="text-fg-secondary text-center max-w-md">
            Connect your wallet to access investor features
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
          Investor Dashboard
        </h1>
        <p className="text-base sm:text-lg text-fg-secondary mt-2">
          Manage your identity and view your SRWA tokens
        </p>
      </div>

      {/* Dashboard Navigation */}
      <DashboardNav />

      <div className="space-y-8 mt-6">
        {/* KYC Status */}
        <Card className="card-institutional">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-brand-400" />
              <div>
                <CardTitle>KYC Status</CardTitle>
                <CardDescription>Verify your identity to participate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-body-1 text-green-400 font-semibold">Verified</p>
                  <p className="text-body-2 text-fg-muted">You can participate in offerings</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKYCForm(true)}
              >
                Update KYC
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="h-5 w-5 text-purple-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Tokens
                </p>
              </div>
              <p className="text-3xl font-bold">{walletTokenHoldings.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Tipos diferentes</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor Estimado
                </p>
              </div>
              <p className="text-3xl font-bold text-purple-400">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">≈ {totalValue.toFixed(4)} SOL</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
              </div>
              <p className="text-3xl font-bold text-green-400">Active</p>
              <p className="text-xs text-muted-foreground mt-1">Portfolio ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Tokens */}
        <Card className="card-institutional">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-6 w-6 text-brand-400" />
                <div>
                  <CardTitle>Your SRWA Tokens</CardTitle>
                  <CardDescription>Tokens you own in the connected wallet</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshWalletTokens}
                disabled={!publicKey || walletTokensLoading}
              >
                <RefreshCw className={`h-4 w-4 ${walletTokensLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {walletTokensLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-purple-400" />
                <p className="text-sm text-fg-muted mt-4">Loading wallet tokens...</p>
              </div>
            ) : walletTokenHoldings.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium text-fg-primary mb-2">
                  No Tokens Found
                </p>
                <p className="text-sm text-fg-muted mb-6">
                  You don't have any SRWA tokens in the connected wallet yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/markets'}
                >
                  Explorar Mercados
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {walletTokenHoldings.map((token, index) => {
                  const mint = token.mint;
                  const mintShort =
                    mint && mint.length > 8 ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : mint || '---';
                  const displayName = token.metadata?.name ?? `Token ${mintShort}`;
                  const displaySymbol = token.metadata?.symbol ?? mintShort;
                  const amountNumber = Number(token.uiAmountString);
                  const fractionDigits = Math.min(4, Math.max(0, token.decimals));
                  const formattedAmount = Number.isFinite(amountNumber)
                    ? amountNumber.toLocaleString('pt-BR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: fractionDigits,
                      })
                    : token.uiAmountString;

                  const value = token.uiAmount * 0.01;
                  const supplyApy = token.metadata?.supplyAPY || 0;
                  const protocol = token.metadata?.yieldConfig?.protocol || 'Unknown';
                  const estimatedYearlyReturn = value * (supplyApy / 100);

                  return (
                    <motion.div
                      key={token.accountAddress}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="group relative overflow-hidden border-purple-500/30 bg-background transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2">{displayName}</h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/10"
                                >
                                  ✓ Official
                                </Badge>
                                {token.metadata && (
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs border ${getProtocolBadgeColor(protocol)}`}
                                  >
                                    {protocol}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground font-mono">
                                  {displaySymbol}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                window.open(`https://solscan.io/token/${mint}?cluster=devnet`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Balance Display */}
                          <div className="mb-5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                              Saldo
                            </p>
                            <div className="flex items-end gap-3">
                              <p className="text-3xl font-bold text-purple-400">
                                {formattedAmount}
                              </p>
                              <p className="text-lg text-fg-secondary font-mono mb-1">
                                {displaySymbol}
                              </p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                              <div className="mb-1 flex items-center text-[11px] text-muted-foreground">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span className="font-medium uppercase tracking-wide">Valor Estimado</span>
                              </div>
                              <p className="text-lg font-semibold">
                                {formatCurrency(value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ≈ {value.toFixed(4)} SOL
                              </p>
                            </div>

                            {token.metadata && (
                              <div>
                                <div className="mb-1 flex items-center text-[11px] text-muted-foreground">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span className="font-medium uppercase tracking-wide">Supply APY</span>
                                </div>
                                <p className="text-lg font-semibold text-purple-400">
                                  {supplyApy.toFixed(2)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Retorno anual
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          {token.metadata && (
                            <div className="mb-5 grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
                              <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                                  TVL Total
                                </p>
                                <p className="text-sm font-semibold">
                                  {formatCurrency(token.metadata.tvl)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                                  Protocolo
                                </p>
                                <p className="text-sm font-semibold capitalize">
                                  {protocol}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Estimated Earnings */}
                          {token.metadata && (
                            <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3 mb-5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Ganho anual estimado:</span>
                                <span className="text-sm font-semibold text-purple-400">
                                  {formatCurrency(estimatedYearlyReturn)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = '/dashboard/markets'}
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              Ver Mercados
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                window.open(`https://solscan.io/token/${mint}?cluster=devnet`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Solscan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {walletTokensError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{walletTokensError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
