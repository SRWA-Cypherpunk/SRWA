import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Plus,
  Minus
} from "lucide-react";

export default function Portfolio() {
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);

  // Calculate portfolio totals
  const totalSupplied = mockUserPositions.reduce((acc, pos) => 
    acc + parseFloat(pos.supplied.replace(/[$M,K]/g, '')), 0
  );
  const totalBorrowed = mockUserPositions.reduce((acc, pos) => 
    acc + parseFloat(pos.borrowed.replace(/[$M,K]/g, '')), 0
  );
  const avgHealthFactor = mockUserPositions.reduce((acc, pos) => 
    acc + parseFloat(pos.healthFactor), 0
  ) / mockUserPositions.length;
  const netApy = "3.78%"; // Calculated weighted average

  const getHealthFactorColor = (hf: string) => {
    const value = parseFloat(hf);
    if (value >= 2.0) return "text-emerald-400";
    if (value >= 1.5) return "text-amber-400";
    return "text-red-400";
  };

  const getHealthFactorStatus = (hf: string) => {
    const value = parseFloat(hf);
    if (value >= 2.0) return "Healthy";
    if (value >= 1.5) return "Moderate";
    return "At Risk";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-h1 font-semibold text-fg-primary">Portfolio</h1>
          <p className="text-body-1 text-fg-secondary">
            Monitor your RWA lending positions, health factors, and performance metrics.
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <KPICard
            title="Total Supplied"
            value={`$${totalSupplied.toFixed(1)}M`}
            icon={DollarSign}
            trend="up"
            trendValue="+5.2%"
          />
          <KPICard
            title="Total Borrowed"
            value={`$${totalBorrowed.toFixed(1)}M`}
            icon={TrendingUp}
            subtitle="Active positions"
          />
          <KPICard
            title="Net APY"
            value={netApy}
            icon={BarChart3}
            trend="up"
            trendValue="+0.15%"
          />
          <KPICard
            title="Avg Health Factor"
            value={avgHealthFactor.toFixed(2)}
            icon={Shield}
            trend="neutral"
            trendValue="Stable"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockUserPositions.map((position, index) => (
                <Card key={position.marketId} className="card-institutional hover-lift animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-h3 font-semibold text-fg-primary">
                          {position.marketName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getHealthFactorColor(position.healthFactor)}
                          >
                            HF: {position.healthFactor}
                          </Badge>
                          <span className="text-micro text-fg-muted">
                            {getHealthFactorStatus(position.healthFactor)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedPosition(position)}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Position Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-micro text-fg-muted uppercase tracking-wide">Supplied</p>
                          <p className="text-body-1 font-semibold text-fg-primary tabular-nums">
                            {position.supplied}
                          </p>
                        </div>
                        <div>
                          <p className="text-micro text-fg-muted uppercase tracking-wide">Collateral Value</p>
                          <p className="text-body-2 text-fg-secondary tabular-nums">
                            {position.collateralValue}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-micro text-fg-muted uppercase tracking-wide">Borrowed</p>
                          <p className="text-body-1 font-semibold text-fg-primary tabular-nums">
                            {position.borrowed}
                          </p>
                        </div>
                        <div>
                          <p className="text-micro text-fg-muted uppercase tracking-wide">Net APY</p>
                          <p className="text-body-2 text-brand-400 font-medium tabular-nums">
                            {position.netApy}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Health Factor Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-micro text-fg-muted">Health Factor</span>
                        <span className={`text-micro font-medium ${getHealthFactorColor(position.healthFactor)}`}>
                          {position.healthFactor}
                        </span>
                      </div>
                      <div className="w-full bg-bg-elev-2 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            parseFloat(position.healthFactor) >= 2.0 ? 'bg-emerald-400' :
                            parseFloat(position.healthFactor) >= 1.5 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ 
                            width: `${Math.min((parseFloat(position.healthFactor) / 3) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Supply
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Minus className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Risk Alerts */}
            <Card className="card-institutional">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-h3 font-semibold text-fg-primary">Risk Management</h3>
                  <p className="text-body-2 text-fg-secondary">
                    Monitor health factors closely. Consider adding collateral or reducing borrowed amounts 
                    when health factor approaches 1.5.
                  </p>
                  <Button variant="outline" size="sm">
                    View Risk Guidelines
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="card-institutional">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                <h3 className="text-h3 text-fg-primary mb-2">Transaction History</h3>
                <p className="text-body-2 text-fg-muted mb-6">
                  Your transaction history will appear here as you interact with markets.
                </p>
                <Button variant="outline">
                  View All Transactions
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-institutional">
                <div className="space-y-4">
                  <h3 className="text-h3 font-semibold text-fg-primary">Performance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Total Returns (30d)</span>
                      <span className="text-body-2 font-semibold text-emerald-400">+$24,580</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Interest Earned</span>
                      <span className="text-body-2 font-semibold text-fg-primary">$18,950</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Interest Paid</span>
                      <span className="text-body-2 font-semibold text-fg-primary">$5,630</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="card-institutional">
                <div className="space-y-4">
                  <h3 className="text-h3 font-semibold text-fg-primary">Risk Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Portfolio Health</span>
                      <span className="text-body-2 font-semibold text-emerald-400">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Liquidation Risk</span>
                      <span className="text-body-2 font-semibold text-fg-primary">Low</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-2 text-fg-secondary">Diversification Score</span>
                      <span className="text-body-2 font-semibold text-brand-400">8.5/10</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}