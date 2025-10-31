import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry, useInvestor, useDeployedTokens, usePurchaseOrders, useAdminRegistry, useWalletTokenBalances } from '@/hooks/solana';
import { useKYCStatus } from '@/hooks/solana/useKYCStatus';
import { useProgramsSafe } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KYCRegistrationForm } from '@/components/kyc/KYCRegistrationForm';
import { motion, AnimatePresence } from 'framer-motion';
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
  Activity,
  Package
} from 'lucide-react';

export function InvestorDashboard() {
  console.log('[InvestorDashboard] ===== COMPONENT RENDERING =====');

  const { publicKey } = useWallet();
  const { userRegistry, completeKYC } = useUserRegistry();
  const { programs, loading: programsLoading, hasPrograms } = useProgramsSafe();
  const { registerIdentity, isVerified, subscribe, getSubscription, claimTokens } = useInvestor();
  const { tokens: deployedTokens, loading: tokensLoading, refresh: refreshTokens } = useDeployedTokens();
  const {
    tokens: walletTokens,
    loading: walletTokensLoading,
    error: walletTokensError,
    refresh: refreshWalletTokens,
  } = useWalletTokenBalances();

  // KYC Status hook
  const { kycStatus, checkKYCStatus } = useKYCStatus();

  console.log('[InvestorDashboard] useKYCStatus returned:', kycStatus);

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

  const [showKYCForm, setShowKYCForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKYCComplete = async () => {
    setShowKYCForm(false);
    await checkKYCStatus();
    toast.success('KYC completed successfully!');
  };

  const handleCompleteKYC = async () => {
    setKycLoading(true);
    try {
      await completeKYC();
      toast.success('KYC completed successfully!');
      await checkKYCStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete KYC');
    } finally {
      setKycLoading(false);
    }
  };

  // Calculate total value
  const totalValue = walletTokenHoldings.reduce((sum, token) => {
    return sum + (token.uiAmount * 0.01); // 0.01 SOL per token
  }, 0);

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

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <CardHeader className="text-center">
            <Wallet className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold">Investor Dashboard</CardTitle>
            <CardDescription className="text-base">
              Connect your wallet to access investor features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (programsLoading || !hasPrograms) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-base text-muted-foreground">Loading programs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug log
  console.log('[InvestorDashboard] KYC Status:', {
    loading: kycStatus.loading,
    hasFactoryKYC: kycStatus.hasFactoryKYC,
    hasControllerKYC: kycStatus.hasControllerKYC,
    hasKYC: kycStatus.hasKYC,
    showKYCForm,
  });

  // Show KYC form only if explicitly requested OR if user has NO Factory KYC at all
  // But wait for the KYC status to load first!
  if (!kycStatus.loading && (showKYCForm || !kycStatus.hasFactoryKYC)) {
    return <KYCRegistrationForm onComplete={handleKYCComplete} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with gradient animation */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
          Investor Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">Manage your identity and view your tokens</p>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KYC Status - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">KYC Status</CardTitle>
                <CardDescription>Verify your identity to participate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {kycStatus.loading ? (
              <div className="flex items-center justify-center p-5">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : kycStatus.hasKYC ? (
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg text-green-400 font-semibold">Verified</p>
                    <p className="text-sm text-muted-foreground">You can participate in offerings</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKYCForm(true)}
                  className="hover:bg-green-500/10 hover:border-green-500/50"
                >
                  Update KYC
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-amber-500/20">
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg text-amber-400 font-semibold">KYC Required</p>
                    <p className="text-sm text-muted-foreground">
                      {!kycStatus.hasFactoryKYC && !kycStatus.hasControllerKYC && 'Complete KYC to enable token transfers'}
                      {kycStatus.hasFactoryKYC && !kycStatus.hasControllerKYC && 'Controller KYC Registry missing - click to sync'}
                      {!kycStatus.hasFactoryKYC && kycStatus.hasControllerKYC && 'Factory User Registry missing - complete registration'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!kycStatus.hasFactoryKYC ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKYCForm(true)}
                      className="hover:bg-amber-500/10 hover:border-amber-500/50"
                    >
                      Start KYC
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCompleteKYC}
                      disabled={kycLoading}
                      className="btn-primary"
                      size="sm"
                    >
                      {kycLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete KYC'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Package className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Tokens
                </p>
              </div>
              <p className="text-4xl font-bold mb-1">{walletTokenHoldings.length}</p>
              <p className="text-sm text-muted-foreground">Different types</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimated Value
                </p>
              </div>
              <p className="text-4xl font-bold text-orange-400 mb-1">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">≈ {totalValue.toFixed(4)} SOL</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
              </div>
              <p className="text-4xl font-bold text-green-400 mb-1">Active</p>
              <p className="text-sm text-muted-foreground">Active portfolio</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Token Holdings - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Wallet className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Your SRWA Tokens</CardTitle>
                  <CardDescription>Tokens you own in the connected wallet</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshWalletTokens}
                disabled={!publicKey || walletTokensLoading}
                className="hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                <RefreshCw className={`h-4 w-4 ${walletTokensLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!publicKey ? (
              <div className="text-center py-16">
                <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-base text-muted-foreground">
                  Connect your wallet to view your SRWA tokens.
                </p>
              </div>
            ) : walletTokensLoading ? (
              <div className="text-center py-16">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-400" />
                <p className="text-base text-muted-foreground mt-4">Loading wallet tokens...</p>
              </div>
            ) : walletTokenHoldings.length === 0 ? (
              <div className="text-center py-16">
                <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-xl font-semibold mb-2">
                  No Tokens Found
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  You don't have any SRWA tokens in the connected wallet yet.
                </p>
                <Button
                  onClick={() => window.location.href = '/dashboard/markets'}
                  className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400"
                >
                  Explore Markets
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {walletTokenHoldings.map((token, index) => {
                    const mint = token.mint;
                    const mintShort =
                      mint && mint.length > 8 ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : mint || '---';
                    const displayName = token.metadata?.name ?? `Token ${mintShort}`;
                    const displaySymbol = token.metadata?.symbol ?? mintShort;
                    const amountNumber = Number(token.uiAmountString);
                    const fractionDigits = Math.min(4, Math.max(0, token.decimals));
                    const formattedAmount = Number.isFinite(amountNumber)
                      ? amountNumber.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: fractionDigits,
                        })
                      : token.uiAmountString;

                    const value = token.uiAmount * 0.01; // 0.01 SOL per token
                    const supplyApy = token.metadata?.supplyAPY || 0;
                    const protocol = token.metadata?.yieldConfig?.protocol || 'Unknown';
                    const estimatedYearlyReturn = value * (supplyApy / 100);

                    return (
                      <motion.div
                        key={token.accountAddress}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-orange-500/5 border border-purple-500/30 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                          {/* Animated gradient overlay */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(251, 146, 60, 0.2))',
                            }}
                          />

                          <CardContent className="p-6 relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-orange-300 bg-clip-text text-transparent">
                                  {displayName}
                                </h3>
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
                                className="hover:bg-purple-500/10"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Balance Display */}
                            <div className="mb-6">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                Balance
                              </p>
                              <div className="flex items-end gap-3">
                                <p className="text-4xl font-bold text-purple-400">
                                  {formattedAmount}
                                </p>
                                <p className="text-xl text-muted-foreground font-mono mb-1">
                                  {displaySymbol}
                                </p>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                              <div>
                                <div className="mb-1 flex items-center text-[11px] text-muted-foreground">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span className="font-medium uppercase tracking-wide">Estimated Value</span>
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
                                    Annual return
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Additional Info */}
                            {token.metadata && (
                              <div className="mb-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div>
                                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                                    Total TVL
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {formatCurrency(token.metadata.tvl)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                                    Protocol
                                  </p>
                                  <p className="text-sm font-semibold capitalize">
                                    {protocol}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Estimated Earnings */}
                            {token.metadata && (
                              <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-500/30 p-4 mb-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground font-medium">Estimated annual earnings:</span>
                                  <span className="text-base font-bold text-purple-400">
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
                                className="flex-1 hover:bg-purple-500/10 hover:border-purple-500/50"
                                onClick={() => window.location.href = '/dashboard/markets'}
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                View Markets
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 hover:bg-orange-500/10 hover:border-orange-500/50"
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
                </AnimatePresence>
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
      </motion.div>
    </div>
  );
}
