/**
 * Constants Index
 * Central export for all application constants
 *
 * Usage:
 * import { COLORS, ROUTES, APP_INFO } from '@/lib/constants';
 */

// Export all constants
export * from './colors';
export * from './design-tokens';
export * from './app';
export * from './routes';

// Re-export commonly used items for convenience
export { COLORS, COLOR_HEX, GRADIENTS } from './colors';
export { TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS, Z_INDEX, BREAKPOINTS } from './design-tokens';
export { APP_INFO, PARTNERS, POOL_CLASSES, RISK_LEVELS, POOL_STATUS, ERROR_MESSAGES } from './app';
export { ROUTES, MARKET_ROUTES, POOL_ROUTES, MAIN_NAV_ITEMS } from './routes';
