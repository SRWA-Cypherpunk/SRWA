import { useNavigate } from 'react-router-dom';
import '@/styles/features/dashboard.css';
import { Header, Footer } from "@/components/layout";
import { HeroButton } from "@/components/ui/hero-button";
import { MarketsDashboard } from '@/components/markets/MarketsDashboard';
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DASHBOARD_ROUTES } from "@/lib/constants";

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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Gradiente Harmonioso */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* SVG Noise Overlay */}
        <svg className="absolute inset-0 opacity-[0.015] w-full h-full">
          <filter id="dashboardNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#dashboardNoiseFilter)" />
        </svg>

        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-60" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(153,69,255,0.15), transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,53,0.12), transparent 50%),
            linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
          `
        }} />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

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
          <div className="dashboard-tab-content relative space-y-8">
            {/* Decorative Background - Purple */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(153,69,255,0.15), transparent 70%)'
              }} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                  Available Lending Pools
                  <span className="inline-block ml-2">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 inline" />
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                  Supply assets to earn interest or borrow against your collateral
                </p>
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
          </div>
        </main>

        {/* Footer */}
        <Footer
          showCTA
          ctaAction="top"
          ctaTitle="Explore More Markets"
          ctaDescription="Discover new lending opportunities"
        />
      </div>
    </div>
  );
}