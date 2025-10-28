import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { DeployedTokensGrid } from '@/components/srwa/DeployedTokensGrid';
import MarketsHeroSection from '@/components/markets/MarketsHeroSection';
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-4">
                  {error.message || 'An unexpected error occurred while loading the markets.'}
                </p>
                <Button onClick={resetErrorBoundary} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Markets() {
  const navigate = useNavigate();
  
  // Fetch Blend pools data
  const {
    pools: blendPools,
    loading: poolsLoading,
    error: poolsError,
    refetch: refetchPools
  } = useBlendPools();

  // Enhance pools with DefIndex analytics
  const {
    enhancedPools,
    loading: analyticsLoading,
    error: analyticsError
  } = useEnhancedPoolData(blendPools);

  // Fetch SRWA markets from deployed tokens
  const {
    srwaMarkets,
    loading: srwaLoading,
    error: srwaError,
    refetch: refetchSRWA
  } = useSRWAMarkets();

  // Combined loading and error states
  const loading = poolsLoading || analyticsLoading || srwaLoading;
  const error = poolsError?.message || analyticsError?.message || srwaError?.message || null;

  // Navigation handlers
  const handleViewPoolDetails = (poolAddress: string) => {
    navigate(`/pool/${poolAddress}`);
  };

  const handleSupply = (poolAddress: string) => {
    // Legacy navigation - now handled by modals in MarketsDashboard
    console.log(`Legacy supply navigation for pool: ${poolAddress}`);
  };

  const handleBorrow = (poolAddress: string) => {
    // Legacy navigation - now handled by modals in MarketsDashboard
    console.log(`Legacy borrow navigation for pool: ${poolAddress}`);
  };

  const handleRefresh = () => {
    refetchPools();
    refetchSRWA();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-primary">
        <Header />

        <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
          {/* Hero Section with Metrics */}
          <MarketsHeroSection />

          {/* Markets Dashboard */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary">
                Available Markets
              </h2>
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

            <MarketsDashboard
              pools={enhancedPools}
              srwaMarkets={srwaMarkets}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
              onViewPoolDetails={handleViewPoolDetails}
              onSupply={handleSupply}
              onBorrow={handleBorrow}
            />
          </div>

          {/* Deployed SRWA Tokens */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              Deployed RWA Tokens
            </h2>
            <DeployedTokensGrid />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}