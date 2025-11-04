import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  TrendingUp,
  DollarSign,
  Send,
  Settings,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { usePoolDistribution } from '@/hooks/solana/usePoolDistribution';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';

export function PoolDistributionMonitor() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { configs, loading, getConfigByMint, getPoolVaultBalance, distributeToIssuer, updateThreshold, initialize } = usePoolDistribution();
  const { tokens } = useDeployedTokens();

  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null);
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [config, setConfig] = useState<any>(null);
  const [distributing, setDistributing] = useState(false);
  const [newThreshold, setNewThreshold] = useState('');
  const [updatingThreshold, setUpdatingThreshold] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initThreshold, setInitThreshold] = useState('1');
  const [initIssuer, setInitIssuer] = useState('');

  // Fetch config and pool balance for selected mint
  useEffect(() => {
    if (!selectedMint) return;

    const fetchData = async () => {
      const cfg = await getConfigByMint(selectedMint);
      setConfig(cfg);

      if (cfg) {
        const balance = await getPoolVaultBalance(cfg.account.poolVault);
        setPoolBalance(balance);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, [selectedMint, getConfigByMint, getPoolVaultBalance]);

  const handleDistribute = async () => {
    if (!selectedMint || !config || !connected) {
      toast.error('Please select a token and connect wallet');
      return;
    }

    try {
      setDistributing(true);

      // Note: poolVault must be a signer
      // For production, this would be a PDA or managed differently
      toast.warning('Pool vault must sign this transaction. This requires the pool vault keypair.');

      // This is a simplified version - in production you'd handle the keypair securely
      toast.error('Execute distribution is not available in UI yet. Use the crank bot or CLI.');

    } catch (error: any) {
      console.error('Distribute error:', error);
      toast.error('Failed to distribute', {
        description: error.message,
      });
    } finally {
      setDistributing(false);
    }
  };

  const handleUpdateThreshold = async () => {
    if (!selectedMint || !newThreshold || !connected) {
      toast.error('Please enter a valid threshold');
      return;
    }

    try {
      setUpdatingThreshold(true);

      const thresholdLamports = parseFloat(newThreshold) * 1e9;

      const signature = await updateThreshold({
        mint: selectedMint,
        newThreshold: thresholdLamports,
      });

      toast.success('Threshold updated!', {
        description: `New threshold: ${newThreshold} SOL`,
        action: {
          label: 'View TX',
          onClick: () => window.open(
            `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            '_blank'
          ),
        },
      });

      setNewThreshold('');

      // Refresh config
      const cfg = await getConfigByMint(selectedMint);
      setConfig(cfg);

    } catch (error: any) {
      console.error('Update threshold error:', error);
      toast.error('Failed to update threshold', {
        description: error.message,
      });
    } finally {
      setUpdatingThreshold(false);
    }
  };

  const handleInitialize = async () => {
    if (!selectedMint || !initIssuer || !connected) {
      toast.error('Please enter issuer address');
      return;
    }

    try {
      setInitializing(true);

      const thresholdLamports = parseFloat(initThreshold) * 1e9;
      const issuerPubkey = new PublicKey(initIssuer);

      const signature = await initialize({
        mint: selectedMint,
        threshold: thresholdLamports,
        issuer: issuerPubkey,
      });

      toast.success('Pool distribution initialized!', {
        description: `Threshold: ${initThreshold} SOL, Issuer: ${initIssuer.slice(0, 8)}...`,
        action: {
          label: 'View TX',
          onClick: () => window.open(
            `https://explorer.solana.com/tx/${signature}?cluster=localnet`,
            '_blank'
          ),
        },
      });

      // Refresh config
      const cfg = await getConfigByMint(selectedMint);
      setConfig(cfg);

    } catch (error: any) {
      console.error('Initialize error:', error);
      toast.error('Failed to initialize', {
        description: error.message,
      });
    } finally {
      setInitializing(false);
    }
  };

  const thresholdSol = config ? config.account.threshold.toNumber() / 1e9 : 0;
  const poolBalanceSol = poolBalance / 1e9;
  const progress = thresholdSol > 0 ? (poolBalanceSol / thresholdSol) * 100 : 0;
  const canDistribute = poolBalanceSol >= thresholdSol && thresholdSol > 0;

  return (
    <div className="space-y-4">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Pool Distribution Monitor</CardTitle>
          <CardDescription>
            Monitor SOL accumulation and distribute to issuer when threshold is met
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div>
            <Label>Select Token</Label>
            <select
              className="w-full mt-2 p-2 bg-muted rounded border border-border"
              value={selectedMint?.toBase58() || ''}
              onChange={(e) => setSelectedMint(e.target.value ? new PublicKey(e.target.value) : null)}
            >
              <option value="">-- Select a token --</option>
              {tokens.map((token) => (
                <option key={token.mint.toBase58()} value={token.mint.toBase58()}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {!config && selectedMint && (
            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <Info className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                Pool distribution not initialized for this token. Initialize it below.
              </AlertDescription>
            </Alert>
          )}

          {!config && selectedMint && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Initialize Pool Distribution
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Threshold (SOL)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      value={initThreshold}
                      onChange={(e) => setInitThreshold(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Issuer Address</Label>
                    <Input
                      type="text"
                      placeholder="Enter issuer wallet address"
                      value={initIssuer}
                      onChange={(e) => setInitIssuer(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleInitialize}
                    disabled={!initIssuer || !initThreshold || initializing}
                    className="w-full"
                  >
                    {initializing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Initialize Pool Distribution
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {config && (
            <>
              {/* Pool Status */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      Pool Balance
                    </div>
                    <div className="text-2xl font-bold">{poolBalanceSol.toFixed(4)} SOL</div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Threshold
                    </div>
                    <div className="text-2xl font-bold">{thresholdSol.toFixed(4)} SOL</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress to next distribution</span>
                    <span className="text-sm font-semibold">{Math.min(progress, 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                {/* Status Alert */}
                {canDistribute ? (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      ✅ Ready to distribute! Pool has reached the threshold.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Waiting for pool to reach threshold. Need {(thresholdSol - poolBalanceSol).toFixed(4)} more SOL.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Distribution Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Distributed</p>
                    <p className="text-sm font-semibold">
                      {(config.account.totalDistributed.toNumber() / 1e9).toFixed(4)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distribution Count</p>
                    <p className="text-sm font-semibold">
                      {config.account.distributionCount.toNumber()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issuer</p>
                    <p className="text-xs font-mono">
                      {config.account.issuer.toBase58().slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleDistribute}
                    disabled={!canDistribute || distributing}
                    className="flex-1"
                  >
                    {distributing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Distributing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Distribute to Issuer
                      </>
                    )}
                  </Button>
                </div>

                {/* Update Threshold */}
                <div className="pt-4 border-t border-border">
                  <Label className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    Update Threshold
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="New threshold (SOL)"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUpdateThreshold}
                      disabled={!newThreshold || updatingThreshold}
                      variant="outline"
                    >
                      {updatingThreshold ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {!config && selectedMint && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No distribution config found for this token. Initialize it first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
