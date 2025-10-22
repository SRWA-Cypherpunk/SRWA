import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIssuanceRequests } from '@/hooks/solana';
import type { RequestStatus } from '@/hooks/solana';
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
  Users
} from 'lucide-react';

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
    const yieldProtocol = mapProtocol(request.account.yieldConfig?.protocol);
    const targetApy = Number(request.account.yieldConfig?.targetApyBps ?? 0) / 100;
    const config = request.account.config;
    const offering = request.account.offering;

    return (
      <div>
        <Card className="card-institutional hover-lift">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
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
                <p className="font-mono text-xs text-fg-primary">{request.account.mint.toBase58().slice(0, 16)}...</p>
              </div>
              <div>
                <p className="text-fg-muted text-micro">Decimals</p>
                <p className="text-fg-primary">{request.account.decimals}</p>
              </div>
            </div>

            {/* KYC Requirements */}
            {config?.requiredTopics && config.requiredTopics.length > 0 && (
              <div className="space-y-2">
                <p className="text-body-2 font-semibold text-fg-primary flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-brand-400" />
                  KYC Requirements
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.requiredTopics.map((topic: number) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topicNames[topic] || `Topic ${topic}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Offering Details */}
            {offering && (
              <div className="grid grid-cols-2 gap-3 text-body-2">
                <div>
                  <p className="text-fg-muted text-micro">Hard Cap</p>
                  <p className="text-fg-primary font-semibold">{offering.target?.hardCap?.toString?.()} USDC</p>
                </div>
                <div>
                  <p className="text-fg-muted text-micro">Min Ticket</p>
                  <p className="text-fg-primary">{offering.rules?.minTicket?.toString?.()} USDC</p>
                </div>
              </div>
            )}

            {/* Yield Strategy */}
            <div className="flex items-center space-x-4 p-3 bg-bg-elev-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-brand-400" />
              <div>
                <p className="text-micro text-fg-muted">Yield Strategy</p>
                <p className="text-body-2 text-fg-primary font-semibold">{yieldProtocol} ({targetApy}% APY)</p>
              </div>
            </div>

            {/* Actions */}
            {status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={loading}
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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
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
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedRequest(null)}>
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
              </div>
            )}

            {/* Deployed Info */}
            {status === 'deployed' && request.account.srwaConfig && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-body-2 text-green-400 font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Successfully Deployed
                </p>
                <div className="space-y-1 text-micro font-mono text-fg-muted">
                  <p>Config: {request.account.srwaConfig.toBase58().slice(0, 24)}...</p>
                  <p>Offering: {request.account.offeringState?.toBase58?.()?.slice(0, 24) ?? '—'}...</p>
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
      </div>
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
      <div className="grid grid-cols-3 gap-6">
        <Card className="card-institutional">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-h1 text-fg-primary">{grouped.pending.length}</p>
                <p className="text-body-2 text-fg-muted">Pending</p>
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
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({grouped.pending.length})
          </TabsTrigger>
          <TabsTrigger value="deployed">
            Deployed ({grouped.deployed.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({grouped.rejected.length})
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
      </Tabs>
    </div>
  );
}
