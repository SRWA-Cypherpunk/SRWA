import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  Shield, 
  Users, 
  Globe, 
  ArrowRightLeft,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';

import { TokenCreationForm, DeployedToken } from '@/types/srwa-contracts';
import { RWATemplate } from '@/types/templates';
import { DEFAULT_CLAIM_TOPICS } from '@/types/srwa-contracts';

interface ReviewAndDeployProps {
  formData: TokenCreationForm;
  template: RWATemplate;
  onDeploy: () => void;
  isDeploying: boolean;
  deploymentResult: DeployedToken | null;
  deploymentError: string | null;
}

export default function ReviewAndDeploy({ 
  formData, 
  template, 
  onDeploy, 
  isDeploying, 
  deploymentResult, 
  deploymentError 
}: ReviewAndDeployProps) {
  const [hasConfirmedTerms, setHasConfirmedTerms] = useState(false);
  const [hasConfirmedCompliance, setHasConfirmedCompliance] = useState(false);
  const [hasConfirmedResponsibility, setHasConfirmedResponsibility] = useState(false);

  const getTopicName = (topicId: number): string => {
    const topic = DEFAULT_CLAIM_TOPICS.find(t => t.id === topicId);
    return topic?.name || `Topic ${topicId}`;
  };

  const formatAmount = (amount: string, decimals: number): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    return (num / Math.pow(10, decimals)).toLocaleString();
  };

  const getTotalDistribution = (): string => {
    return formData.initial_distribution
      .reduce((sum, dist) => sum + parseFloat(dist.amount || '0'), 0)
      .toString();
  };

  const canDeploy = hasConfirmedTerms && hasConfirmedCompliance && hasConfirmedResponsibility && !isDeploying;

  const estimatedGas = "~0.5 XLM"; // Mock gas estimation
  const estimatedDeployTime = "2-3 minutes"; // Mock time estimation

  if (deploymentResult) {
    return (
      <div 
        className="space-y-6"
      >
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 mb-2">Deployment Successful!</h2>
          <p className="text-muted-foreground">Your RWA token has been deployed successfully</p>
        </div>

        {/* Contract Addresses */}
        <Card style={{
          backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
          border: '1px solid hsl(222, 23%, 14%)', // stroke-line
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardHeader>
            <CardTitle>Contract Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'SRWA Token', address: deploymentResult.token_address },
              { label: 'Compliance Core', address: deploymentResult.compliance_address },
              { label: 'Identity Registry', address: deploymentResult.identity_registry_address },
              { label: 'Claim Topics Registry', address: deploymentResult.claim_topics_registry_address },
              { label: 'Trusted Issuers Registry', address: deploymentResult.trusted_issuers_reg },
            ].map((contract) => (
              <div key={contract.label} className="flex items-center justify-between p-3 border rounded-lg" style={{ 
                backgroundColor: 'hsl(224, 23%, 10%)', // bg-elev-2
                borderColor: 'hsl(222, 23%, 14%)' // stroke-line
              }}>
                <span className="font-medium">{contract.label}</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
                    color: 'hsl(192, 100%, 66%)', // brand-500
                    border: '1px solid hsl(222, 23%, 14%)' // stroke-line
                  }}>
                    {contract.address}
                  </code>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card style={{
          backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
          border: '1px solid hsl(222, 23%, 14%)', // stroke-line
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Configure trusted issuers for identity verification</li>
              <li>Set up compliance module parameters</li>
              <li>Add initial user claims through the identity registry</li>
              <li>Mint initial token supply to designated addresses</li>
              <li>Test transfer functionality with compliance checks</li>
              {formData.enable_blend_integration && (
                <li>Configure Blend Protocol integration for lending</li>
              )}
              {formData.enable_soroswap_integration && (
                <li>Create liquidity pools on SoroSwap</li>
              )}
            </ol>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button onClick={() => window.location.reload()}>
            Deploy Another Token
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Stellar Expert
          </Button>
          <Button variant="outline">
            Go to Token Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-6"
    >
      {/* Configuration Summary */}
      <Card style={{
        backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
        border: '1px solid hsl(222, 23%, 14%)', // stroke-line
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Configuration Summary</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review your token configuration before deployment
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <div className="w-6 h-6 bg-brand-400/10 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-brand-400">1</span>
              </div>
              Token Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <div className="font-medium">{formData.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Symbol:</span>
                <div className="font-medium">{formData.symbol}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Template:</span>
                <div>
                  <Badge variant="outline">
                    {template.icon} {template.name}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Decimals:</span>
                <div className="font-medium">{formData.decimals}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Admin:</span>
                <div className="font-mono text-xs break-all">{formData.admin}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Compliance Configuration */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <div className="w-6 h-6 bg-green-400/10 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-green-400">2</span>
              </div>
              Compliance & Identity
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Required Claims:</span>
                <div className="flex gap-2 mt-1">
                  {formData.claim_topics.map(topicId => (
                    <Badge key={topicId} variant="outline">
                      {getTopicName(topicId)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Trusted Issuers:</span>
                <div className="text-sm mt-1">
                  {new Set(formData.trusted_issuers.map(i => i.issuer)).size} organizations configured
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <div className="w-6 h-6 bg-purple-400/10 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-purple-400">3</span>
              </div>
              Advanced Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Max Holders:</span>
                <div className="font-medium">
                  {formData.max_holders?.toLocaleString() || 'Unlimited'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Initial Supply:</span>
                <div className="font-medium">
                  {formatAmount(formData.initial_supply || '0', formData.decimals)} tokens
                </div>
              </div>
              {formData.allowed_jurisdictions.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Allowed Jurisdictions:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {formData.allowed_jurisdictions.slice(0, 5).map(code => (
                      <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                    ))}
                    {formData.allowed_jurisdictions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.allowed_jurisdictions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {formData.initial_distribution.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Initial Distribution:</span>
                  <div className="text-sm mt-1">
                    {formData.initial_distribution.length} recipients, {' '}
                    {formatAmount(getTotalDistribution(), formData.decimals)} tokens total
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Integration Settings */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <div className="w-6 h-6 bg-amber-400/10 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-amber-400">4</span>
              </div>
              DeFi Integrations
            </h3>
            <div className="space-y-2">
              {formData.enable_blend_integration ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Blend Protocol integration enabled</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full border-2 border-stroke-line"></div>
                  <span className="text-sm text-muted-foreground">Blend Protocol integration disabled</span>
                </div>
              )}
              
              {formData.enable_soroswap_integration ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">SoroSwap integration enabled</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full border-2 border-stroke-line"></div>
                  <span className="text-sm text-muted-foreground">SoroSwap integration disabled</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Information */}
      <Card style={{
        backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
        border: '1px solid hsl(222, 23%, 14%)', // stroke-line
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <CardHeader>
          <CardTitle>Deployment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Estimated Gas Cost:</span>
              <div className="font-medium text-lg">{estimatedGas}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Estimated Time:</span>
              <div className="font-medium text-lg">{estimatedDeployTime}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Contracts to Deploy:</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                'SRWA Token Contract',
                'Compliance Core',
                'Identity Registry',
                'Identity Storage',
                'Claim Topics Registry',
                'Trusted Issuers Registry',
                'Compliance Modules',
                'Integration Adapters'
              ].map((contract) => (
                <div key={contract} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{contract}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Confirmations */}
      <Card style={{
        backgroundColor: 'hsl(224, 23%, 10%)', // bg-elev-2
        border: '1px solid hsl(45, 100%, 60%)', // warning color
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <CardHeader>
          <CardTitle className="text-amber-400">Important Confirmations</CardTitle>
          <p className="text-sm text-amber-400">
            Please read and confirm the following before deployment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={hasConfirmedTerms}
              onCheckedChange={setHasConfirmedTerms}
              className="mt-1"
            />
            <div className="text-sm">
              <strong>Terms of Service:</strong> I have read and agree to the terms of service and understand 
              that this is experimental software. I acknowledge the risks involved in deploying smart contracts.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              checked={hasConfirmedCompliance}
              onCheckedChange={setHasConfirmedCompliance}
              className="mt-1"
            />
            <div className="text-sm">
              <strong>Regulatory Compliance:</strong> I confirm that I have consulted with legal counsel 
              regarding the regulatory implications of issuing this token and that I will comply with all 
              applicable securities laws and regulations.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              checked={hasConfirmedResponsibility}
              onCheckedChange={setHasConfirmedResponsibility}
              className="mt-1"
            />
            <div className="text-sm">
              <strong>Admin Responsibility:</strong> I understand that I will be the admin of this token 
              with full control over minting, burning, compliance settings, and user management. I will 
              secure my admin private keys appropriately.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {deploymentError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Deployment Failed:</strong> {deploymentError}
          </AlertDescription>
        </Alert>
      )}


      {/* Deployment Progress */}
      {isDeploying && (
        <Card style={{
          backgroundColor: 'hsl(224, 23%, 10%)', // bg-elev-2
          border: '1px solid hsl(192, 100%, 66%)', // brand-500
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-400" />
              <h3 className="font-medium text-brand-400 mb-2">Deploying Your RWA Token</h3>
              <p className="text-sm text-brand-400 mb-4">
                This may take a few minutes. Please don't close this window.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin text-brand-400" />
                  <span>Deploying core contracts...</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 rounded-full border border-stroke-line"></div>
                  <span>Initializing contracts...</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 rounded-full border border-stroke-line"></div>
                  <span>Configuring compliance...</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 rounded-full border border-stroke-line"></div>
                  <span>Setting up integrations...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}