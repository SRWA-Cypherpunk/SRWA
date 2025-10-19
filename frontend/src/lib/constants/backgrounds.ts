/**
 * Simplified background configuration
 * Simple approach: colors and ready-to-use gradients
 */

// ==================== COLORS ====================
export const COLORS = {
  purple: '#9945FF',
  orange: '#FF6B35',
  green: '#14F195',
  dark: '#0A0A0A',
} as const;

// ==================== GRADIENTS (Ready to use in className) ====================
/**
 * Each section has a base gradient that connects with adjacent sections
 * Pattern: invert gradients between sections for natural connection
 */
export const GRADIENTS = {
  // Hero: Dark with purple/orange tint
  hero: {
    base: 'from-[#0A0A0A] via-[#1a0f1f] to-[#0A0A0A]',
  },

  // Powered By: Subtle purple
  poweredBy: {
    base: 'from-[#0A0A0A] via-purple-950/10 to-[#0A0A0A]',
  },

  // Numbers: Subtle orange (inverted emphasis from Powered By)
  numbers: {
    base: 'from-[#0A0A0A] via-orange-950/15 to-[#0A0A0A]',
  },

  // Features: Back to purple
  features: {
    base: 'from-[#0A0A0A] via-purple-950/8 to-[#0A0A0A]',
  },

  // Markets: Orange/Purple mix
  markets: {
    base: 'from-[#0A0A0A] via-orange-950/10 to-[#0A0A0A]',
  },

  // Roadmap: Purple
  roadmap: {
    base: 'from-[#0A0A0A] via-purple-950/8 to-[#0A0A0A]',
  },

  // Footer: Green (calm ending)
  footer: {
    base: 'from-[#0A0A0A] to-emerald-950/15',
  },
} as const;

export type ColorKey = keyof typeof COLORS;
