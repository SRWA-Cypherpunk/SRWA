/**
 * Design System Tokens
 * Central repository for spacing, typography, shadows, borders, and other design values
 */

/**
 * SPACING SCALE
 * Based on 4px grid system
 */
export const SPACING = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
} as const;

/**
 * TYPOGRAPHY SCALE
 * Font sizes with corresponding line heights and letter spacing
 */
export const TYPOGRAPHY = {
  display1: {
    fontSize: '56px',
    lineHeight: '64px',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  display2: {
    fontSize: '44px',
    lineHeight: '52px',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  h1: {
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  h2: {
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0',
    fontWeight: 600,
  },
  h3: {
    fontSize: '20px',
    lineHeight: '28px',
    letterSpacing: '0',
    fontWeight: 500,
  },
  body1: {
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  body2: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  micro: {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0',
    fontWeight: 500,
  },
} as const;

/**
 * FONT WEIGHTS
 */
export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * BORDER RADIUS
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * SHADOWS
 */
export const SHADOWS = {
  none: 'none',
  card: '0 1px 1px rgba(0,0,0,0.3), 0 4px 14px rgba(0,0,0,0.25)',
  focus: '0 0 0 3px hsl(265, 90%, 48%, 0.35)',
  glow: {
    brand: '0 0 20px rgba(153, 69, 255, 0.3)',
    brandIntense: '0 0 30px rgba(153, 69, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    purple: '0 0 30px rgba(153, 69, 255, 0.4)',
    purpleIntense: '0 0 40px rgba(153, 69, 255, 0.5), 0 0 80px rgba(153, 69, 255, 0.3)',
    orange: '0 0 30px rgba(255, 107, 53, 0.4)',
    solana: '0 0 20px rgba(153, 69, 255, 0.3), 0 0 40px rgba(255, 107, 53, 0.2)',
  },
  hover: {
    card: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(77, 178, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
    button: '0 12px 40px rgba(77, 178, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
} as const;

/**
 * TRANSITIONS
 */
export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  normal: '200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  slow: '300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  slower: '500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

/**
 * ANIMATION DURATIONS
 */
export const ANIMATION_DURATIONS = {
  fadeIn: '180ms',
  slideUp: '220ms',
  scaleIn: '160ms',
  shimmer: '2s',
  pulse: '2s',
  float: '3s',
  orbit: 'var(--duration)',
} as const;

/**
 * Z-INDEX HIERARCHY
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
  max: 999,
} as const;

/**
 * BREAKPOINTS (for responsive design)
 */
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * CONTAINER SIZES
 */
export const CONTAINER = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

/**
 * COMPONENT SIZES
 */
export const COMPONENT_SIZES = {
  button: {
    sm: {
      height: '36px',
      padding: '0 12px',
      fontSize: '14px',
    },
    md: {
      height: '44px',
      padding: '0 16px',
      fontSize: '14px',
    },
    lg: {
      height: '48px',
      padding: '0 20px',
      fontSize: '16px',
    },
  },
  input: {
    sm: {
      height: '36px',
      padding: '0 12px',
      fontSize: '14px',
    },
    md: {
      height: '44px',
      padding: '0 16px',
      fontSize: '14px',
    },
    lg: {
      height: '48px',
      padding: '0 20px',
      fontSize: '16px',
    },
  },
} as const;

/**
 * ICON SIZES
 */
export const ICON_SIZES = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
} as const;

/**
 * OPACITY SCALE
 */
export const OPACITY = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  80: '0.8',
  90: '0.9',
  100: '1',
} as const;

/**
 * Helper function to get spacing value
 */
export function getSpacing(value: keyof typeof SPACING): string {
  return SPACING[value];
}

/**
 * Helper function to get typography style
 */
export function getTypography(variant: keyof typeof TYPOGRAPHY) {
  return TYPOGRAPHY[variant];
}

/**
 * Helper function to get shadow
 */
export function getShadow(type: keyof typeof SHADOWS): string {
  return SHADOWS[type] as string;
}

/**
 * Helper function to get breakpoint
 */
export function getBreakpoint(size: keyof typeof BREAKPOINTS): string {
  return BREAKPOINTS[size];
}
