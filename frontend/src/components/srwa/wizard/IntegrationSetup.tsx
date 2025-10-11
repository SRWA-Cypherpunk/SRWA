import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink 
} from 'lucide-react';

import { TokenCreationForm } from '@/types/srwa-contracts';
import { RWATemplate, isIntegrationSupported } from '@/types/templates';

interface IntegrationSetupProps {
  formData: TokenCreationForm;
  template: RWATemplate;
  onChange: (updates: Partial<TokenCreationForm>) => void;
}

export default function IntegrationSetup({ formData, template, onChange }: IntegrationSetupProps) {
  const blendSupported = isIntegrationSupported(template.id, 'blend');
  const soroswapSupported = isIntegrationSupported(template.id, 'soroswap');

  const integrationBenefits = {
    blend: [
      'Use SRWA tokens as collateral for borrowing',
      'Earn yield by supplying tokens to lending pools',
      'Access to institutional DeFi markets',
      'Automated compliance checks on lending'
    ],
    soroswap: [
      'Create liquidity pools for token trading',
      'Enable price discovery for your token',
      'Provide liquidity incentives to holders',
      'Integrate with broader Stellar DeFi ecosystem'
    ]
  };

  const integrationRequirements = {
    blend: [
      'Price oracle configuration required',
      'Collateral factor must be set by Blend team',
      'Minimum liquidity thresholds',
      'Risk assessment by Blend protocol'
    ],
    soroswap: [
      'Initial liquidity provision required',
      'Token must have active price feeds',
      'Compliance with SoroSwap listing requirements',
      'Community governance approval may be needed'
    ]
  };

  return (
    <div 
      className="space-y-6"
    >
      {/* Integration Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <span>DeFi Protocol Integration</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your RWA token with leading DeFi protocols on Stellar for enhanced utility
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">
                {template.supported_integrations.filter(i => i.supported).length}
              </div>
              <div className="text-xs text-muted-foreground">Supported Protocols</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Number(formData.enable_blend_integration) + Number(formData.enable_soroswap_integration)}
              </div>
              <div className="text-xs text-muted-foreground">Integrations Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">2</div>
              <div className="text-xs text-muted-foreground">Configuration Steps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blend Protocol Integration */}
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
        <CardHeader style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <CardTitle style={{ fontSize: '18px', color: '#111827' }}>Blend Protocol</CardTitle>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Lending & borrowing with SRWA tokens as collateral
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 15 }}>
              {blendSupported ? (
                <Badge variant="default">Supported</Badge>
              ) : (
                <Badge variant="secondary">Not Recommended</Badge>
              )}
              <Switch
                checked={formData.enable_blend_integration}
                onCheckedChange={(checked) => onChange({ enable_blend_integration: checked })}
                disabled={!blendSupported}
                style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!blendSupported && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Blend integration is not recommended for {template.name} tokens due to their characteristics.
                Consider other integration options.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Benefits */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                Benefits
              </h4>
              <ul className="text-sm space-y-1">
                {integrationBenefits.blend.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-brand-400" />
                Requirements
              </h4>
              <ul className="text-sm space-y-1">
                {integrationRequirements.blend.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1 h-1 bg-brand-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {formData.enable_blend_integration && (
            <div className="p-4 bg-brand-400/10 border border-brand-400/30 rounded-lg">
              <h4 className="font-medium text-brand-400 mb-2">Post-Deployment Configuration</h4>
              <div className="text-sm text-brand-400 space-y-2">
                <p>After your token is deployed, you'll need to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Submit a listing request to Blend Protocol</li>
                  <li>Provide token economics and risk analysis</li>
                  <li>Configure price oracles (DIA/Reflector)</li>
                  <li>Set collateral factors and risk parameters</li>
                  <li>Test lending/borrowing functionality</li>
                </ol>
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Blend Documentation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SoroSwap Integration */}
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
        <CardHeader style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRightLeft className="h-5 w-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <CardTitle style={{ fontSize: '18px', color: '#111827' }}>SoroSwap</CardTitle>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Decentralized exchange for token trading & liquidity
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 15 }}>
              {soroswapSupported ? (
                <Badge variant="default">Supported</Badge>
              ) : (
                <Badge variant="secondary">Limited Support</Badge>
              )}
              <Switch
                checked={formData.enable_soroswap_integration}
                onCheckedChange={(checked) => onChange({ enable_soroswap_integration: checked })}
                style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!soroswapSupported && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {template.name} tokens may have limited trading functionality on SoroSwap due to compliance requirements.
                Consider regulatory implications before enabling.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Benefits */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                Benefits
              </h4>
              <ul className="text-sm space-y-1">
                {integrationBenefits.soroswap.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-brand-400" />
                Requirements
              </h4>
              <ul className="text-sm space-y-1">
                {integrationRequirements.soroswap.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1 h-1 bg-brand-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {formData.enable_soroswap_integration && (
            <div className="p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg">
              <h4 className="font-medium text-purple-400 mb-2">Post-Deployment Configuration</h4>
              <div className="text-sm text-purple-400 space-y-2">
                <p>After your token is deployed, you'll need to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Create initial liquidity pool (e.g., SRWA/USDC)</li>
                  <li>Provide initial liquidity (recommended: $10k+ value)</li>
                  <li>Configure trading parameters and fees</li>
                  <li>Set up compliance checks for trading</li>
                  <li>Monitor and manage liquidity incentives</li>
                </ol>
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  SoroSwap Documentation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Warnings */}
      {(formData.enable_blend_integration || formData.enable_soroswap_integration) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> DeFi integrations may affect compliance requirements. 
            Ensure your legal team reviews the implications of protocol integrations, 
            especially regarding securities regulations and AML/KYC requirements.
          </AlertDescription>
        </Alert>
      )}

      {/* Oracle Configuration Preview */}
      {(formData.enable_blend_integration || formData.enable_soroswap_integration) && (
        <Card style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardHeader style={{ position: 'relative', zIndex: 10 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#111827' }}>
              <DollarSign className="h-5 w-5" />
              <span>Price Oracle Configuration</span>
            </CardTitle>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Required for DeFi integrations to provide accurate token pricing
            </p>
          </CardHeader>
          <CardContent style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-brand-400" />
                  <span className="font-medium">DIA Oracle</span>
                  <Badge variant="outline">Primary</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Institutional-grade price feeds with 99.9% uptime
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="font-medium">Reflector Oracle</span>
                  <Badge variant="outline">Secondary</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Community-driven oracle network for redundancy
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Oracle configuration will be handled automatically during deployment. 
                Manual configuration may be required for custom pricing models.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Integration Summary */}
      {(formData.enable_blend_integration || formData.enable_soroswap_integration) && (
        <Card style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardHeader>
            <CardTitle className="text-green-400">Integration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.enable_blend_integration && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Blend Protocol integration enabled</span>
                </div>
              )}
              
              {formData.enable_soroswap_integration && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">SoroSwap integration enabled</span>
                </div>
              )}

              <div className="mt-3 p-3 bg-bg-elev-1 border border-green-400/30 rounded">
                <h4 className="font-medium mb-2">Next Steps After Deployment:</h4>
                <ul className="text-sm space-y-1">
                  {formData.enable_blend_integration && (
                    <li>• Configure Blend lending parameters</li>
                  )}
                  {formData.enable_soroswap_integration && (
                    <li>• Create liquidity pools on SoroSwap</li>
                  )}
                  <li>• Set up price oracle feeds</li>
                  <li>• Test integration functionality</li>
                  <li>• Monitor compliance requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Integrations */}
      {!formData.enable_blend_integration && !formData.enable_soroswap_integration && (
        <Card style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '0',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardContent className="text-center py-8">
            <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Integrations Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can always add DeFi integrations later through the token management dashboard.
            </p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                For maximum utility, consider enabling at least one integration. 
                Blend is recommended for most RWA tokens, while SoroSwap is better for liquid trading.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}