import { useLocation, useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '@/lib/constants';
import { Globe, Shield, BarChart3 } from 'lucide-react';

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'overview',
      label: 'Dashboard',
      mobileLabel: 'Dashboard',
      icon: BarChart3,
      path: DASHBOARD_ROUTES.OVERVIEW,
      colorClass: 'from-blue-500/25 to-purple-500/25',
      activeColor: 'text-blue-300',
      hoverColor: 'hover:text-blue-300 hover:bg-blue-500/10'
    },
    {
      id: 'markets',
      label: 'Markets',
      mobileLabel: 'Mkts',
      icon: Globe,
      path: DASHBOARD_ROUTES.MARKETS,
      colorClass: 'from-purple-500/25 to-purple-600/25',
      activeColor: 'text-purple-300',
      hoverColor: 'hover:text-purple-300 hover:bg-purple-500/10'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      mobileLabel: 'Port',
      icon: Shield,
      path: DASHBOARD_ROUTES.PORTFOLIO,
      colorClass: 'from-orange-500/25 to-orange-600/25',
      activeColor: 'text-orange-300',
      hoverColor: 'hover:text-orange-300 hover:bg-orange-500/10'
    }
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path) || tabs[0];

  return (
    <div className="flex justify-center">
      <div className="grid w-full max-w-md grid-cols-3 h-10 sm:h-12 bg-card/50 backdrop-blur-md border-2 border-purple-500/20 rounded-xl p-1 shadow-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab.id === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`dashboard-tab-button flex items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${tab.colorClass} ${tab.activeColor} shadow-md`
                  : `text-fg-muted ${tab.hoverColor}`
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}