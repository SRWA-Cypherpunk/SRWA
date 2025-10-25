import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIssuer } from '@/hooks/solana';
import type { SRWAConfigInput, OfferingConfigInput, YieldStrategyInput, KYCConfigInput, RequestStatus } from '@/hooks/solana';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Rocket,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Coins,
  TrendingUp,
  Shield,
  FileText,
  RefreshCw
} from 'lucide-react';

type Step = 'token' | 'offering' | 'yield' | 'kyc' | 'complete';
type YieldProtocol = 'marginfi' | 'solend';

function mapStatus(status: any): RequestStatus {
  if (!status) return 'pending';
  if (status.deployed !== undefined) return 'deployed';
  if (status.rejected !== undefined) return 'rejected';
  return 'pending';
}

function mapProtocol(protocol: any): YieldProtocol {
  if (!protocol) return 'marginfi';
  if (protocol.solend !== undefined) return 'solend';
  return 'marginfi';
}

const steps = [
  { id: 'token', label: 'Token', icon: Coins },
  { id: 'offering', label: 'Offering', icon: FileText },
  { id: 'yield', label: 'Yield', icon: TrendingUp },
  { id: 'kyc', label: 'KYC', icon: Shield },
  { id: 'complete', label: 'Complete', icon: CheckCircle },
];

