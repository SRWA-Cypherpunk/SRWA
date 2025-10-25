/**
 * Design System Colors
 * Central repository for all color values used in the application
 * All colors use HSL format for better manipulation
 */

export const COLORS = {
  // ===== SOLANA BRAND COLORS =====
  solana: {
    purple: {
      50: 'hsl(280, 100%, 95%)',   // #F5EBFF
      100: 'hsl(280, 100%, 90%)',  // #E6CCFF
      200: 'hsl(275, 100%, 80%)',  // #D199FF
      300: 'hsl(272, 100%, 75%)',  // #BD6FFF
      400: 'hsl(270, 100%, 70%)',  // #A945FF
      500: 'hsl(270, 100%, 65%)',  // #9945FF - Main Solana Purple
      600: 'hsl(268, 100%, 55%)',  // #7D2AE8
      700: 'hsl(265, 90%, 48%)',   // #6610F2
    },
    green: {
      400: 'hsl(158, 88%, 55%)',   // #2EDFA3
      500: 'hsl(158, 88%, 50%)',   // #14F195 - Solana Green
    },
  },

  // ===== ACCENT COLORS =====
  accent: {
    orange: {
      50: 'hsl(25, 100%, 95%)',    // #FFF4EB
      100: 'hsl(25, 100%, 85%)',   // #FFD9B3
      400: 'hsl(25, 100%, 65%)',   // #FF9955
      500: 'hsl(18, 100%, 60%)',   // #FF6B35 - Main Orange
      600: 'hsl(15, 100%, 52%)',   // #E8552E
    },
  },

  // ===== SEMANTIC COLORS =====
  semantic: {
    success: 'hsl(158, 88%, 50%)',   // Solana Green
    warning: 'hsl(25, 100%, 60%)',   // Orange
    error: 'hsl(0, 74%, 75%)',       // Red
    info: 'hsl(210, 100%, 65%)',     // Blue
  },

  // ===== STATUS COLORS =====
  status: {
    active: 'hsl(270, 100%, 70%)',   // Purple
    paused: 'hsl(45, 100%, 60%)',    // Yellow
    degraded: 'hsl(0, 80%, 60%)',    // Red
    pending: 'hsl(210, 80%, 60%)',   // Blue
  },

  // ===== RISK LEVELS =====
  risk: {
    low: 'hsl(158, 88%, 50%)',       // Green
    medium: 'hsl(45, 100%, 60%)',    // Yellow
    high: 'hsl(0, 80%, 60%)',        // Red
    experimental: 'hsl(280, 100%, 70%)', // Purple
  },

  // ===== BACKGROUND COLORS =====
  background: {
    black: 'hsl(0, 0%, 4%)',         // #0A0A0A - Deep black
    elevation1: 'hsl(0, 0%, 7%)',    // #121212
    elevation2: 'hsl(0, 0%, 10%)',   // #1A1A1A
  },

  // ===== TEXT COLORS =====
  text: {
    primary: 'hsl(0, 0%, 100%)',     // #FFFFFF
    secondary: 'hsl(218, 15%, 69%)', // #A6B0BF
    muted: 'hsl(214, 14%, 59%)',     // #8992A1
  },

  // ===== BORDER & STROKE =====
  border: {
    line: 'hsl(0, 0%, 15%)',         // #262626
  },
} as const;

/**
 * Color Hex Values (for direct usage)
 */
export const COLOR_HEX = {
  solanaPurple: '#9945FF',
  solanaGreen: '#14F195',
  accentOrange: '#FF6B35',
  deepBlack: '#0A0A0A',
} as const;

/**
 * Gradient Definitions
 */
export const GRADIENTS = {
  solana: 'linear-gradient(135deg, #14F195 0%, #9945FF 50%, #FF6B35 100%)',
  purpleOrange: 'linear-gradient(135deg, #9945FF 0%, #FF6B35 100%)',
  purple: 'linear-gradient(135deg, #6610F2 0%, #9945FF 50%, #BD6FFF 100%)',
  orange: 'linear-gradient(135deg, #E8552E 0%, #FF6B35 50%, #FF9955 100%)',
  hero: 'linear-gradient(180deg, hsl(0, 0%, 4%) 0%, hsl(0, 0%, 7%) 100%)',
  glow: 'radial-gradient(circle at center, hsl(270, 100%, 65%, 0.02) 0%, transparent 70%)',
} as const;

/**
 * Helper function to get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // For HSL colors, add opacity at the end
  if (color.startsWith('hsl(')) {
    return color.replace(')', `, ${opacity})`).replace('hsl(', 'hsla(');
  }
  return color;
}

/**
 * Helper function to get brand color by shade
 */
export function getBrandColor(shade: keyof typeof COLORS.solana.purple = 500): string {
  return COLORS.solana.purple[shade];
}

/**
 * Helper function to get semantic color
 */
export function getSemanticColor(type: keyof typeof COLORS.semantic): string {
  return COLORS.semantic[type];
}

/**
 * Helper function to get status color
 */
export function getStatusColor(status: keyof typeof COLORS.status): string {
  return COLORS.status[status];
}

/**
 * Helper function to get risk color
 */
export function getRiskColor(risk: keyof typeof COLORS.risk): string {
  return COLORS.risk[risk];
}
