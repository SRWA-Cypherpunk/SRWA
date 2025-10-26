import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header } from '@/components/layout/Header';
import { PageBackground } from '@/components/layout/PageBackground';
import { DashboardSection } from "@/components/layout";
import { HeroButton } from "@/components/ui/hero-button";
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Hooks
import { useBlendPools } from '@/hooks/markets/useBlendPools';
import { useEnhancedPoolData } from '@/hooks/markets/useDefIndexData';
import { useSRWAMarkets } from '@/hooks/markets/useSRWAMarkets';

// Icons
import { Plus, Zap } from "lucide-react";

export default function DashboardMarkets() {
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
    navigate(`/pool/${poolAddress}?action=supply`);
  };

  const handleBorrow = (poolAddress: string) => {
    navigate(`/pool/${poolAddress}?action=borrow`);
  };

  const handleRefresh = () => {
    refetchPools();
    refetchSRWA();
  };

  return (
    <PageBackground variant="subtle">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <DashboardNav />

        {/* Header with Create SRWA Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Lending Markets
              </h1>
              <p className="text-base sm:text-lg text-fg-secondary mt-2">
                Discover and interact with lending pools on Solana
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

          {/* Markets Tab Content */}
          <DashboardSection
            title={
              <>
                Available Lending Pools
                <span className="inline-block ml-2">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 inline" />
                </span>
              </>
            }
            description="Supply assets to earn interest or borrow against your collateral"
            decorativeColor="purple"
          >
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
          </DashboardSection>
      </main>
    </PageBackground>
  );
}