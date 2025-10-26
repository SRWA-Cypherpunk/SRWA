/**
 * Application Routes
 * Central repository for all application routes
 */

/**
 * MAIN ROUTES
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MARKETS: '/markets',
  PORTFOLIO: '/portfolio',
  DOCS: '/docs',
  KYC: '/kyc',
  ADMIN: '/admin',
} as const;

/**
 * DASHBOARD ROUTES
 */
export const DASHBOARD_ROUTES = {
  OVERVIEW: '/dashboard',
  MARKETS: '/dashboard/markets',
  PORTFOLIO: '/dashboard/portfolio',
} as const;

/**
 * MARKET ROUTES
 */
export const MARKET_ROUTES = {
  LIST: '/markets',
  DETAIL: (address: string) => `/markets/${address}`,
  CREATE: '/markets/create',
} as const;

/**
 * POOL ROUTES
 */
export const POOL_ROUTES = {
  LIST: '/pools',
  DETAIL: (address: string) => `/pools/${address}`,
  CREATE: '/pools/create',
} as const;

/**
 * SRWA ROUTES
 */
export const SRWA_ROUTES = {
  DEMO: '/srwa-demo',
  CONTRACTS: '/srwa-contracts',
  ISSUANCE: '/srwa-issuance',
  TEST_FORM: '/srwa-test-form',
} as const;

/**
 * USER ROUTES
 */
export const USER_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;

/**
 * ADMIN ROUTES
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  POOLS: '/admin/pools',
  TRANSACTIONS: '/admin/transactions',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
} as const;

/**
 * AUTH ROUTES
 */
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

/**
 * KYC ROUTES
 */
export const KYC_ROUTES = {
  ELIGIBILITY: '/kyc-eligibility',
  VERIFICATION: '/kyc',
  STATUS: '/kyc/status',
} as const;

/**
 * UTILITY ROUTES
 */
export const UTILITY_ROUTES = {
  NOT_FOUND: '/404',
  ERROR: '/error',
  MAINTENANCE: '/maintenance',
} as const;

/**
 * EXTERNAL LINKS
 */
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/srwa',
  DOCS: 'https://docs.srwa.com',
  DISCORD: 'https://discord.gg/srwa',
  TWITTER: 'https://twitter.com/srwa_platform',
  STELLAR_EXPERT: (address: string) => `https://stellar.expert/explorer/testnet/account/${address}`,
  SOLANA_EXPLORER: (address: string) => `https://explorer.solana.com/address/${address}?cluster=devnet`,
} as const;

/**
 * Helper function to check if route is active
 */
export function isRouteActive(currentPath: string, route: string): boolean {
  if (route === ROUTES.HOME) {
    return currentPath === route;
  }
  return currentPath.startsWith(route);
}

/**
 * Helper function to get route with params
 */
export function getRouteWithParams(
  route: string,
  params: Record<string, string | number>
): string {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}

/**
 * Helper function to parse route params
 */
export function parseRouteParams(pathname: string, routePattern: string): Record<string, string> {
  const patternParts = routePattern.split('/');
  const pathParts = pathname.split('/');
  const params: Record<string, string> = {};

  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index] || '';
    }
  });

  return params;
}

/**
 * Navigation items for main menu
 */
export const MAIN_NAV_ITEMS = [
  {
    label: 'Home',
    href: ROUTES.HOME,
    icon: 'Home',
  },
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    label: 'Markets',
    href: ROUTES.MARKETS,
    icon: 'TrendingUp',
  },
  {
    label: 'Portfolio',
    href: ROUTES.PORTFOLIO,
    icon: 'Wallet',
  },
  {
    label: 'Documentation',
    href: ROUTES.DOCS,
    icon: 'FileText',
  },
] as const;

/**
 * Footer navigation items
 */
export const FOOTER_NAV_ITEMS = [
  {
    label: 'Documentation',
    href: ROUTES.DOCS,
  },
  {
    label: 'KYC Portal',
    href: ROUTES.KYC,
  },
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
  },
  {
    label: 'Markets',
    href: ROUTES.MARKETS,
  },
  {
    label: 'Portfolio',
    href: ROUTES.PORTFOLIO,
  },
  {
    label: 'Admin',
    href: ROUTES.ADMIN,
  },
] as const;
