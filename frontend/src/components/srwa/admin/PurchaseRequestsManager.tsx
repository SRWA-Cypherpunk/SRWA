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
  ShoppingCart,
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
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setProcessingId(order.publicKey.toBase58());

      const signature = await rejectOrder({
        purchaseOrderPda: order.publicKey,
        investor: order.account.investor,
        adminVault: publicKey, // Admin wallet (must match admin signer)
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

    // Debug log
    if (!token) {
      console.log('[PurchaseRequestsManager] Token not found:', mint.toBase58());
      console.log('[PurchaseRequestsManager] Available tokens:', srwaTokens.map(t => ({
        mint: t.mint.toBase58(),
        name: t.name,
        symbol: t.symbol
      })));
    }

    return {
      name: token?.name || `Token ${mint.toBase58().slice(0, 8)}...`,
      symbol: token?.symbol || mint.toBase58().slice(0, 4).toUpperCase(),
    };
  };

  // Convert BN timestamp to milliseconds
  const formatDate = (timestamp: BN) => {
    // Timestamp is in microseconds, convert to milliseconds
    const ms = timestamp.toNumber() / 1000; // microseconds to milliseconds
    return new Date(ms).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
    <div className="space-y-4">

      {/* Pending Requests */}
      {pendingRequests.length === 0 ? (
        <Card className="card-institutional">
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
            <p className="text-body-1 text-fg-muted">No pending purchases</p>
            <p className="text-body-2 text-fg-muted mt-2">
              When investors purchase tokens, they will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((order) => {
            const tokenMeta = getTokenMetadata(order.account.mint);
            const orderId = order.publicKey.toBase58();

            return (
              <Card key={orderId} className="card-institutional">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-h3">{tokenMeta.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        Order #{orderId.slice(0, 8)}... • {formatDate(order.account.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-body-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Investor</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-mono">
                          {formatAddress(order.account.investor)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
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
                      <p className="text-xs text-muted-foreground mb-1">Token Symbol</p>
                      <p className="text-sm font-semibold">{tokenMeta.symbol}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                      <p className="text-sm font-semibold">{order.account.quantity.toString()} tokens</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price Per Token</p>
                      <p className="text-sm">{formatSol(order.account.pricePerTokenLamports)} SOL</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                      <p className="text-sm font-semibold text-green-400">{formatSol(order.account.totalLamports)} SOL</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 relative z-10">
                    <Button
                      onClick={() => handleApprove(order)}
                      disabled={processingId === orderId}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                    >
                      {processingId === orderId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(order);
                      }}
                      disabled={processingId === orderId}
                      className="flex-1 bg-black hover:bg-gray-950 text-gray-400 hover:text-gray-300 border border-gray-700 disabled:opacity-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent History */}
      {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
        <Card className="card-institutional">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Recently processed purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...approvedRequests, ...rejectedRequests]
                .sort((a, b) => b.account.updatedAt.toNumber() - a.account.updatedAt.toNumber())
                .slice(0, 5)
                .map((order) => {
                  const tokenMeta = getTokenMetadata(order.account.mint);
                  const status = getStatus(order);

                  return (
                    <div
                      key={order.publicKey.toBase58()}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {order.account.quantity.toString()} {tokenMeta.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAddress(order.account.investor)} • {formatDate(order.account.updatedAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          status === 'approved'
                            ? 'text-green-400 border-green-500/30 bg-green-500/10'
                            : 'text-red-400 border-red-500/30 bg-red-500/10'
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
