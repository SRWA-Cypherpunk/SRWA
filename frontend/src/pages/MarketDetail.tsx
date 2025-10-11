import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockMarkets, mockPositions, type RWAMarket } from "@/lib/mock-data";
import { ArrowLeft, DollarSign, TrendingUp, Shield, AlertTriangle, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function MarketDetail() {
  const { id } = useParams();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  
  const market = mockMarkets.find(m => m.id === id);
  
  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-7xl px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-h1 text-fg-primary mb-2">Market Not Found</h1>
            <p className="text-body-1 text-fg-muted">The requested market could not be found.</p>
            <Link to="/markets" className="inline-block mt-4">
              <Button>Back to Markets</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSupply = () => {
    toast({
      title: "Supply Submitted",
      description: `Supplying ${supplyAmount} ${market.assetSymbol} to ${market.name}`,
    });
    setIsSupplyDialogOpen(false);
    setSupplyAmount("");
  };

  const handleBorrow = () => {
    toast({
      title: "Borrow Request Submitted",
      description: `Borrowing ${borrowAmount} ${market.assetSymbol} from ${market.name}`,
    });
    setIsBorrowDialogOpen(false);
    setBorrowAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body-2 text-fg-muted animate-fade-in">
          <Link to="/markets" className="hover:text-fg-secondary transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-fg-primary">{market.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link to="/markets">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-h1 font-semibold text-fg-primary">{market.name}</h1>
              {market.isPermissioned && (
                <Badge variant="secondary" className="text-micro">
                  Permissioned
                </Badge>
              )}
            </div>
            <p className="text-body-1 text-fg-secondary">
              {market.description}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Supply
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-bg-elev-1 border-stroke-line">
                <DialogHeader>
                  <DialogTitle className="text-fg-primary">Supply {market.assetSymbol}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="supply-amount" className="text-fg-secondary">Amount</Label>
                    <Input
                      id="supply-amount"
                      placeholder="0.00"
                      value={supplyAmount}
                      onChange={(e) => setSupplyAmount(e.target.value)}
                      className="input-institutional"
                    />
                    <p className="text-micro text-fg-muted">
                      Available: 1,000.00 {market.assetSymbol}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-micro">
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Supply APY:</span>
                      <span className="text-brand-400 font-medium">{market.supplyApy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Min Investment:</span>
                      <span className="text-fg-secondary">{market.minInvestment}</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleSupply} className="w-full btn-primary">
                    Confirm Supply
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Minus className="h-4 w-4 mr-2" />
                  Borrow
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-bg-elev-1 border-stroke-line">
                <DialogHeader>
                  <DialogTitle className="text-fg-primary">Borrow {market.assetSymbol}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="borrow-amount" className="text-fg-secondary">Amount</Label>
                    <Input
                      id="borrow-amount"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="input-institutional"
                    />
                    <p className="text-micro text-fg-muted">
                      Max available: 500.00 {market.assetSymbol}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-micro">
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Borrow APY:</span>
                      <span className="text-fg-primary font-medium">{market.borrowApy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">LLTV:</span>
                      <span className="text-fg-secondary">{market.lltv}</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleBorrow} className="w-full btn-primary">
                    Confirm Borrow
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <KPICard
            title="Total Supply"
            value={market.totalSupply}
            icon={DollarSign}
            trend="up"
            trendValue="+5.2%"
          />
          <KPICard
            title="Utilization Rate"
            value={market.utilization}
            icon={TrendingUp}
            trend="neutral"
            trendValue="Stable"
          />
          <KPICard
            title="LLTV"
            value={market.lltv}
            icon={Shield}
            subtitle="Loan-to-Value"
          />
          <KPICard
            title="Risk Premium"
            value={market.riskPremium}
            icon={AlertTriangle}
            trend="down"
            trendValue="-0.1%"
          />
        </div>

        {/* Market Details */}
        <Card className="card-institutional animate-fade-in">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-bg-elev-2 border-stroke-line p-6">
                  <h3 className="text-h3 font-medium text-fg-primary mb-4">Market Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Supply APY</span>
                      <span className="text-body-2 text-brand-400 font-semibold tabular-nums">{market.supplyApy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Borrow APY</span>
                      <span className="text-body-2 text-fg-primary font-semibold tabular-nums">{market.borrowApy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Total Supply</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">{market.totalSupply}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Available Liquidity</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">$4.2M</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-bg-elev-2 border-stroke-line p-6">
                  <h3 className="text-h3 font-medium text-fg-primary mb-4">Risk Parameters</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">LLTV</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">{market.lltv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Risk Premium</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">{market.riskPremium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Liquidation Threshold</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-2 text-fg-muted">Reserve Factor</span>
                      <span className="text-body-2 text-fg-secondary tabular-nums">10%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">APY</TableHead>
                    <TableHead className="text-right">Health Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPositions.map((position) => (
                    <TableRow key={position.id} className="hover:bg-bg-elev-2/50">
                      <TableCell className="font-mono text-micro">{position.userAddress.slice(0, 8)}...{position.userAddress.slice(-6)}</TableCell>
                      <TableCell>
                        <Badge variant={position.type === "supply" ? "default" : "secondary"}>
                          {position.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{position.amount}</TableCell>
                      <TableCell className="text-right tabular-nums">{position.apy}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className={position.healthFactor > 1.5 ? "text-green-400" : 
                                       position.healthFactor > 1.2 ? "text-amber-400" : "text-red-400"}>
                          {position.healthFactor.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <Card className="bg-bg-elev-2 border-stroke-line p-6">
                <h3 className="text-h3 font-medium text-fg-primary mb-4">Market Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-body-1 font-medium text-fg-secondary">Asset Details</h4>
                    <div className="space-y-2 text-body-2">
                      <div className="flex justify-between">
                        <span className="text-fg-muted">Asset Symbol</span>
                        <span className="text-fg-primary">{market.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fg-muted">Category</span>
                        <span className="text-fg-primary capitalize">{market.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fg-muted">Min Investment</span>
                        <span className="text-fg-primary">{market.minInvestment}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-body-1 font-medium text-fg-secondary">Risk Settings</h4>
                    <div className="space-y-2 text-body-2">
                      <div className="flex justify-between">
                        <span className="text-fg-muted">LLTV</span>
                        <span className="text-fg-primary">{market.lltv}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fg-muted">Risk Premium</span>
                        <span className="text-fg-primary">{market.riskPremium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fg-muted">Permissioned</span>
                        <span className="text-fg-primary">{market.isPermissioned ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}