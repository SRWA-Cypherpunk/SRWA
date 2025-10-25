import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useIssuanceRequests, usePurchaseRequests } from '@/hooks/solana';
import type { RequestStatus, PurchaseRequest } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  TrendingUp,
  Users,
  PlusCircle,
  ExternalLink,
  Wallet,
  Send,
  ShoppingCart
} from 'lucide-react';
import { SolendPoolCreator } from '@/components/srwa/admin/SolendPoolCreator';

const ZERO_PUBKEY = new PublicKey(new Uint8Array(32));

function mapStatus(status: any): RequestStatus {
  if (!status) return 'pending';
  if (status.deployed !== undefined) return 'deployed';
  if (status.rejected !== undefined) return 'rejected';
  return 'pending';
}

function mapProtocol(protocol: any): string {
  if (!protocol) return 'marginfi';
  if (protocol.solend !== undefined) return 'solend';
  return 'marginfi';
}

const topicNames: { [key: number]: string } = {
  1: 'KYC', 2: 'AML', 3: 'ACCREDITED',
  4: 'RESIDENCY', 5: 'PEP', 6: 'SANCTIONS_CLEAR', 7: 'KYB'
};

export function AdminPanel() {
  const { publicKey } = useWallet();
  const issuance = useIssuanceRequests();
  const purchaseRequests = usePurchaseRequests();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const grouped = useMemo(() => {
    const buckets: Record<RequestStatus, typeof issuance.requests> = {
      pending: [],
      rejected: [],
      deployed: [],
    };
    issuance.requests.forEach((req) => {
      const status = mapStatus(req.account.status);
      buckets[status] = [...buckets[status], req];
    });
    return buckets;
  }, [issuance.requests]);

  const handleApprove = async (request: any) => {
    try {
      setLoading(true);
      await issuance.approveSrwa(request);
      toast.success('Request approved and deployed!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      await issuance.rejectSrwa(selectedRequest, rejectReason);
      toast.success('Request rejected');
      setSelectedRequest(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePurchase = async (purchaseReq: PurchaseRequest) => {
    if (!publicKey) return;

    try {
      setLoading(true);

      const mint = new PublicKey(purchaseReq.mint);
      const investor = new PublicKey(purchaseReq.investor);

      // Transferir tokens do admin para o investidor
      const signature = await issuance.transferFromAdminToInvestor(
        mint,
        investor,
        purchaseReq.quantity,
        purchaseReq.decimals
      );

      // Marcar como aprovado
      purchaseRequests.approveRequest(purchaseReq.id, signature, publicKey.toBase58());

      toast.success('Compra aprovada!', {
        description: `${purchaseReq.quantity} ${purchaseReq.tokenSymbol} transferidos para ${investor.toBase58().slice(0, 8)}...`,
      });
    } catch (err: any) {
      toast.error(err.message ?? 'Falha ao processar compra');
      console.error('[AdminPanel.handleApprovePurchase] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPurchase = (purchaseReq: PurchaseRequest) => {
    purchaseRequests.rejectRequest(purchaseReq.id);
    toast.success('Compra rejeitada');
  };

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="card-institutional">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <CardTitle className="text-h2 text-fg-primary">Admin Panel</CardTitle>
            <CardDescription className="text-body-1">
              Connect admin wallet to review requests
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const RequestCard = ({ request, status }: { request: any; status: RequestStatus }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState<'mint' | null>(null);
    const yieldProtocol = mapProtocol(request.account.yieldConfig?.protocol);
    const targetApy = Number(request.account.yieldConfig?.targetApyBps ?? 0) / 100;
    const config = request.account.config;
    const offering = request.account.offering;
    const effectiveMint: PublicKey = issuance.getEffectiveMintKey(request);
    const mintCreated = !effectiveMint.equals(ZERO_PUBKEY);

    const handleCreateMint = async () => {
      try {
        setActionLoading('mint');
        const mintKey = await issuance.createMintForRequest(request);
        toast.success('Mint criado com sucesso', {
          description: mintKey.toBase58(),
        });
      } catch (err: any) {
        toast.error(err.message ?? 'Falha ao criar mint');
      } finally {
        setActionLoading(null);
      }
    };

    return (
      <>
        <Card className="card-institutional hover-lift">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-h3">{request.account.name}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {request.account.symbol} • {request.account.issuer?.toBase58?.()?.slice(0, 8)}...
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={
                  status === 'deployed'
                    ? 'text-green-400 border-green-500/30 bg-green-500/10'
                    : status === 'rejected'
                    ? 'text-red-400 border-red-500/30 bg-red-500/10'
                    : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                }
              >
                <div className="flex items-center space-x-1">
                  {status === 'deployed' && <CheckCircle className="h-3 w-3" />}
                  {status === 'rejected' && <XCircle className="h-3 w-3" />}
                  {status === 'pending' && <Clock className="h-3 w-3" />}
                  <span>{status.toUpperCase()}</span>
                </div>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Token Info */}
            <div className="grid grid-cols-2 gap-4 text-body-2">
              <div>
                <p className="text-fg-muted text-micro">Mint</p>
                <p className="font-mono text-xs text-fg-primary break-all">
                  {mintCreated ? effectiveMint.toBase58() : 'Mint ainda não criado'}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-micro">Decimals</p>
                <p className="text-fg-primary">{request.account.decimals}</p>
              </div>
            </div>

            {/* Token Explorer Link */}
            {mintCreated && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Token na Devnet
                  </p>
                  <a
                    href={`https://explorer.solana.com/address/${effectiveMint.toBase58()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Ver no Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-fg-muted font-mono break-all">
                  {effectiveMint.toBase58()}
                </p>
                {status === 'deployed' && (
                  <p className="text-xs text-green-400 mt-2">
                    ✓ Tokens mintados para o issuer
                  </p>
                )}
              </div>
            )}

            {/* Mint Actions */}
            {status === 'pending' && (
              <div className="space-y-2">
                <Label className="text-xs text-fg-muted">Ação necessária</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  disabled={mintCreated || actionLoading === 'mint' || loading}
                  onClick={handleCreateMint}
                >
                  {actionLoading === 'mint' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  {mintCreated ? 'Mint Criado ✓' : 'Criar Mint'}
                </Button>
                {mintCreated && (
                  <p className="text-xs text-green-400">
                    ✓ Mint criado. Agora você pode aprovar a request (os tokens serão mintados direto para o issuer).
                  </p>
                )}
              </div>
            )}

            {/* Metadata URI */}
            {config?.metadataUri && (
              <div>
                <p className="text-fg-muted text-micro mb-1">Metadata URI</p>
                <a
                  href={config.metadataUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:underline break-all"
                >
                  {config.metadataUri}
                </a>
              </div>
            )}

            {/* View Full Details Button */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Todos os Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{request.account.name} ({request.account.symbol})</DialogTitle>
                  <DialogDescription>Informações completas do token</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Issuer Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-brand-400" />
                      Informações do Issuer
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Issuer Address</p>
                        <p className="text-sm font-mono break-all">{request.account.issuer?.toBase58?.()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                        <p className="text-sm">{request.account.requestId?.toString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Token Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Configuração do Token</h3>
                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nome</p>
                        <p className="text-sm font-semibold">{request.account.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Símbolo</p>
                        <p className="text-sm font-semibold">{request.account.symbol}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Decimals</p>
                        <p className="text-sm">{request.account.decimals}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Default Frozen</p>
                        <p className="text-sm">{config?.defaultFrozen ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Metadata URI</p>
                        <a
                          href={config?.metadataUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-400 hover:underline break-all"
                        >
                          {config?.metadataUri}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* KYC Requirements */}
                  {config?.requiredTopics && config.requiredTopics.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-brand-400" />
                        Requisitos KYC
                      </h3>
                      <div className="flex flex-wrap gap-2 bg-muted/30 p-4 rounded-lg">
                        {config.requiredTopics.map((topic: number) => (
                          <Badge key={topic} variant="secondary">
                            {topicNames[topic] || `Topic ${topic}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offering Details */}
                  {offering && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Detalhes da Oferta</h3>
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Soft Cap</p>
                          <p className="text-sm font-semibold">{offering.target?.softCap?.toString?.()} USDC</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Hard Cap</p>
                          <p className="text-sm font-semibold">{offering.target?.hardCap?.toString?.()} USDC</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Min Ticket</p>
                          <p className="text-sm">{offering.rules?.minTicket?.toString?.()} USDC</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Max Per Investor</p>
                          <p className="text-sm">{offering.rules?.perInvestorCap?.toString?.()} USDC</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Max Investors</p>
                          <p className="text-sm">{offering.rules?.maxInvestors}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                          <p className="text-sm">{offering.pricing?.unitPrice?.toString?.()} {offering.pricing?.currency && JSON.stringify(offering.pricing.currency)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                          <p className="text-sm">{offering.window?.startTs ? new Date(offering.window.startTs.toNumber() * 1000).toLocaleString() : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">End Time</p>
                          <p className="text-sm">{offering.window?.endTs ? new Date(offering.window.endTs.toNumber() * 1000).toLocaleString() : '—'}</p>
                        </div>
                      </div>

                      <div className="mt-3 bg-muted/30 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Fees</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Origination:</span> {offering.feesBps?.originationBps / 100}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Platform:</span> {offering.feesBps?.platformBps / 100}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Success:</span> {offering.feesBps?.successBps / 100}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yield Strategy */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-brand-400" />
                      Estratégia de Yield
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Protocolo</p>
                          <p className="text-sm font-semibold capitalize">{yieldProtocol}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Target APY</p>
                          <p className="text-sm font-semibold">{targetApy}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  {config?.roles && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Roles</h3>
                      <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Issuer Admin:</span> {config.roles.issuerAdmin?.toBase58?.()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compliance Officer:</span> {config.roles.complianceOfficer?.toBase58?.()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transfer Agent:</span> {config.roles.transferAgent?.toBase58?.()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Permanent Delegate:</span> {config.permanentDelegate?.toBase58?.()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Created At</p>
                      <p>{new Date(request.account.createdAt.toNumber() * 1000).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Updated At</p>
                      <p>{new Date(request.account.updatedAt.toNumber() * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Quick Summary */}
            <div className="space-y-2">
              {/* KYC Requirements */}
              {config?.requiredTopics && config.requiredTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">KYC:</span>
                  {config.requiredTopics.slice(0, 3).map((topic: number) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topicNames[topic] || `Topic ${topic}`}
                    </Badge>
                  ))}
                  {config.requiredTopics.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{config.requiredTopics.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Offering Summary */}
              {offering && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Cap: {offering.target?.hardCap?.toString?.()} USDC</span>
                  <span>•</span>
                  <span>Min: {offering.rules?.minTicket?.toString?.()} USDC</span>
                  <span>•</span>
                  <span>Yield: {yieldProtocol} {targetApy}%</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={loading || !mintCreated || actionLoading !== null}
                  className="flex-1 btn-primary"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}

            {/* Deployed Info */}
            {status === 'deployed' && request.account.srwaConfig && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-body-2 text-green-400 font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Successfully Deployed
                </p>
                <div className="space-y-2">
                  <div className="space-y-1 text-micro font-mono text-fg-muted">
                    <p>Config: {request.account.srwaConfig.toBase58().slice(0, 24)}...</p>
                    <p>Offering: {request.account.offeringState?.toBase58?.()?.slice(0, 24) ?? '—'}...</p>
                  </div>
                  <div className="pt-2 border-t border-green-500/20">
                    <p className="text-xs text-fg-muted mb-1">Supply do Admin:</p>
                    <p className="text-xs text-fg-secondary">
                      Os tokens foram mintados para sua carteira de admin. Você gerencia o supply e vende aos investidores conforme recebe pagamentos em SOL.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Info */}
            {status === 'rejected' && request.account.rejectReason && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Rejected: {request.account.rejectReason}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog - Separado do Card para evitar conflitos com Dialog de detalhes */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this token request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Input
                  placeholder="e.g., Incomplete documentation"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={loading || !rejectReason}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirm Rejection'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-1 font-semibold text-fg-primary">Admin Panel</h1>
          <p className="text-body-1 text-fg-secondary">Review and approve token requests</p>
        </div>
        <Button variant="outline" onClick={() => issuance.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="card-institutional">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-h1 text-fg-primary">{grouped.pending.length}</p>
                <p className="text-body-2 text-fg-muted">Pending Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-h1 text-fg-primary">{purchaseRequests.getPendingRequests().length}</p>
                <p className="text-body-2 text-fg-muted">Pending Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-h1 text-fg-primary">{grouped.deployed.length}</p>
                <p className="text-body-2 text-fg-muted">Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-h1 text-fg-primary">{grouped.rejected.length}</p>
                <p className="text-body-2 text-fg-muted">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="pending">
            Pending ({grouped.pending.length})
          </TabsTrigger>
          <TabsTrigger value="deployed">
            Deployed ({grouped.deployed.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({grouped.rejected.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">
            Process Purchases
          </TabsTrigger>
          <TabsTrigger value="solend">
            Solend Pools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {grouped.pending.length === 0 ? (
            <Card className="card-institutional">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                <p className="text-body-1 text-fg-muted">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {grouped.pending.map((request) => (
                <RequestCard key={request.publicKey.toBase58()} request={request} status="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployed" className="space-y-4">
          {grouped.deployed.length === 0 ? (
            <Card className="card-institutional">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                <p className="text-body-1 text-fg-muted">No deployed tokens yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {grouped.deployed.map((request) => (
                <RequestCard key={request.publicKey.toBase58()} request={request} status="deployed" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {grouped.rejected.length === 0 ? (
            <Card className="card-institutional">
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                <p className="text-body-1 text-fg-muted">No rejected requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {grouped.rejected.map((request) => (
                <RequestCard key={request.publicKey.toBase58()} request={request} status="rejected" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          {purchaseRequests.getPendingRequests().length === 0 ? (
            <Card className="card-institutional">
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                <p className="text-body-1 text-fg-muted">Nenhuma compra pendente</p>
                <p className="text-body-2 text-fg-muted mt-2">
                  Quando investidores comprarem tokens, eles aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {purchaseRequests.getPendingRequests().map((purchaseReq) => (
                <Card key={purchaseReq.id} className="card-institutional hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-h3">
                          {purchaseReq.tokenName} ({purchaseReq.tokenSymbol})
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">
                          Investidor: {purchaseReq.investor.slice(0, 8)}...{purchaseReq.investor.slice(-6)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Purchase Details */}
                    <div className="grid grid-cols-3 gap-4 text-body-2">
                      <div>
                        <p className="text-fg-muted text-micro">Quantidade</p>
                        <p className="text-fg-primary font-semibold">{purchaseReq.quantity} {purchaseReq.tokenSymbol}</p>
                      </div>
                      <div>
                        <p className="text-fg-muted text-micro">Total Pago</p>
                        <p className="text-fg-primary font-semibold">{purchaseReq.totalSol.toFixed(4)} SOL</p>
                      </div>
                      <div>
                        <p className="text-fg-muted text-micro">Preço/Token</p>
                        <p className="text-fg-primary font-semibold">{purchaseReq.pricePerToken.toFixed(4)} SOL</p>
                      </div>
                    </div>

                    {/* Transaction Link */}
                    {purchaseReq.txSignature && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-fg-muted mb-1">Transação de Pagamento:</p>
                        <a
                          href={`https://explorer.solana.com/tx/${purchaseReq.txSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          {purchaseReq.txSignature.slice(0, 16)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Mint Info */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-fg-muted mb-1">Token Mint:</p>
                      <p className="text-xs text-fg-primary font-mono break-all">{purchaseReq.mint}</p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-fg-muted">
                      Solicitado em: {new Date(purchaseReq.timestamp).toLocaleString('pt-BR')}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApprovePurchase(purchaseReq)}
                        disabled={loading}
                        className="flex-1 btn-primary"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprovar e Enviar Tokens
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleRejectPurchase(purchaseReq)}
                        disabled={loading}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solend">
          <SolendPoolCreator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
