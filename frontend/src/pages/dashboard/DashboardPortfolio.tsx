import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { DashboardLayout, DashboardSection } from "@/components/layout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DeployedTokensGrid } from '@/components/srwa/DeployedTokensGrid';
import { mockUserPositions, type UserPosition } from "@/lib/mock-data";

// Hooks
import { useWallet } from '@/contexts/wallet/WalletContext';
import { useWalletAssets } from '@/hooks/wallet/useWalletAssets';
import { useUserBlendPositions, formatPositionValue } from '@/hooks/markets/useUserBlendPositions';

// Icons
import {
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Plus,
  Wallet,
  ArrowRight
} from "lucide-react";

// Function to get user positions based on wallet address
const getUserPositions = (address: string): UserPosition[] => {
  if (!address) return [];
  // For now, return mock data. In the future, this would query the blockchain
  // using the user's address to get actual positions
  return mockUserPositions;
};

export default function DashboardPortfolio() {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);

  // Wallet connection
  const { isConnected, address, connect, isConnecting } = useWallet();

  // Real wallet data hooks
  const walletAssets = useWalletAssets();
  const blendPositions = useUserBlendPositions();

  // User positions based on connected wallet
  const userPositions = isConnected && blendPositions.positions.length > 0
    ? blendPositions.positions.map(pos => ({
        marketId: pos.poolAddress,
        marketName: pos.poolName,
        supplied: formatPositionValue(pos.suppliedValue),
        borrowed: formatPositionValue(pos.borrowedValue),
        healthFactor: pos.healthFactor.toFixed(2),
        netApy: (pos.supplyAPY * 100).toFixed(2) + '%',
        collateralValue: formatPositionValue(pos.collateralValue)
      }))
    : getUserPositions(address);

  // Portfolio calculations based on real wallet data
  const totalSupplied = isConnected && blendPositions.summary
    ? blendPositions.summary.totalSupplied / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.supplied.replace(/[$M,K]/g, '')), 0);

  const totalBorrowed = isConnected && blendPositions.summary
    ? blendPositions.summary.totalBorrowed / 1000000 // Convert to millions
    : userPositions.reduce((acc, pos) => acc + parseFloat(pos.borrowed.replace(/[$M,K]/g, '')), 0);

  const avgHealthFactor = isConnected && blendPositions.summary
    ? blendPositions.summary.averageHealthFactor
    : userPositions.length > 0
      ? userPositions.reduce((acc, pos) => acc + parseFloat(pos.healthFactor), 0) / userPositions.length
      : 0;

  const netApy = isConnected && blendPositions.summary
    ? (blendPositions.summary.netAPY * 100).toFixed(2) + '%'
    : "3.78%";

  return (
    <DashboardLayout>

          {/* Header with Create SRWA Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Portfolio Management
              </h1>
              <p className="text-base sm:text-lg text-fg-secondary mt-2">
                Monitor your RWA lending positions and health factors
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <HeroButton
                onClick={() => window.location.href = '/srwa-issuance'}
                variant="brand"
                className="w-full sm:w-auto"
                icon={<Plus className="h-4 w-4" />}
              >
                Create SRWA
              </HeroButton>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <DashboardNav />

          {/* Portfolio Tab Content */}
          <DashboardSection
            title={
              <>
                Your Portfolio Overview
                <span className="inline-block ml-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 inline" />
                </span>
              </>
            }
            description="Track your lending positions, yields, and portfolio health in real-time"
            decorativeColor="orange"
            className="dashboard-portfolio-tab"
          >

              {/* Wallet Connection Check */}
              {!isConnected ? (
                <div className="flex justify-center">
                  <div className="card-institutional max-w-md w-full rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="text-center space-y-6 p-6 sm:p-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 mx-auto border border-brand-500/20">
                        <Wallet className="h-8 w-8 text-brand-400" />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-fg-primary">
                          Connect Your Wallet
                        </h3>
                        <p className="text-body-2 text-fg-secondary leading-relaxed">
                          Connect your Solana wallet to view your lending positions, health factors, and portfolio analytics.
                        </p>
                      </div>

                      <Button
                        onClick={connect}
                        disabled={isConnecting}
                        className="btn-primary w-full px-6 py-3 text-sm font-medium relative overflow-hidden group"
                      >
                        <span className="relative">
                          {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 relative" />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Portfolio Overview KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <KPICard
                      title="Total Supplied"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? `$${totalSupplied.toFixed(1)}M` : "$0.0M"}
                      icon={DollarSign}
                      trend={userPositions.length > 0 ? "up" : undefined}
                      trendValue={userPositions.length > 0 && blendPositions.summary.totalYieldEarned > 0
                        ? `+$${(blendPositions.summary.totalYieldEarned / 1000).toFixed(1)}K earned`
                        : userPositions.length > 0 ? "+5.2%" : undefined}
                    />
                    <KPICard
                      title="Total Borrowed"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? `$${totalBorrowed.toFixed(1)}M` : "$0.0M"}
                      icon={TrendingUp}
                      subtitle={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0
                          ? `${userPositions.length} active position${userPositions.length > 1 ? 's' : ''}`
                          : "No positions"}
                    />
                    <KPICard
                      title="Net APY"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? netApy : "0.00%"}
                      icon={BarChart3}
                      trend={userPositions.length > 0 && blendPositions.summary.netProfitLoss > 0 ? "up" :
                        userPositions.length > 0 && blendPositions.summary.netProfitLoss < 0 ? "down" : undefined}
                      trendValue={userPositions.length > 0 && isConnected && blendPositions.summary.netProfitLoss !== 0
                        ? `${blendPositions.summary.netProfitLoss > 0 ? '+' : ''}$${(blendPositions.summary.netProfitLoss / 1000).toFixed(1)}K P&L`
                        : userPositions.length > 0 ? "+0.15%" : undefined}
                    />
                    <KPICard
                      title="Avg Health Factor"
                      value={walletAssets.loading || blendPositions.loading ? "Loading..." :
                        userPositions.length > 0 ? avgHealthFactor.toFixed(2) : "--"}
                      icon={Shield}
                      trend={userPositions.length > 0 && avgHealthFactor >= 2.0 ? "up" :
                        userPositions.length > 0 && avgHealthFactor < 1.5 ? "down" :
                        userPositions.length > 0 ? "neutral" : undefined}
                      trendValue={userPositions.length > 0
                        ? avgHealthFactor >= 2.0 ? "Healthy" : avgHealthFactor >= 1.5 ? "Moderate" : "At Risk"
                        : undefined}
                    />
                  </div>

                  {/* DEPLOYED SRWA TOKENS SECTION */}
                  <div className="space-y-6">
                    <DeployedTokensGrid />
                  </div>
                </div>
              )}
          </DashboardSection>
    </DashboardLayout>
  );
}