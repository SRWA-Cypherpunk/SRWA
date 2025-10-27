import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useUserRegistry, useInvestor, useDeployedTokens, usePurchaseOrders, useAdminRegistry, useWalletTokenBalances } from '@/hooks/solana';
import { useProgramsSafe } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { KYCRegistrationForm } from '@/components/kyc/KYCRegistrationForm';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  TrendingUp,
  FileCheck,
  DollarSign,
  ShoppingCart,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export function InvestorDashboard() {
  const { publicKey } = useWallet();
  const { userRegistry } = useUserRegistry();
  const { programs, loading: programsLoading, hasPrograms } = useProgramsSafe();
  const { adminRegistry, loading: adminLoading } = useAdminRegistry();
  const { registerIdentity, isVerified, subscribe, getSubscription, claimTokens } = useInvestor();
  const { tokens: deployedTokens, loading: tokensLoading, refresh: refreshTokens } = useDeployedTokens();
  const { createOrder, orders: purchaseOrders, getOrdersByInvestor } = usePurchaseOrders();
  const {
    tokens: walletTokens,
    loading: walletTokensLoading,
    error: walletTokensError,
    refresh: refreshWalletTokens,
  } = useWalletTokenBalances();

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
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [poolAddress, setPoolAddress] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  // Purchase state
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // Check if user has completed KYC
  const hasCompletedKYC = userRegistry?.kyc_completed || false;

  const handleKYCComplete = () => {
    setShowKYCForm(false);
    toast.success('KYC completado com sucesso!');
  };

  const handlePurchase = async () => {
    if (!selectedToken || !purchaseQuantity || !publicKey) return;

    // Prevent double-click / double execution
    if (loading) {
      console.log('[InvestorDashboard] Already processing, skipping...');
      return;
    }

    if (!adminRegistry || adminRegistry.authorizedAdmins.length === 0) {
      toast.error('Admin registry não encontrado. Por favor, tente novamente.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const quantity = parseFloat(purchaseQuantity);
      const pricePerTokenSOL = 0.01; // 0.01 SOL por token (temporário para devnet)
      const pricePerTokenLamports = Math.floor(pricePerTokenSOL * 1_000_000_000); // Converter para lamports
      const totalSol = quantity * pricePerTokenSOL;

      // Admin vault (primeiro admin autorizado)
      const adminVault = adminRegistry.authorizedAdmins[0];

      // Criar purchase order on-chain
      const { signature, purchaseOrderPda } = await createOrder({
        mint: selectedToken.mint,
        quantity: Math.floor(quantity), // Quantidade em unidades base
        pricePerTokenLamports,
        adminVault,
      });

      toast.success('Purchase Order Criada!', {
        description: `Você pagou ${totalSol.toFixed(4)} SOL. Aguardando aprovação do admin para receber ${quantity} ${selectedToken.symbol}.`,
      });

      console.log('[InvestorDashboard] Purchase order criada:', {
        signature,
        purchaseOrderPda: purchaseOrderPda.toBase58(),
      });

      setShowPurchaseDialog(false);
      setPurchaseQuantity('');
      setSelectedToken(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao criar purchase order: ' + err.message);
      console.error('[InvestorDashboard] Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const mint = new PublicKey(poolAddress);
      const amount = new BN(parseFloat(subscriptionAmount) * 10 ** 6);

      const result = await subscribe(mint, amount);
      toast.success('Subscribed successfully!');

      const sub = await getSubscription(mint);
      setSubscription(sub);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      setError(null);

      const mint = new PublicKey(poolAddress);
      await claimTokens(mint);
      toast.success('Tokens claimed successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="card-institutional">
          <CardHeader className="text-center">
            <Wallet className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <CardTitle className="text-h2 text-fg-primary">Investor Dashboard</CardTitle>
            <CardDescription className="text-body-1">
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
        <Card className="card-institutional">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-brand-400 mx-auto mb-4 animate-spin" />
            <p className="text-body-1 text-fg-secondary">Loading programs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show KYC form only if explicitly requested
  if (showKYCForm) {
    return <KYCRegistrationForm onComplete={handleKYCComplete} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-display-1 font-semibold text-fg-primary">Investor Dashboard</h1>
        <p className="text-body-1 text-fg-secondary">Manage your investments and participate in offerings</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Available Tokens */}
      {true && (
        <Card className="card-institutional">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-brand-400" />
                <div>
                  <CardTitle>Available Tokens</CardTitle>
                  <CardDescription>Compre tokens SRWA com SOL (Devnet POC)</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={refreshTokens}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tokensLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-400" />
                <p className="text-sm text-fg-muted mt-2">Carregando tokens...</p>
              </div>
            ) : deployedTokens.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-fg-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm text-fg-muted">Nenhum token disponível ainda</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {deployedTokens.map((token) => (
                  <Card key={token.mint.toBase58()} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-fg-primary">{token.name}</h3>
                          <p className="text-sm text-fg-muted font-mono">{token.symbol}</p>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                          Disponível
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-fg-muted">Yield APY</p>
                          <p className="text-sm font-semibold text-fg-primary">{token.supplyAPY}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-fg-muted">Protocolo</p>
                          <p className="text-sm font-semibold text-fg-primary capitalize">{token.yieldConfig.protocol}</p>
                        </div>
                        <div>
                          <p className="text-xs text-fg-muted">Preço</p>
                          <p className="text-sm font-semibold text-fg-primary">0.01 SOL</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedToken(token);
                            setShowPurchaseDialog(true);
                          }}
                          className="flex-1 btn-primary"
                          size="sm"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Comprar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://explorer.solana.com/address/${token.mint.toBase58()}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprar {selectedToken?.symbol}</DialogTitle>
            <DialogDescription>
              Pague com SOL e receba tokens SRWA (POC para Devnet)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantidade de {selectedToken?.symbol}</Label>
              <Input
                type="number"
                placeholder="100"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
              />
            </div>

            {purchaseQuantity && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-fg-muted">Total a pagar:</span>
                  <span className="font-semibold text-fg-primary">
                    {(parseFloat(purchaseQuantity) * 0.01).toFixed(4)} SOL
                  </span>
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Você está pagando SOL para o admin. Os tokens {selectedToken?.symbol} serão
                enviados para sua carteira pelo admin em breve.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPurchaseDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 btn-primary"
                onClick={handlePurchase}
                disabled={loading || !purchaseQuantity}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Pagar ${(parseFloat(purchaseQuantity || '0') * 0.01).toFixed(4)} SOL`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscribe (método antigo com pool) */}
      {hasCompletedKYC && false && (
        <Card className="card-institutional">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-brand-400" />
              <div>
                <CardTitle>Subscribe to Offering</CardTitle>
                <CardDescription>Commit capital to a token offering</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Token Mint Address</Label>
              <Input
                placeholder="Enter token mint public key"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (USDC)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={subscriptionAmount}
                onChange={(e) => setSubscriptionAmount(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading || !poolAddress || !subscriptionAmount}
              className="w-full btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Subscribe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      {subscription && (
        <Card className="card-institutional">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <FileCheck className="h-6 w-6 text-brand-400" />
              <div>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>Manage your commitment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-micro text-fg-muted">Amount</p>
                <p className="text-h3 text-fg-primary">{subscription.amount.toString()} USDC</p>
              </div>
              <div>
                <p className="text-micro text-fg-muted">Status</p>
                <Badge variant={subscription.claimed ? 'default' : 'outline'}>
                  {subscription.claimed ? 'Claimed' : 'Pending'}
                </Badge>
              </div>
            </div>

            {!subscription.claimed && (
              <Button onClick={handleClaimTokens} disabled={loading} className="w-full btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  'Claim Tokens'
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
