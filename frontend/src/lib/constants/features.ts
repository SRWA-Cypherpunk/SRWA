/**
 * Feature Flags
 *
 * Centralized configuration for enabling/disabling features based on environment variables.
 * This allows us to control which features are visible in production vs development.
 */

/**
 * Check if Dashboard feature is enabled
 *
 * Default behavior:
 * - In development (with .env file): enabled (VITE_ENABLE_DASHBOARD=true)
 * - In production (Cloudflare Pages without env var): disabled
 * - Can be explicitly enabled in production by setting VITE_ENABLE_DASHBOARD=true
 *
 * @returns {boolean} True if Dashboard should be visible
 */
export const isDashboardEnabled = (): boolean => {
  const envValue = import.meta.env.VITE_ENABLE_DASHBOARD;

  // If explicitly set to 'false' (string), disable
  if (envValue === 'false' || envValue === '0') {
    return false;
  }

  // If explicitly set to 'true' (string) or any truthy value, enable
  if (envValue === 'true' || envValue === '1') {
    return true;
  }

  // Default: enabled in development (when env var exists), disabled in production (when undefined)
  return envValue !== undefined;
};

/**
 * Feature flags object for easy access
 */
export const FEATURES = {
  /**
   * Dashboard feature - controls visibility of Dashboard links and pages
   */
  DASHBOARD: isDashboardEnabled(),

  /**
   * Add more feature flags here as needed
   * Example:
   * ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
   * BETA_FEATURES: import.meta.env.VITE_ENABLE_BETA === 'true',
   */
} as const;

/**
 * Helper function to log feature flags (useful for debugging)
 */
export const logFeatureFlags = () => {
  if (import.meta.env.DEV) {
    console.log('[Feature Flags]', {
      DASHBOARD: FEATURES.DASHBOARD,
      raw: {
        VITE_ENABLE_DASHBOARD: import.meta.env.VITE_ENABLE_DASHBOARD,
      },
    });
  }
};

// Log feature flags in development
if (import.meta.env.DEV) {
  logFeatureFlags();
}
