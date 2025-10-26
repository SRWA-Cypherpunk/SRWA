import { cn } from '@/lib/utils';

export type BackgroundVariant = 'default' | 'purple' | 'orange' | 'blue' | 'none';

interface BackgroundGradientProps {
  /**
   * Visual variant of the background gradient
   * - default: Purple + Orange harmonious blend
   * - purple: Purple-focused gradient
   * - orange: Orange-focused gradient
   * - blue: Blue/Purple blend
   * - none: No gradient, just dark background
   */
  variant?: BackgroundVariant;

  /**
   * Whether to show the SVG noise texture overlay
   * @default true
   */
  showNoise?: boolean;

  /**
   * Opacity of the gradient background (0-1)
   * @default 0.6
   */
  opacity?: number;

  /**
   * Additional className for the wrapper
   */
  className?: string;
}

/**
 * Gradient configuration for each variant
 */
const GRADIENT_VARIANTS: Record<Exclude<BackgroundVariant, 'none'>, string> = {
  default: `
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(153,69,255,0.15), transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,53,0.12), transparent 50%),
    linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
  `,
  purple: `
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(153,69,255,0.20), transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139,92,246,0.15), transparent 50%),
    linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
  `,
  orange: `
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,53,0.18), transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249,115,22,0.12), transparent 50%),
    linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
  `,
  blue: `
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(75,107,255,0.15), transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139,92,246,0.12), transparent 50%),
    linear-gradient(180deg, #0A0A0A 0%, #0d0b0e 30%, #110d14 70%, #0A0A0A 100%)
  `,
};

/**
 * BackgroundGradient - Reusable background component with SVG noise and gradients
 *
 * Eliminates code duplication across dashboard pages by centralizing the
 * complex background pattern (SVG noise overlay + radial/linear gradients).
 *
 * Features:
 * - Multiple visual variants (default, purple, orange, blue)
 * - Optional SVG noise texture overlay
 * - Configurable opacity
 * - Automatically handles z-index and pointer-events
 * - Prevents click-blocking issues
 *
 * @example
 * ```tsx
 * // Default background
 * <BackgroundGradient />
 *
 * // Purple variant without noise
 * <BackgroundGradient variant="purple" showNoise={false} />
 *
 * // Custom opacity
 * <BackgroundGradient variant="orange" opacity={0.4} />
 * ```
 */
export function BackgroundGradient({
  variant = 'default',
  showNoise = true,
  opacity = 0.6,
  className,
}: BackgroundGradientProps) {
  // No background for 'none' variant
  if (variant === 'none') {
    return null;
  }

  return (
    <div className={cn('absolute inset-0 z-0 pointer-events-none', className)}>
      {/* SVG Noise Texture Overlay */}
      {showNoise && (
        <svg className="absolute inset-0 opacity-[0.015] w-full h-full pointer-events-none">
          <filter id="dashboardNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#dashboardNoiseFilter)" />
        </svg>
      )}

      {/* Gradient Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity,
          background: GRADIENT_VARIANTS[variant],
        }}
      />
    </div>
  );
}

/**
 * DecorativeGradient - Small decorative gradient overlay for sections/tabs
 *
 * Used for adding subtle visual accents to specific sections without
 * affecting the main background.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <DecorativeGradient color="purple" />
 *   <div className="relative z-10">Content</div>
 * </div>
 * ```
 */
export function DecorativeGradient({
  color = 'purple',
  opacity = 0.4,
}: {
  color?: 'purple' | 'orange' | 'blue';
  opacity?: number;
}) {
  const colorMap = {
    purple: 'rgba(153,69,255,0.15)',
    orange: 'rgba(255,107,53,0.12)',
    blue: 'rgba(75,107,255,0.12)',
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 20%, ${colorMap[color]}, transparent 70%)`,
        }}
      />
    </div>
  );
}
