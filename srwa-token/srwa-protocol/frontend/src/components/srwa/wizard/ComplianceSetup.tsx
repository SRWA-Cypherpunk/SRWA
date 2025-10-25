import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Lock, 
  Globe, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Info,
  CheckCircle 
} from 'lucide-react';

import { TokenCreationForm, TrustedIssuer } from '@/types/srwa-contracts';
import { RWATemplate } from '@/types/templates';
import { DEFAULT_CLAIM_TOPICS } from '@/types/srwa-contracts';

interface ComplianceSetupProps {
  formData: TokenCreationForm;
  template: RWATemplate;
  onChange: (updates: Partial<TokenCreationForm>) => void;
}

export default function ComplianceSetup({ formData, template, onChange }: ComplianceSetupProps) {
  const [newIssuerAddress, setNewIssuerAddress] = useState('');
  const [selectedIssuerTopics, setSelectedIssuerTopics] = useState<number[]>([]);

  const complianceConfig = template.compliance_config;

  // Auto-select required claim topics when template changes
  useEffect(() => {
    const requiredTopics = getRequiredTopicsForTemplate();
    const currentTopics = formData.claim_topics;
    const missingRequired = requiredTopics.filter(id => !currentTopics.includes(id));
    
    if (missingRequired.length > 0) {
      console.log('🔧 [ComplianceSetup] Auto-selecting missing required topics:', missingRequired);
      onChange({ 
        claim_topics: [...currentTopics, ...missingRequired] 
      });
    }
  }, [template.id, formData.claim_topics, onChange]);

  const handleClaimTopicToggle = (topicId: number, checked: boolean) => {
    const updatedTopics = checked
      ? [...formData.claim_topics, topicId]
      : formData.claim_topics.filter(id => id !== topicId);
    
    onChange({ claim_topics: updatedTopics });
  };

  const addTrustedIssuer = () => {
    if (!newIssuerAddress || selectedIssuerTopics.length === 0) return;
    
    const newIssuers = selectedIssuerTopics.map(topicId => ({
      issuer: newIssuerAddress,
      topic_id: topicId,
    }));
    
    onChange({
      trusted_issuers: [...formData.trusted_issuers, ...newIssuers]
    });
    
    setNewIssuerAddress('');
    setSelectedIssuerTopics([]);
  };

  const removeTrustedIssuer = (index: number) => {
    const updatedIssuers = formData.trusted_issuers.filter((_, i) => i !== index);
    onChange({ trusted_issuers: updatedIssuers });
  };

  const getTopicName = (topicId: number): string => {
    const topic = DEFAULT_CLAIM_TOPICS.find(t => t.id === topicId);
    return topic?.name || `Topic ${topicId}`;
  };

  const getRequiredTopicsForTemplate = (): number[] => {
    return template.default_config.claim_topics || [];
  };

  const getMissingRequiredTopics = (): number[] => {
    const required = getRequiredTopicsForTemplate();
    return required.filter(topicId => !formData.claim_topics.includes(topicId));
  };

  const getTopicsWithoutIssuers = (): number[] => {
    const issuedTopics = new Set(formData.trusted_issuers.map(i => i.topic_id));
    return formData.claim_topics.filter(topicId => !issuedTopics.has(topicId));
  };

  return (
    <div 
      className="space-y-6"
    >
      {/* Template Compliance Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Compliance Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure identity verification and compliance requirements
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.values(complianceConfig.modules).filter(m => m?.enabled).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">
                {formData.claim_topics.length}
              </div>
              <div className="text-xs text-muted-foreground">Required Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {new Set(formData.trusted_issuers.map(i => i.issuer)).size}
              </div>
              <div className="text-xs text-muted-foreground">Trusted Issuers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {getTopicsWithoutIssuers().length}
              </div>
              <div className="text-xs text-muted-foreground">Missing Issuers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Topics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Required Identity Claims</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select which identity verifications users must have to hold or transfer tokens
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEFAULT_CLAIM_TOPICS.map((topic) => {
            const isRequired = getRequiredTopicsForTemplate().includes(topic.id);
            const isSelected = formData.claim_topics.includes(topic.id);
            
            return (
              <div
                key={topic.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isRequired ? 'bg-brand-500/10 border-brand-500/30' : 'bg-bg-elev-1 border-stroke-line'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleClaimTopicToggle(topic.id, checked as boolean)
                    }
                    disabled={isRequired}
                    style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{topic.name}</span>
                      {isRequired && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {getMissingRequiredTopics().length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This template requires the following claim topics: {' '}
                {getMissingRequiredTopics().map(getTopicName).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Trusted Issuers Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Trusted Identity Issuers</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add organizations authorized to issue identity claims for your token
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Issuer */}
          <div className="space-y-4 p-4 border rounded-lg bg-bg-elev-1 border-stroke-line">
            <h4 className="font-medium">Add Trusted Issuer</h4>
            
            <div className="space-y-2">
              <Label>Issuer Address</Label>
              <Input
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={newIssuerAddress}
                onChange={(e) => setNewIssuerAddress(e.target.value)}
                style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
              />
            </div>

            <div className="space-y-2">
              <Label>Authorized Claim Topics</Label>
              <div className="grid grid-cols-2 gap-2">
                {formData.claim_topics.map((topicId) => (
                  <div key={topicId} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedIssuerTopics.includes(topicId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIssuerTopics([...selectedIssuerTopics, topicId]);
                        } else {
                          setSelectedIssuerTopics(selectedIssuerTopics.filter(id => id !== topicId));
                        }
                      }}
                      style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
                    />
                    <span className="text-sm">{getTopicName(topicId)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={addTrustedIssuer}
              disabled={!newIssuerAddress || selectedIssuerTopics.length === 0}
              className="w-full"
              style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trusted Issuer
            </Button>
          </div>

          {/* Current Trusted Issuers */}
          {formData.trusted_issuers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Current Trusted Issuers</h4>
              {formData.trusted_issuers.map((issuer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {issuer.issuer}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Authorized for: {getTopicName(issuer.topic_id)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrustedIssuer(index)}
                    className="text-destructive hover:text-destructive"
                    style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Warning for missing issuers */}
          {getTopicsWithoutIssuers().length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The following claim topics don't have trusted issuers yet: {' '}
                {getTopicsWithoutIssuers().map(getTopicName).join(', ')}. 
                Users won't be able to obtain these claims until you add issuers.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Compliance Modules Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Compliance Modules</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preview of compliance modules that will be enabled based on your template
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {/* Jurisdiction Module */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-brand-400" />
                <div>
                  <div className="font-medium">Jurisdiction Control</div>
                  <div className="text-sm text-muted-foreground">
                    Control which countries can hold tokens
                  </div>
                </div>
              </div>
              <Badge variant={complianceConfig.modules.jurisdiction?.enabled ? "default" : "secondary"}>
                {complianceConfig.modules.jurisdiction?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {/* Max Holders Module */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium">Maximum Holders</div>
                  <div className="text-sm text-muted-foreground">
                    Limit the total number of token holders
                  </div>
                </div>
              </div>
              <Badge variant={complianceConfig.modules.max_holders?.enabled ? "default" : "secondary"}>
                {complianceConfig.modules.max_holders?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {/* Pause/Freeze Module */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-red-400" />
                <div>
                  <div className="font-medium">Pause & Freeze</div>
                  <div className="text-sm text-muted-foreground">
                    Emergency controls for transfers
                  </div>
                </div>
              </div>
              <Badge variant={complianceConfig.modules.pause_freeze?.enabled ? "default" : "secondary"}>
                {complianceConfig.modules.pause_freeze?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {/* Sanctions Module */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <div>
                  <div className="font-medium">Sanctions Screening</div>
                  <div className="text-sm text-muted-foreground">
                    Check against sanctions lists
                  </div>
                </div>
              </div>
              <Badge variant={complianceConfig.modules.sanctions?.enabled ? "default" : "secondary"}>
                {complianceConfig.modules.sanctions?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These modules can be further configured in the Advanced Settings step. 
              The current settings are optimized for {template.name}.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Compliance Status Summary */}
      {formData.claim_topics.length > 0 && (
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
          <CardHeader>
            <CardTitle className="text-green-400">Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent>
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

              {getTopicsWithoutIssuers().length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You still need to add trusted issuers for: {getTopicsWithoutIssuers().map(getTopicName).join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}