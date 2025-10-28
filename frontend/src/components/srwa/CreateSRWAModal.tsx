import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Building2,
  DollarSign,
  Shield,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface CreateSRWAModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSRWAModal({ open, onClose }: CreateSRWAModalProps) {
  const [activeTab, setActiveTab] = useState('asset');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Asset Details
    assetType: '',
    assetName: '',
    assetSymbol: '',
    assetDescription: '',
    // Financial Details
    totalValue: '',
    minimumInvestment: '',
    expectedYield: '',
    maturityDate: '',
    // Compliance
    kycRequired: true,
    accreditedOnly: false,
    jurisdiction: '',
    regulatoryFramework: '',
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className={cn(
            "max-w-2xl max-h-[90vh] overflow-y-auto",
            "bg-gradient-to-b from-bg-elev-1 to-bg-elev-2",
            "border border-brand-500/30",
            "shadow-2xl shadow-brand-500/20",
          )}>
            {/* Gradient Border Effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-30"
              style={{
                background: 'linear-gradient(135deg, #9945FF 0%, #FF6B35 100%)',
                padding: '1px',
                content: '""',
                zIndex: -1,
                borderRadius: 'inherit',
                maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              }}
            />

            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-transparent">
                Create Your SRWA Token
              </DialogTitle>
              <DialogDescription className="text-fg-secondary">
                Tokenize real-world assets on Solana with compliance and transparency
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-bg-elev-2">
                <TabsTrigger
                  value="asset"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Asset Details
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financial
                </TabsTrigger>
                <TabsTrigger
                  value="compliance"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Compliance
                </TabsTrigger>
              </TabsList>

              {/* Asset Details Tab */}
              <TabsContent value="asset" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type</Label>
                  <Select
                    value={formData.assetType}
                    onValueChange={(value) => setFormData({...formData, assetType: value})}
                  >
                    <SelectTrigger className="bg-bg-elev-2 border-brand-500/30">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elev-2 border-brand-500/30">
                      <SelectItem value="t-bills">Treasury Bills</SelectItem>
                      <SelectItem value="receivables">Trade Receivables</SelectItem>
                      <SelectItem value="real-estate">Commercial Real Estate</SelectItem>
                      <SelectItem value="debentures">Corporate Debentures</SelectItem>
                      <SelectItem value="carbon">Carbon Credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    placeholder="e.g., US Treasury Bills Q1 2025"
                    value={formData.assetName}
                    onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                    className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetSymbol">Token Symbol</Label>
                  <Input
                    id="assetSymbol"
                    placeholder="e.g., USTB-Q1"
                    maxLength={10}
                    value={formData.assetSymbol}
                    onChange={(e) => setFormData({...formData, assetSymbol: e.target.value.toUpperCase()})}
                    className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetDescription">Description</Label>
                  <Textarea
                    id="assetDescription"
                    placeholder="Describe the asset, its backing, and investment thesis..."
                    rows={4}
                    value={formData.assetDescription}
                    onChange={(e) => setFormData({...formData, assetDescription: e.target.value})}
                    className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400 resize-none"
                  />
                </div>

                {/* Info Card */}
                <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-fg-secondary">
                      <p className="font-semibold text-brand-400 mb-1">Asset Verification Required</p>
                      <p>All assets must undergo verification including proof of ownership, valuation reports, and legal documentation.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalValue">Total Value (USD)</Label>
                    <Input
                      id="totalValue"
                      type="number"
                      placeholder="1000000"
                      value={formData.totalValue}
                      onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                      className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumInvestment">Minimum Investment</Label>
                    <Input
                      id="minimumInvestment"
                      type="number"
                      placeholder="100"
                      value={formData.minimumInvestment}
                      onChange={(e) => setFormData({...formData, minimumInvestment: e.target.value})}
                      className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedYield">Expected Yield (APY %)</Label>
                    <Input
                      id="expectedYield"
                      type="number"
                      step="0.01"
                      placeholder="4.5"
                      value={formData.expectedYield}
                      onChange={(e) => setFormData({...formData, expectedYield: e.target.value})}
                      className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maturityDate">Maturity Date</Label>
                    <Input
                      id="maturityDate"
                      type="date"
                      value={formData.maturityDate}
                      onChange={(e) => setFormData({...formData, maturityDate: e.target.value})}
                      className="bg-bg-elev-2 border-brand-500/30 focus:border-brand-400"
                    />
                  </div>
                </div>

                {/* Yield Preview Card */}
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-brand-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-fg-secondary mb-1">Projected Annual Return</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${formData.totalValue && formData.expectedYield
                          ? ((parseFloat(formData.totalValue) * parseFloat(formData.expectedYield)) / 100).toLocaleString()
                          : '0'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-fg-secondary mb-1">Yield to Investors</p>
                      <p className="text-xl font-semibold text-brand-400">
                        {formData.expectedYield || '0'}% APY
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bg-elev-2 rounded-lg border border-brand-500/30">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-brand-400" />
                      <div>
                        <p className="font-semibold">KYC Required</p>
                        <p className="text-sm text-fg-secondary">Investors must complete identity verification</p>
                      </div>
                    </div>
                    <Button
                      variant={formData.kycRequired ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({...formData, kycRequired: !formData.kycRequired})}
                      className={formData.kycRequired ? "bg-brand-500" : ""}
                    >
                      {formData.kycRequired ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bg-elev-2 rounded-lg border border-brand-500/30">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="font-semibold">Accredited Investors Only</p>
                        <p className="text-sm text-fg-secondary">Restrict to qualified investors</p>
                      </div>
                    </div>
                    <Button
                      variant={formData.accreditedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({...formData, accreditedOnly: !formData.accreditedOnly})}
                      className={formData.accreditedOnly ? "bg-orange-500" : ""}
                    >
                      {formData.accreditedOnly ? "Required" : "Not Required"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select
                    value={formData.jurisdiction}
                    onValueChange={(value) => setFormData({...formData, jurisdiction: value})}
                  >
                    <SelectTrigger className="bg-bg-elev-2 border-brand-500/30">
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elev-2 border-brand-500/30">
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="ch">Switzerland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatoryFramework">Regulatory Framework</Label>
                  <Select
                    value={formData.regulatoryFramework}
                    onValueChange={(value) => setFormData({...formData, regulatoryFramework: value})}
                  >
                    <SelectTrigger className="bg-bg-elev-2 border-brand-500/30">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elev-2 border-brand-500/30">
                      <SelectItem value="reg-d">Reg D (506c)</SelectItem>
                      <SelectItem value="reg-s">Reg S</SelectItem>
                      <SelectItem value="reg-a">Reg A+</SelectItem>
                      <SelectItem value="mifid">MiFID II</SelectItem>
                      <SelectItem value="prospectus">Prospectus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-brand-500/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.assetName || !formData.assetSymbol}
                className="bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 hover:from-brand-500 hover:to-orange-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create SRWA Token
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}