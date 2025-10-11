/**
 * Legacy utils.ts - Deprecated
 * This file re-exports from the new structured lib/utils/ folder
 * Please import directly from '@/lib/utils' which now uses the new structure
 */

// Re-export everything from the new utils structure
export * from './utils/index';

// Explicitly re-export cn for backward compatibility
export { cn } from './utils/classNames';
