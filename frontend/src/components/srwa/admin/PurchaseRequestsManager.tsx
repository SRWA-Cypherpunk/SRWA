import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  Send,
  Info,
  ExternalLink,
} from 'lucide-react';
import { usePurchaseOrders, type PurchaseOrderAccount } from '@/hooks/solana/usePurchaseOrders';
import { useTokenDistribution } from '@/hooks/solana/useTokenDistribution';
import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

/**
 * Purchase Requests Manager
 *
 * Interface for admin to approve/reject investor purchase requests
 *
 * FLOW:
 * 1. Investor creates purchase request (SOL sent to admin)
 * 2. Admin views pending requests here
 * 3. Admin approves:
 *    a) SOL goes to USD/SOL pool (Raydium/Orca) - TODO
 *    b) Admin transfers RWA tokens to investor (via useTokenDistribution)
 * 4. Request marked as 'approved'
 */
export function PurchaseRequestsManager() {
  const { publicKey, connected } = useWallet();
  const {
    orders,
    loading,
    approveOrder,
    rejectOrder,
    getStatus
  } = usePurchaseOrders();
  const { tokens: srwaTokens } = useDeployedTokens();
  const { connection } = useConnection();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = orders.filter((o) => getStatus(o) === 'pending');
  const approvedRequests = orders.filter((o) => getStatus(o) === 'approved');
  const rejectedRequests = orders.filter((o) => getStatus(o) === 'rejected');

  const handleApprove = async (order: PurchaseOrderAccount) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setProcessingId(order.publicKey.toBase58());

      // Get admin token account
      const adminTokenAccount = await getAssociatedTokenAddress(
        order.account.mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // Call approveOrder from usePurchaseOrders
      const signature = await approveOrder({
        purchaseOrderPda: order.publicKey,
        mint: order.account.mint,
        investor: order.account.investor,
        adminTokenAccount,
      });

      toast.success('Purchase request approved', {
        description: `Tokens transferred to ${order.account.investor.toBase58().substring(0, 8)}...`,
        action: {
          label: 'View TX',
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              '_blank'
            ),
        },
      });
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Failed to approve request', {
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (order: PurchaseOrderAccount) => {
    try {
      setProcessingId(order.publicKey.toBase58());

      // Get admin vault from srwaTokens
      const tokenData = srwaTokens.find(t => t.mint.equals(order.account.mint));
      if (!tokenData) {
        throw new Error('Token not found');
      }

      const signature = await rejectOrder({
        purchaseOrderPda: order.publicKey,
        investor: order.account.investor,
        adminVault: publicKey!, // Admin wallet receives refund
        reason: 'Rejected by admin',
      });

      toast.warning('Request rejected', {
        description: 'SOL refunded to investor',
        action: {
          label: 'View TX',
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              '_blank'
            ),
        },
      });
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Failed to reject request', {
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to get token metadata
  const getTokenMetadata = (mint: PublicKey) => {
    const token = srwaTokens.find(t => t.mint.equals(mint));
    return {
      name: token?.name || 'Unknown Token',
      symbol: token?.symbol || 'UNKNOWN',
    };
  };

  // Convert BN timestamp to milliseconds
  const formatDate = (timestamp: BN) => {
    // Timestamp is in microseconds, convert to milliseconds
    const ms = timestamp.toNumber() / 1000;
    return new Date(ms).toLocaleString('en-US');
  };

  const formatAddress = (pubkey: PublicKey | string) => {
    const address = typeof pubkey === 'string' ? pubkey : pubkey.toBase58();
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate SOL amount from lamports
  const formatSol = (lamports: BN) => {
    return (lamports.toNumber() / 1e9).toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-50">Purchase Requests</h2>
        <p className="text-sm text-brand-300 mt-1">
          Manage SRWA token purchase requests from investors
        </p>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-brand-800/50 border-brand-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-50">{pendingRequests.length}</p>
                <p className="text-sm text-brand-300">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-800/50 border-brand-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-50">{approvedRequests.length}</p>
                <p className="text-sm text-brand-300">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-800/50 border-brand-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-50">{rejectedRequests.length}</p>
                <p className="text-sm text-brand-300">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>When approving:</strong> Tokens will be automatically transferred to the investor and received SOL
          should be sent to the USD/SOL pool for liquidity.
        </AlertDescription>
      </Alert>

      {/* Pending Requests */}
      <Card className="bg-brand-800/50 border-brand-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-50">
            <Clock className="h-5 w-5 text-yellow-400" />
            Pending Requests
          </CardTitle>
          <CardDescription className="text-brand-300">
            Review and approve/reject purchase requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-brand-400 mx-auto mb-3" />
              <p className="text-brand-300">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((order) => {
                const tokenMeta = getTokenMetadata(order.account.mint);
                const orderId = order.publicKey.toBase58();

                return (
                  <Card key={orderId} className="bg-brand-900/50 border-brand-600">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-brand-50">{tokenMeta.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {tokenMeta.symbol}
                              </Badge>
                            </div>
                            <p className="text-xs text-brand-400 mt-1">{formatDate(order.account.createdAt)}</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Pending
                          </Badge>
                        </div>

                        <Separator className="bg-brand-700" />

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-brand-400">Investor</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm font-mono text-brand-100">
                                {formatAddress(order.account.investor)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  window.open(
                                    `https://explorer.solana.com/address/${order.account.investor.toBase58()}?cluster=devnet`,
                                    '_blank'
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-brand-400">Token Amount</p>
                            <p className="text-sm font-semibold text-brand-50 mt-1">
                              {order.account.quantity.toString()} {tokenMeta.symbol}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-brand-400">SOL Sent</p>
                            <p className="text-sm font-semibold text-green-400 mt-1">
                              {formatSol(order.account.totalLamports)} SOL
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-brand-400">Price Per Token</p>
                            <p className="text-sm font-semibold text-brand-100 mt-1">
                              {formatSol(order.account.pricePerTokenLamports)} SOL
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleApprove(order)}
                            disabled={processingId === orderId}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            {processingId === orderId ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleReject(order)}
                            disabled={processingId === orderId}
                            variant="outline"
                            className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-400"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approved/Rejected */}
      {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
        <Card className="bg-brand-800/50 border-brand-700">
          <CardHeader>
            <CardTitle className="text-brand-50">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...approvedRequests, ...rejectedRequests]
                .sort((a, b) => b.account.updatedAt.toNumber() - a.account.updatedAt.toNumber())
                .slice(0, 5)
                .map((order) => {
                  const tokenMeta = getTokenMetadata(order.account.mint);
                  const status = getStatus(order);

                  return (
                    <div
                      key={order.publicKey.toBase58()}
                      className="flex items-center justify-between p-3 bg-brand-900/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-brand-50">
                          {order.account.quantity.toString()} {tokenMeta.symbol}
                        </p>
                        <p className="text-xs text-brand-400">
                          {formatAddress(order.account.investor)} • {formatDate(order.account.updatedAt)}
                        </p>
                      </div>
                      <Badge
                        className={
                          status === 'approved'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {status === 'approved' ? 'Approved' : 'Rejected'}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
