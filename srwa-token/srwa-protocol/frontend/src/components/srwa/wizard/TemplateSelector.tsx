import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Star, AlertTriangle } from 'lucide-react';

import { TokenTemplate } from '@/types/srwa-contracts';
import { RWA_TEMPLATES } from '@/types/templates';

interface TemplateSelectorProps {
  selectedTemplate: TokenTemplate;
  onTemplateSelect: (template: TokenTemplate) => void;
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const templates = Object.values(RWA_TEMPLATES);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your RWA Token Type</h3>
        <p className="text-muted-foreground">
          Select a template that best matches your use case. Each template comes with pre-configured compliance and features.
        </p>
      </div>

      <RadioGroup 
        value={selectedTemplate} 
        onValueChange={(value) => onTemplateSelect(value as TokenTemplate)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {templates.map((template) => (
          <div key={template.id} className="relative h-full">
            <RadioGroupItem
              value={template.id}
              id={template.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={template.id}
              className="cursor-pointer block h-full"
            >
              <Card className={`min-h-[520px] h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg' 
                  : 'hover:border-primary/50 hover:bg-primary/5'
              }`}>
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl flex-shrink-0">{template.icon}</div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold leading-tight">{template.name}</CardTitle>
                        {template.id === TokenTemplate.RwaEquity && (
                          <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="w-3 h-3 mr-1 fill-amber-500" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="bg-primary text-white rounded-full p-1.5 flex-shrink-0 shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {template.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col space-y-4">
                  {/* Use Cases */}
                  <div className="flex-shrink-0">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Common Use Cases:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      {template.use_cases.slice(0, 3).map((useCase, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                          <span className="leading-relaxed">{useCase}</span>
                        </li>
                      ))}
                      {template.use_cases.length > 3 && (
                        <li className="text-xs text-muted-foreground/70 italic">
                          +{template.use_cases.length - 3} more use cases
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Key Features */}
                  <div className="flex-shrink-0">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Key Features:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {template.features
                        .filter(f => f.enabled_by_default)
                        .slice(0, 3)
                        .map((feature) => (
                          <Badge key={feature.id} variant="outline" className="text-xs px-2 py-1 bg-primary/10 border-primary/20 text-primary font-medium">
                            {feature.name}
                          </Badge>
                        ))}
                      {template.features.filter(f => f.enabled_by_default).length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                          +{template.features.filter(f => f.enabled_by_default).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="flex-shrink-0">
                    {template.restrictions.length > 0 ? (
                      <>
                        <h4 className="text-sm font-semibold mb-2 flex items-center text-foreground">
                          <AlertTriangle className="w-3 h-3 mr-1.5 text-amber-500" />
                          Key Restrictions:
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1.5">
                          {template.restrictions.slice(0, 2).map((restriction, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                              <span className="leading-relaxed">{restriction.description}</span>
                            </li>
                          ))}
                          {template.restrictions.length > 2 && (
                            <li className="text-xs text-muted-foreground/70 italic">
                              +{template.restrictions.length - 2} more restrictions
                            </li>
                          )}
                        </ul>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold mb-2 flex items-center text-foreground">
                          <Check className="w-3 h-3 mr-1.5 text-green-500" />
                          Key Restrictions:
                        </h4>
                        <p className="text-xs text-muted-foreground italic">Minimal restrictions for maximum flexibility</p>
                      </>
                    )}
                  </div>

                  {/* Supported Integrations */}
                  <div className="flex-shrink-0">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">DeFi Integrations:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {template.supported_integrations.map((integration) => (
                        <Badge
                          key={integration.id}
                          variant={integration.supported ? "default" : "secondary"}
                          className={`text-xs px-2 py-1 ${
                            integration.supported 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {integration.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Configuration Preview */}
                  <div className="pt-3 border-t border-border/50 mt-auto">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Default Configuration:</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Decimals:</span>
                        <div className="font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                          {template.default_config.decimals}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Max Holders:</span>
                        <div className="font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                          {template.default_config.max_holders || 'Unlimited'}
                        </div>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-muted-foreground font-medium">Required Claims:</span>
                        <div className="flex gap-1 flex-wrap">
                          {(template.default_config.claim_topics || []).map((topicId) => {
                            const topicNames = { 1: 'KYC', 2: 'AML', 3: 'Accredited' };
                            return (
                              <Badge key={topicId} variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                {topicNames[topicId as keyof typeof topicNames]}
                              </Badge>
                            );
                          })}
                          {(!template.default_config.claim_topics || template.default_config.claim_topics.length === 0) && (
                            <span className="text-xs text-muted-foreground italic">None required</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Selected template details */}
      {selectedTemplate && (
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="text-xl">{RWA_TEMPLATES[selectedTemplate].icon}</div>
              <div>
                <CardTitle className="text-base">
                  Selected: {RWA_TEMPLATES[selectedTemplate].name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  You can customize all settings in the following steps
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}