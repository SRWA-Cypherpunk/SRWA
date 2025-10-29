import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
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
import { useTokenPurchaseRequests, type TokenPurchaseRequest } from '@/hooks/solana/useTokenPurchaseRequests';
import { useTokenDistribution } from '@/hooks/solana/useTokenDistribution';

/**
 * Purchase Requests Manager
 *
 * Interface para o admin aprovar/rejeitar purchase requests dos investidores
 *
 * FLUXO:
 * 1. Investor cria purchase request (SOL enviado para admin)
 * 2. Admin vê requests pendentes aqui
 * 3. Admin aprova:
 *    a) SOL vai para pool USD/SOL (Raydium/Orca) - TODO
 *    b) Admin transfere tokens RWA para investor (via useTokenDistribution)
 * 4. Request marcada como 'approved'
 */
export function PurchaseRequestsManager() {
  const { publicKey, connected } = useWallet();
  const { requests, loading, approvePurchaseRequest, rejectPurchaseRequest } =
    useTokenPurchaseRequests();
  const { distributeTokens } = useTokenDistribution();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  const handleApprove = async (request: TokenPurchaseRequest) => {
    if (!connected || !publicKey) {
      toast.error('Conecte sua carteira');
      return;
    }

    try {
      setProcessingId(request.id);

      toast.info('📝 Aprovando purchase request...');

      // 1. Approve the request (marks as approved)
      const approvalResult = await approvePurchaseRequest(request.id);
      if (!approvalResult.success) {
        throw new Error(approvalResult.error);
      }

      // 2. Transfer tokens to investor
      toast.info('📤 Transferindo tokens para o investidor...');
      const investorPubkey = new PublicKey(request.investor);
      const tokenMintPubkey = new PublicKey(request.tokenMint);

      const distributionResult = await distributeTokens(
        tokenMintPubkey,
        investorPubkey,
        request.tokenAmount
      );

      if (!distributionResult.success) {
        toast.error('❌ Erro ao transferir tokens', {
          description: distributionResult.error,
          duration: 8000,
        });
        return;
      }

      // 3. TODO: Swap SOL para USD/SOL pool (Raydium/Orca)
      // Placeholder for now
      toast.info('💱 SOL será enviado para pool USD/SOL (implementar)');

      toast.success('✅ Purchase request aprovada!', {
        description: `${request.tokenAmount} ${request.tokenSymbol} transferidos para ${request.investor.substring(0, 8)}...`,
        action: distributionResult.signature
          ? {
              label: 'Ver TX',
              onClick: () =>
                window.open(
                  `https://explorer.solana.com/tx/${distributionResult.signature}?cluster=devnet`,
                  '_blank'
                ),
            }
          : undefined,
      });
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Erro ao aprovar request', {
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: TokenPurchaseRequest) => {
    try {
      setProcessingId(request.id);

      const result = await rejectPurchaseRequest(request.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.warning('Request rejeitada', {
        description: 'Lembre-se de reembolsar o investidor manualmente',
      });
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Erro ao rejeitar request', {
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-50">Purchase Requests</h2>
        <p className="text-sm text-brand-300 mt-1">
          Gerencie solicitações de compra de tokens SRWA dos investidores
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
                <p className="text-sm text-brand-300">Pendentes</p>
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
                <p className="text-sm text-brand-300">Aprovadas</p>
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
                <p className="text-sm text-brand-300">Rejeitadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-brand-100">
          <strong>Ao aprovar:</strong> Os tokens serão transferidos automaticamente para o investidor e o SOL recebido
          deverá ser enviado para a pool USD/SOL para liquidez.
        </AlertDescription>
      </Alert>

      {/* Pending Requests */}
      <Card className="bg-brand-800/50 border-brand-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-50">
            <Clock className="h-5 w-5 text-yellow-400" />
            Requests Pendentes
          </CardTitle>
          <CardDescription className="text-brand-300">
            Revise e aprove/rejeite as solicitações de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-brand-400 mx-auto mb-3" />
              <p className="text-brand-300">Nenhuma request pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-brand-900/50 border-brand-600">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-brand-50">{request.tokenName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {request.tokenSymbol}
                            </Badge>
                          </div>
                          <p className="text-xs text-brand-400 mt-1">{formatDate(request.createdAt)}</p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Pendente
                        </Badge>
                      </div>

                      <Separator className="bg-brand-700" />

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-brand-400">Investidor</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono text-brand-100">
                              {formatAddress(request.investor)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                window.open(
                                  `https://explorer.solana.com/address/${request.investor}?cluster=devnet`,
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
                            {request.tokenAmount} {request.tokenSymbol}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-brand-400">SOL Enviado</p>
                          <p className="text-sm font-semibold text-green-400 mt-1">
                            {request.solAmount.toFixed(4)} SOL
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-brand-400">TX Signature</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-mono text-brand-100">
                              {request.txSignature
                                ? formatAddress(request.txSignature)
                                : 'N/A'}
                            </p>
                            {request.txSignature && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  window.open(
                                    `https://explorer.solana.com/tx/${request.txSignature}?cluster=devnet`,
                                    '_blank'
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          {processingId === request.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aprovar
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleReject(request)}
                          disabled={processingId === request.id}
                          variant="outline"
                          className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approved/Rejected */}
      {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
        <Card className="bg-brand-800/50 border-brand-700">
          <CardHeader>
            <CardTitle className="text-brand-50">Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...approvedRequests, ...rejectedRequests]
                .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
                .slice(0, 5)
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-brand-900/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-brand-50">
                        {request.tokenAmount} {request.tokenSymbol}
                      </p>
                      <p className="text-xs text-brand-400">
                        {formatAddress(request.investor)} • {formatDate(request.approvedAt || request.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={
                        request.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
