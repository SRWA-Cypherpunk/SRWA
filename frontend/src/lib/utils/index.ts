/**
 * Utilities Index
 * Central export for all utility functions
 *
 * Usage:
 * import { formatCurrency, isValidEmail, cn, calculateAPY } from '@/lib/utils';
 */

// Export all utilities
export * from './format';
export * from './validation';
export * from './math';
export * from './classNames';

// Re-export commonly used functions for convenience
export { formatCurrency, formatPercent, formatAddress, formatAPY, formatDate } from './format';
export { isValidEmail, isValidSolanaAddress, validateAmount, isEmpty } from './validation';
export { calculateUtilization, calculateHealthFactor, calculateBorrowAPY, clamp } from './math';
export { cn, conditionalClass, buttonVariant, cardClass, inputClass } from './classNames';
