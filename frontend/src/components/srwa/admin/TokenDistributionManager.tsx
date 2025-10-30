import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Send, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTokenDistribution } from '@/hooks/solana/useTokenDistribution';

/**
 * Token Distribution Manager
 *
 * Allows direct distribution of Token-2022 RWA to KYC'd investors
 *
 * IMPORTANT:
 * - This component works WITH your KYC Transfer Hook
 * - KYC validation happens automatically during transfer
 * - If recipient doesn't have KYC, Transfer Hook will block the transaction
 *
 * FLOW:
 * 1. Admin selects RWA token (Token-2022)
 * 2. Enters investor address
 * 3. Defines amount
 * 4. Transfer Hook validates KYC automatically
 * 5. If KYC OK: transfer is completed
 * 6. If KYC fails: Transfer Hook rejects
 */
export function TokenDistributionManager() {
  const { publicKey, connected } = useWallet();
  const { distributeTokens } = useTokenDistribution();

  const [tokenMint, setTokenMint] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);

  const handleDistribute = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tokenMint || !recipientAddress || !amount) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsDistributing(true);

      // Validate addresses
      const mintPubkey = new PublicKey(tokenMint);
      const recipientPubkey = new PublicKey(recipientAddress);
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error('Invalid amount');
        return;
      }

      // Execute distribution
      const result = await distributeTokens(mintPubkey, recipientPubkey, amountNum);

      if (result.success) {
        toast.success('Distribution completed', {
          description: `${amount} tokens sent to ${recipientAddress.substring(0, 8)}...`,
          action: result.signature ? {
            label: 'View Transaction',
            onClick: () => window.open(`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`, '_blank')
          } : undefined,
        });

        // Clear form
        setRecipientAddress('');
        setAmount('');
      } else {
        toast.error('Distribution failed', {
          description: result.error,
          duration: 8000,
        });
      }

    } catch (error: any) {
      console.error('Distribution error:', error);
      toast.error('Distribution failed', {
        description: error.message,
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-50">Direct Token Distribution</h2>
        <p className="text-sm text-brand-300 mt-1">
          Distribute RWA tokens directly to KYC'd investors
        </p>
      </div>

      <Separator />

      {/* Info Alert */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <UserCheck className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>Automatic KYC Validation:</strong> Your Transfer Hook automatically validates recipient's KYC.
          If investor doesn't have valid KYC, transaction will be rejected on-chain.
        </AlertDescription>
      </Alert>

      {/* Distribution Form */}
      <Card className="bg-brand-800/50 border-brand-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-50">
            <Send className="h-5 w-5" />
            New Distribution
          </CardTitle>
          <CardDescription className="text-brand-300">
            Configure token distribution details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Mint */}
          <div className="space-y-2">
            <Label htmlFor="tokenMint" className="text-brand-100">
              RWA Token (Mint Address)
              <Badge variant="outline" className="ml-2 text-xs">
                Token-2022
              </Badge>
            </Label>
            <Input
              id="tokenMint"
              placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              RWA token address to be distributed
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-brand-100">
              Investor Address
            </Label>
            <Input
              id="recipient"
              placeholder="e.g. 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              Investor wallet that will receive tokens
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-brand-100">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-brand-900/50 border-brand-600 text-brand-50"
            />
            <p className="text-xs text-brand-400">
              Amount of tokens to distribute
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleDistribute}
            disabled={!connected || isDistributing || !tokenMint || !recipientAddress || !amount}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isDistributing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Distributing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Distribute Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-brand-800/30 border-brand-700">
        <CardHeader>
          <CardTitle className="text-brand-50 text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Distribution Initiated</p>
              <p className="text-xs text-brand-400">
                Admin initiates transfer to investor
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Transfer Hook Activated</p>
              <p className="text-xs text-brand-400">
                Your Transfer Hook program executes automatically
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">KYC Validation</p>
              <p className="text-xs text-brand-400">
                Transfer Hook checks if recipient has valid KYC
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div>
              <p className="text-sm text-brand-100 font-medium">Transfer Completed</p>
              <p className="text-xs text-brand-400">
                If KYC OK: tokens are transferred. If KYC fails: transaction is reverted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-brand-800/30 to-brand-700/20 border-brand-600">
        <CardHeader>
          <CardTitle className="text-brand-50 text-lg">Benefits of This Approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Guaranteed Compliance:</strong> KYC validated on-chain for every transfer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Full Control:</strong> Direct distribution without relying on DEXs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Flexibility:</strong> Migrate to public pools when protocols support Token-2022
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-brand-100">
              <strong>Tokens as Collateral:</strong> Investors can use tokens in their SRWA contracts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Future Migration Note */}
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>Future Migration:</strong> When MarginFi, Orca or Raydium add full Token-2022 support,
          you can easily migrate to public pools while keeping your KYC Transfer Hook.
        </AlertDescription>
      </Alert>
    </div>
  );
}