export function IssuerWizard() {
  const { connected, publicKey } = useWallet();
  const issuer = useIssuer();

  const [currentStep, setCurrentStep] = useState<Step>('token');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ name: string; symbol: string; status: RequestStatus } | null>(null);

  const [tokenConfig, setTokenConfig] = useState<SRWAConfigInput & {
    cnpj?: string;
    collateral?: string;
    collateralDocs?: File[];
  }>({
    name: '',
    symbol: '',
    uri: '',
    decimals: 6,
    cnpj: '',
    collateral: '',
    collateralDocs: [],
  });

  const [offeringConfig, setOfferingConfig] = useState<OfferingConfigInput>({
    minInvestment: 100,
    maxInvestment: 100000,
    targetAmount: 1000000,
    lockPeriodDays: 30,
  });

  const [yieldStrategy, setYieldStrategy] = useState<YieldStrategyInput>({
    protocol: 'marginfi',
    targetApy: 5,
  });

  const [kycConfig, setKycConfig] = useState<KYCConfigInput>({
    requireKyc: true,
    approvedProviders: [],
    requiredTopics: [1, 2, 6],
  });

  const issuerRequests = useMemo(() => {
    if (!publicKey) return [];
    return issuer.requests.filter((req) => req.account.issuer?.equals?.(publicKey));
  }, [issuer.requests, publicKey]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="card-institutional">
          <CardHeader className="text-center">
            <CardTitle className="text-h2 text-fg-primary">Create SRWA Token</CardTitle>
            <CardDescription className="text-body-1">
              Connect your wallet to submit a token for approval
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <p className="text-body-1 text-fg-secondary">
              Please connect your wallet to access the token creation wizard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await issuer.submitRequest(tokenConfig, offeringConfig, yieldStrategy, kycConfig);
      setLastSubmission({ name: tokenConfig.name, symbol: tokenConfig.symbol, status: 'pending' });
      setCurrentStep('complete');
      toast.success('Request submitted successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateAndNext = (nextStep: Step) => {
    setError(null);
    if (currentStep === 'token') {
      if (!tokenConfig.name || !tokenConfig.symbol || !tokenConfig.uri) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(nextStep);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-display-1 font-semibold text-fg-primary">
          Create SRWA Token
        </h1>
        <p className="text-body-1 text-fg-secondary max-w-2xl mx-auto">
          Launch your compliant real-world asset token on Solana
        </p>
      </div>

      {/* Step Indicator */}
      <Card className="card-institutional">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = idx < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-bg-elev-2 border-border-subtle text-fg-muted'
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className={`text-micro mt-2 ${isActive ? 'text-brand-400 font-semibold' : 'text-fg-muted'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-border-subtle'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="card-institutional">
        <CardContent className="pt-6">
          {/* Token Configuration */}
          {currentStep === 'token' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 text-fg-primary mb-2">Token Configuration</h2>
                <p className="text-body-2 text-fg-secondary">Define the basic parameters of your SRWA token</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>Token Name *</Label>
                  <Input
                    placeholder="e.g., Real Estate Fund Token"
                    value={tokenConfig.name}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, name: e.target.value })}
                  />
                  <p className="text-micro text-fg-muted">Display name for investors</p>
                </div>

                <div className="space-y-2">
                  <Label>Symbol *</Label>
                  <Input
                    placeholder="e.g., REFT"
                    value={tokenConfig.symbol}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, symbol: e.target.value.toUpperCase() })}
                    maxLength={12}
                  />
                  <p className="text-micro text-fg-muted">Ticker symbol (max 12 characters)</p>
                </div>

                <div className="space-y-2">
                  <Label>Metadata URI *</Label>
                  <Input
                    placeholder="https://... or ipfs://... or ar://..."
                    value={tokenConfig.uri}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, uri: e.target.value })}
                  />
                  <p className="text-micro text-fg-muted">URL hosting token metadata JSON</p>
                </div>

                <div className="space-y-2">
                  <Label>Decimals</Label>
                  <Input
                    type="number"
                    value={tokenConfig.decimals}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, decimals: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={9}
                  />
                  <p className="text-micro text-fg-muted">Token precision (typically 6-9)</p>
                </div>

                <div className="space-y-2">
                  <Label>CNPJ (Opcional)</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={tokenConfig.cnpj}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, cnpj: e.target.value })}
                    maxLength={18}
                  />
                  <p className="text-micro text-fg-muted">CNPJ da empresa emissora (para issuers brasileiros)</p>
                </div>

                <div className="space-y-2">
                  <Label>Garantia (Opcional)</Label>
                  <Textarea
                    placeholder="Descreva a garantia do token (ex: Apólice de imóvel, CRI, etc.)"
                    value={tokenConfig.collateral}
                    onChange={(e) => setTokenConfig({ ...tokenConfig, collateral: e.target.value })}
                    rows={4}
                  />
                  <p className="text-micro text-fg-muted">Descrição da garantia ou lastro do token</p>
                </div>

                <div className="space-y-2">
                  <Label>Documentos de Garantia (Opcional)</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setTokenConfig({ ...tokenConfig, collateralDocs: files });
                      }}
                      className="hidden"
                      id="collateralDocs"
                    />
                    <label
                      htmlFor="collateralDocs"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-fg-secondary text-center">
                        {tokenConfig.collateralDocs && tokenConfig.collateralDocs.length > 0
                          ? `${tokenConfig.collateralDocs.length} arquivo(s) selecionado(s)`
                          : 'Clique para enviar documentos (PDF, imagens)'}
                      </p>
                    </label>
                  </div>
                  {tokenConfig.collateralDocs && tokenConfig.collateralDocs.length > 0 && (
                    <div className="space-y-1">
                      {tokenConfig.collateralDocs.map((file, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={() => validateAndNext('offering')} className="w-full btn-primary">
                Next: Offering Configuration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Offering Configuration */}
          {currentStep === 'offering' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 text-fg-primary mb-2">Offering Configuration</h2>
                <p className="text-body-2 text-fg-secondary">Set investment parameters and limits</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Minimum Investment (USDC)</Label>
                  <Input
                    type="number"
                    value={offeringConfig.minInvestment}
                    onChange={(e) => setOfferingConfig({ ...offeringConfig, minInvestment: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-micro text-fg-muted">Minimum per investor</p>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Investment (USDC)</Label>
                  <Input
                    type="number"
                    value={offeringConfig.maxInvestment}
                    onChange={(e) => setOfferingConfig({ ...offeringConfig, maxInvestment: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-micro text-fg-muted">Maximum per investor</p>
                </div>

                <div className="space-y-2">
                  <Label>Capital Target (USDC)</Label>
                  <Input
                    type="number"
                    value={offeringConfig.targetAmount}
                    onChange={(e) => setOfferingConfig({ ...offeringConfig, targetAmount: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-micro text-fg-muted">Total raise goal</p>
                </div>

                <div className="space-y-2">
                  <Label>Lockup Period (days)</Label>
                  <Input
                    type="number"
                    value={offeringConfig.lockPeriodDays}
                    onChange={(e) => setOfferingConfig({ ...offeringConfig, lockPeriodDays: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-micro text-fg-muted">Token lock duration</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('token')} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep('yield')} className="flex-1 btn-primary">
                  Next: Yield Strategy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Yield Strategy */}
          {currentStep === 'yield' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 text-fg-primary mb-2">Yield Strategy</h2>
                <p className="text-body-2 text-fg-secondary">Configure how capital generates yield before deployment</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Yield Protocol</Label>
                  <Select
                    value={yieldStrategy.protocol}
                    onValueChange={(value: YieldProtocol) => setYieldStrategy({ ...yieldStrategy, protocol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marginfi">MarginFi (DeFi Lending)</SelectItem>
                      <SelectItem value="solend">Solend (Money Market)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-micro text-fg-muted">Where funds are deployed until asset purchase</p>
                </div>

                <div className="space-y-2">
                  <Label>Target APY (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={yieldStrategy.targetApy}
                    onChange={(e) => setYieldStrategy({ ...yieldStrategy, targetApy: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-micro text-fg-muted">Expected annual percentage yield</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('offering')} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep('kyc')} className="flex-1 btn-primary">
                  Next: KYC Configuration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* KYC Configuration */}
          {currentStep === 'kyc' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 text-fg-primary mb-2">KYC Configuration</h2>
                <p className="text-body-2 text-fg-secondary">Define compliance requirements for investors</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireKyc"
                    checked={kycConfig.requireKyc}
                    onCheckedChange={(checked) => setKycConfig({ ...kycConfig, requireKyc: checked as boolean })}
                  />
                  <Label htmlFor="requireKyc" className="text-body-2">
                    Require KYC for all investors
                  </Label>
                </div>

                {kycConfig.requireKyc && (
                  <>
                    <div className="space-y-3">
                      <Label>Required Verification Topics</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 1, name: 'KYC (Identity Verification)' },
                          { id: 2, name: 'AML (Anti-Money Laundering)' },
                          { id: 3, name: 'Accredited Investor' },
                          { id: 4, name: 'Residency Verification' },
                          { id: 5, name: 'PEP (Politically Exposed)' },
                          { id: 6, name: 'Sanctions Clearance' },
                          { id: 7, name: 'KYB (Business Verification)' },
                        ].map(({ id, name }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topic-${id}`}
                              checked={kycConfig.requiredTopics.includes(id)}
                              onCheckedChange={(checked) => {
                                setKycConfig({
                                  ...kycConfig,
                                  requiredTopics: checked
                                    ? [...kycConfig.requiredTopics, id]
                                    : kycConfig.requiredTopics.filter(t => t !== id),
                                });
                              }}
                            />
                            <Label htmlFor={`topic-${id}`} className="text-body-2 font-normal">
                              {name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Approved KYC Providers (Optional)</Label>
                      <Textarea
                        rows={4}
                        placeholder="Enter KYC provider public keys (one per line)"
                        value={kycConfig.approvedProviders.join('\n')}
                        onChange={(e) => setKycConfig({
                          ...kycConfig,
                          approvedProviders: e.target.value.split('\n').filter(p => p.trim()),
                        })}
                      />
                      <p className="text-micro text-fg-muted">Can be configured later</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('yield')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Approval
                      <Rocket className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Complete */}
          {currentStep === 'complete' && lastSubmission && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div>
                <h2 className="text-h2 text-fg-primary mb-2">Request Submitted Successfully!</h2>
                <p className="text-body-1 text-fg-secondary">
                  Your token request is pending admin approval
                </p>
              </div>

              <Card className="bg-bg-elev-1 border-brand-500/20">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Token Name:</span>
                      <span className="text-body-2 text-fg-primary font-semibold">{lastSubmission.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Symbol:</span>
                      <span className="text-body-2 text-fg-primary font-semibold">{lastSubmission.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Status:</span>
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                        {lastSubmission.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => {
                  setTokenConfig({ name: '', symbol: '', uri: '', decimals: 6 });
                  setOfferingConfig({ minInvestment: 100, maxInvestment: 100000, targetAmount: 1000000, lockPeriodDays: 30 });
                  setYieldStrategy({ protocol: 'marginfi', targetApy: 5 });
                  setKycConfig({ requireKyc: true, approvedProviders: [], requiredTopics: [1, 2, 6] });
                  setCurrentStep('token');
                  setLastSubmission(null);
                }}
                variant="outline"
              >
                Create New Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card className="card-institutional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-h2">My Requests</CardTitle>
              <CardDescription>Track the status of your token submissions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => issuer.refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {issuerRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
              <p className="text-body-1 text-fg-muted">No requests submitted yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {issuerRequests.map((request) => {
                const status = mapStatus(request.account.status);
                const yieldProtocol = mapProtocol(request.account.yieldConfig?.protocol);
                const targetApy = Number(request.account.yieldConfig?.targetApyBps ?? 0) / 100;

                return (
                  <Card key={request.publicKey.toBase58()} className="bg-bg-elev-1 hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-h3 text-fg-primary">{request.account.name} ({request.account.symbol})</h3>
                          <p className="text-micro text-fg-muted">
                            {new Date((request.account.createdAt as any)?.toNumber?.() * 1000 || 0).toLocaleString()}
                          </p>
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
                          {status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-body-2">
                        <div>
                          <span className="text-fg-muted">Mint:</span>
                          <p className="font-mono text-xs text-fg-primary">{request.account.mint.toBase58().slice(0, 16)}...</p>
                        </div>
                        <div>
                          <span className="text-fg-muted">Yield:</span>
                          <p className="text-fg-primary">{yieldProtocol} ({targetApy}% APY)</p>
                        </div>
                        <div>
                          <span className="text-fg-muted">Target:</span>
                          <p className="text-fg-primary">{request.account.offering?.target?.hardCap?.toString?.() ?? 'N/A'} USDC</p>
                        </div>
                      </div>

                      {status === 'rejected' && request.account.rejectReason && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Rejected: {request.account.rejectReason}</AlertDescription>
                        </Alert>
                      )}

                      {status === 'deployed' && (
                        <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-body-2 text-green-400 font-semibold mb-2">✓ Successfully Deployed</p>
                          <div className="space-y-1 text-micro font-mono">
                            <p className="text-fg-muted">Config: {request.account.srwaConfig?.toBase58?.()?.slice(0, 24) ?? '—'}...</p>
                            <p className="text-fg-muted">Offering: {request.account.offeringState?.toBase58?.()?.slice(0, 24) ?? '—'}...</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
