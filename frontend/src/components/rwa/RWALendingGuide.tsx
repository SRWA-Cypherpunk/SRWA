import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight,
  TrendingDown,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';

export const RWALendingGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-h2 font-semibold text-fg-primary flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-400" />
          How to Use RWA Lending
        </h2>
        <p className="text-body-2 text-fg-muted max-w-2xl mx-auto">
          Your step-by-step guide to earning yield and borrowing with Real World Asset tokens
        </p>
      </div>

      {/* Quick Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supply/Lending */}
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <ArrowUpRight className="w-5 h-5" />
              Supply & Earn Yield
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-green-400">1</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Create RWA Tokens</p>
                  <p className="text-sm text-fg-muted">Use the Token Wizard to deploy your SRWA tokens</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-green-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Choose a Pool</p>
                  <p className="text-sm text-fg-muted">Select from RWA-friendly lending pools</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-green-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Supply Tokens</p>
                  <p className="text-sm text-fg-muted">Approve and supply your RWA tokens to earn APY</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Expected Returns</span>
              </div>
              <p className="text-sm text-fg-muted">
                Earn <strong className="text-green-400">3-8% APY</strong> on your RWA tokens with automatic compounding
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Borrow/Collateral */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <TrendingDown className="w-5 h-5" />
              Borrow with Collateral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-400">1</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Supply as Collateral</p>
                  <p className="text-sm text-fg-muted">First supply your RWA tokens to the pool</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Choose Asset to Borrow</p>
                  <p className="text-sm text-fg-muted">Select XLM, USDC, BTC or other supported assets</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-fg-primary">Borrow & Monitor</p>
                  <p className="text-sm text-fg-muted">Borrow up to your collateral limit and watch health factor</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Collateral Ratio</span>
              </div>
              <p className="text-sm text-fg-muted">
                Maintain health factor <strong className="text-blue-400">&gt; 1.2</strong> to avoid liquidation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-brand-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="font-semibold mb-1">Instant Approval</h3>
            <p className="text-sm text-fg-muted">One-click token approval for lending pools</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-1">Competitive Rates</h3>
            <p className="text-sm text-fg-muted">Earn competitive APY on your RWA holdings</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-1">Community Pools</h3>
            <p className="text-sm text-fg-muted">Join pools with other RWA token holders</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold mb-1">Compliance Ready</h3>
            <p className="text-sm text-fg-muted">Built-in compliance for regulatory tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-400 mb-2">Risk Considerations</h3>
                <ul className="space-y-1 text-sm text-fg-muted">
                  <li>• Monitor your health factor to avoid liquidation</li>
                  <li>• Interest rates can fluctuate based on utilization</li>
                  <li>• Smart contract risks apply to all DeFi protocols</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Getting Started</h3>
                <ul className="space-y-1 text-sm text-fg-muted">
                  <li>• Connect your Freighter wallet</li>
                  <li>• Ensure you have testnet XLM for transactions</li>
                  <li>• Create your first RWA token if you haven't already</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Indicators */}
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Ready to Start Lending!</h3>
          </div>
          <p className="text-fg-muted mb-4">
            You now have everything you need to start earning with your RWA tokens or use them as collateral.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Start Supplying
            </Button>
            <Button variant="outline">
              <TrendingDown className="w-4 h-4 mr-2" />
              Explore Borrowing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
