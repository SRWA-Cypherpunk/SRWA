import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";
import EnhancedPositionCard from "@/components/portfolio/EnhancedPositionCard";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSRWATokens } from "@/hooks/solana/useSRWATokens";
import { usePurchaseOrders } from "@/hooks/solana/usePurchaseOrders";
import {
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";

export default function Portfolio() {
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Wallet and blockchain hooks
  const { publicKey } = useWallet();
  const { tokens: srwaTokens, loading: tokensLoading } = useSRWATokens();
  const { orders, loading: ordersLoading, getOrdersByInvestor } = usePurchaseOrders();

  // Get orders for current wallet
  const purchaseOrders = useMemo(() => {
    if (!publicKey) return [];
    return getOrdersByInvestor ? getOrdersByInvestor(publicKey) : [];
  }, [publicKey, getOrdersByInvestor]);

  // Transform mock positions to enhanced format
  const enhancedPositions = mockUserPositions.map(pos => ({
    id: pos.marketName,
    marketName: pos.marketName,
    assetClass: pos.marketName.includes('Bill') ? 'T-Bills' :
                pos.marketName.includes('CRI') ? 'Receivables' :
                pos.marketName.includes('Estate') ? 'CRE' : 'T-Bills',
    suppliedAmount: parseFloat(pos.supplied.replace(/[$M,K]/g, '')) * 1000000,
    suppliedValue: parseFloat(pos.supplied.replace(/[$M,K]/g, '')) * 1000000,
    borrowedAmount: parseFloat(pos.borrowed.replace(/[$M,K]/g, '')) * 1000000,
    borrowedValue: parseFloat(pos.borrowed.replace(/[$M,K]/g, '')) * 1000000,
    collateralValue: parseFloat(pos.collateral.replace(/[$M,K]/g, '')) * 1000000,
    supplyAPY: parseFloat(pos.supplyAPY.replace('%', '')),
    borrowAPY: parseFloat(pos.borrowAPY.replace('%', '')),
    netAPY: parseFloat(pos.netAPY.replace('%', '')),
    healthFactor: parseFloat(pos.healthFactor),
    lastUpdated: Date.now() / 1000,
    protocol: 'Blend' as const,
    unrealizedPL: Math.random() * 10000 - 2000, // Mock P&L
    plPercentage: Math.random() * 10 - 2 // Mock percentage
  }));

  const handleRefresh = () => {
    // Refresh logic here
    console.log('Refreshing portfolio data...');
  };

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-primary">Portfolio</h1>
            <p className="text-lg text-muted mt-1">
              Manage your RWA investments and lending positions
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-glass border-glass hover:bg-elev-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <PortfolioOverview
              userAddress={publicKey?.toString()}
              positions={enhancedPositions}
              srwaTokens={srwaTokens || []}
              purchaseOrders={purchaseOrders || []}
            />
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            {/* Positions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-glass backdrop-blur-md border-glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">Active Positions</p>
                    <p className="text-2xl font-bold text-primary">
                      {enhancedPositions.length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-primary opacity-50" />
                </div>
              </Card>
              <Card className="bg-glass backdrop-blur-md border-glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">At Risk</p>
                    <p className="text-2xl font-bold text-warning">
                      {enhancedPositions.filter(p => p.healthFactor < 1.5).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-warning opacity-50" />
                </div>
              </Card>
              <Card className="bg-glass backdrop-blur-md border-glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">Total Net Value</p>
                    <p className="text-2xl font-bold text-secondary">
                      ${((enhancedPositions.reduce((sum, p) =>
                        sum + p.suppliedValue - p.borrowedValue, 0
                      )) / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-secondary opacity-50" />
                </div>
              </Card>
            </div>

            {/* Enhanced Position Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enhancedPositions.map((position, index) => (
                <div
                  key={position.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EnhancedPositionCard
                    position={position}
                    onSupply={() => console.log('Supply', position.id)}
                    onWithdraw={() => console.log('Withdraw', position.id)}
                    onBorrow={() => console.log('Borrow', position.id)}
                    onRepay={() => console.log('Repay', position.id)}
                    onManage={() => setSelectedPosition(mockUserPositions.find(p => p.marketName === position.marketName) || null)}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {enhancedPositions.length === 0 && (
              <Card className="bg-elev-1 border-border-primary p-12 text-center">
                <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  No Active Positions
                </h3>
                <p className="text-muted mb-6">
                  Start by supplying assets to a lending pool or purchasing RWA tokens
                </p>
                <Button
                  onClick={() => window.location.href = '/markets'}
                  className="bg-gradient-primary"
                >
                  Explore Markets
                </Button>
              </Card>
            )}
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