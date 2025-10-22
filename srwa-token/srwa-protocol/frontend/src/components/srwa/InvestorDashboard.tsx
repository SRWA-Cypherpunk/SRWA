import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useInvestor } from '@/hooks/solana';
import { useProgramsSafe } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DollarSign
} from 'lucide-react';

export function InvestorDashboard() {
  const { publicKey } = useWallet();
  const { programs, loading: programsLoading, hasPrograms } = useProgramsSafe();
  const { registerIdentity, isVerified, subscribe, getSubscription, claimTokens } = useInvestor();

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStep, setKycStep] = useState<'check' | 'register' | 'verify' | 'complete'>('check');

  const [poolAddress, setPoolAddress] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (publicKey && hasPrograms && programs.identityClaims) {
      checkKycStatus();
    } else if (!publicKey) {
      setKycStep('register');
      setVerified(false);
    }
  }, [publicKey, hasPrograms]);

  const checkKycStatus = async () => {
    try {
      setError(null);
      const status = await isVerified();
      setVerified(status);
      setKycStep(status ? 'complete' : 'register');
    } catch (err: any) {
      setKycStep('register');
      if (!err.message?.includes('Account does not exist')) {
        setError(err.message);
      }
    }
  };

  const handleRegisterIdentity = async () => {
    try {
      setLoading(true);
      setError(null);
      await registerIdentity();
      setKycStep('verify');
      toast.success('Identity registered!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-display-1 font-semibold text-fg-primary">Investor Dashboard</h1>
        <p className="text-body-1 text-fg-secondary">Manage your identity and participate in offerings</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          {kycStep === 'check' && (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 text-brand-400 mx-auto mb-2 animate-spin" />
              <p className="text-body-2 text-fg-muted">Checking KYC status...</p>
            </div>
          )}

          {kycStep === 'register' && (
            <div className="space-y-4">
              <p className="text-body-1 text-fg-secondary">
                Register your identity to participate in token offerings
              </p>
              <Button onClick={handleRegisterIdentity} disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Register Identity
                  </>
                )}
              </Button>
            </div>
          )}

          {kycStep === 'verify' && (
            <Alert className="border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300">
                Identity registered! Contact a KYC provider to add verification claims.
              </AlertDescription>
            </Alert>
          )}

          {kycStep === 'complete' && (
            <div className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-body-1 text-green-400 font-semibold">Verified</p>
                <p className="text-body-2 text-fg-muted">You can participate in offerings</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscribe */}
      {verified && (
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
