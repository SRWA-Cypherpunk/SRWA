import { useLocation, useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '@/lib/constants';
import { Globe, Shield, BarChart3, Activity, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      mobileLabel: 'Overview',
      icon: BarChart3,
      path: DASHBOARD_ROUTES.OVERVIEW,
      description: 'Platform statistics',
      gradient: 'from-blue-500 to-purple-500',
      activeGradient: 'from-blue-400 to-purple-400'
    },
    {
      id: 'markets',
      label: 'Markets',
      mobileLabel: 'Markets',
      icon: TrendingUp,
      path: DASHBOARD_ROUTES.MARKETS,
      description: 'Available pools',
      gradient: 'from-purple-500 to-pink-500',
      activeGradient: 'from-purple-400 to-pink-400'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      mobileLabel: 'Portfolio',
      icon: Wallet,
      path: DASHBOARD_ROUTES.PORTFOLIO,
      description: 'Your positions',
      gradient: 'from-orange-500 to-red-500',
      activeGradient: 'from-orange-400 to-red-400'
    }
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path) || tabs[0];

  return (
    <div className="w-full px-4 sm:px-6 mb-8">
      {/* Dashboard Title with Gradient */}
      <div className="text-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-500 via-purple-400 to-orange-400 bg-clip-text text-transparent inline-flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand-400" />
          Dashboard
        </h2>
        <p className="text-sm text-fg-muted mt-2">Navigate between different sections</p>
      </div>

      {/* Glass morphism container matching landing page style */}
      <div className="relative mx-auto max-w-4xl">
        {/* Enhanced background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-orange-500/10 blur-2xl animate-pulse" />

        {/* Main navigation container with stronger glassmorphism */}
        <div className="relative bg-black/60 backdrop-blur-xl border-2 border-brand-500/30 rounded-2xl p-2 shadow-2xl">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab.id === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 transition-all duration-300',
                    'hover:scale-105 group overflow-hidden',
                    !isActive && 'hover:bg-white/5',
                    isActive && 'shadow-lg shadow-brand-500/30'
                  )}
                >
                  {/* Animated gradient background for active tab */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 via-purple-500/20 to-orange-500/30 animate-gradient" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shine" />
                    </>
                  )}

                  {/* Hover gradient for inactive tabs */}
                  {!isActive && (
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                      tab.gradient
                    )} style={{ opacity: 0.1 }} />
                  )}

                  {/* Active indicator gradient bar */}
                  {isActive && (
                    <div className="absolute inset-x-4 bottom-0 h-1">
                      <div className="h-full bg-gradient-to-r from-brand-400 via-purple-400 to-orange-400 rounded-full shadow-lg shadow-brand-400/50" />
                    </div>
                  )}

                  {/* Icon with enhanced glow effect */}
                  <div className={cn(
                    'relative transition-all duration-300 transform',
                    isActive && 'scale-110'
                  )}>
                    <Icon className={cn(
                      'w-6 h-6 sm:w-7 sm:h-7 relative z-10',
                      isActive ? 'text-white drop-shadow-glow' : 'text-fg-secondary group-hover:text-white'
                    )} />
                    {isActive && (
                      <>
                        <div className={cn('absolute inset-0 blur-xl', `bg-gradient-to-r ${tab.activeGradient}`)} />
                        <div className="absolute inset-0 blur-md bg-white/20" />
                      </>
                    )}
                  </div>

                  {/* Label with better typography */}
                  <span className={cn(
                    'text-sm sm:text-base font-semibold transition-all duration-300 relative z-10',
                    isActive ? 'text-white' : 'text-fg-secondary group-hover:text-white'
                  )}>
                    {tab.label}
                  </span>

                  {/* Description with better visibility */}
                  <span className={cn(
                    'hidden sm:block text-[11px] transition-all duration-300 relative z-10',
                    isActive ? 'text-white/80 font-medium' : 'text-fg-muted group-hover:text-white/70'
                  )}>
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      </div>
    </div>
  );
}