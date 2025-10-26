import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer, FooterProps } from './Footer';
import { BackgroundGradient, BackgroundVariant } from './BackgroundGradient';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;

  /**
   * Background gradient variant
   * @default 'default'
   */
  backgroundVariant?: BackgroundVariant;

  /**
   * Show SVG noise overlay on background
   * @default true
   */
  showNoise?: boolean;

  /**
   * Show header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Header customization props
   */
  headerProps?: {
    disableDashboardLink?: boolean;
    onDashboardLinkClick?: () => void;
  };

  /**
   * Show footer
   * @default true
   */
  showFooter?: boolean;

  /**
   * Footer customization props
   */
  footerProps?: FooterProps;

  /**
   * Container max width
   * @default '7xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

  /**
   * Additional className for the main container
   */
  containerClassName?: string;

  /**
   * Additional className for the content wrapper
   */
  contentClassName?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1920px]',
  '4xl': 'max-w-[2560px]',
  '5xl': 'max-w-[3200px]',
  '6xl': 'max-w-[3840px]',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * DashboardLayout - Standardized layout for dashboard pages
 *
 * Provides consistent structure for all dashboard pages:
 * - Animated background with noise texture
 * - Header and Footer
 * - Proper z-index management (prevents Footer click bugs)
 * - Responsive container with configurable max-width
 *
 * Benefits:
 * - Eliminates 500+ lines of duplicated background code
 * - Ensures Footer always works (correct z-index hierarchy)
 * - Consistent visual identity across all dashboard pages
 * - Easy to maintain and customize
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DashboardLayout>
 *   <YourDashboardContent />
 * </DashboardLayout>
 *
 * // With custom background
 * <DashboardLayout backgroundVariant="purple">
 *   <YourDashboardContent />
 * </DashboardLayout>
 *
 * // With custom Footer
 * <DashboardLayout
 *   footerProps={{
 *     showCTA: true,
 *     ctaAction: 'top',
 *     ctaTitle: 'Get Started',
 *   }}
 * >
 *   <YourDashboardContent />
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  children,
  backgroundVariant = 'default',
  showNoise = true,
  showHeader = true,
  headerProps,
  showFooter = true,
  footerProps,
  maxWidth = '7xl',
  containerClassName,
  contentClassName,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Layer (z-0) */}
      <BackgroundGradient variant={backgroundVariant} showNoise={showNoise} />

      {/* Content Layer (z-10) - Ensures all content is above background */}
      <div className="relative z-10">
        {/* Header */}
        {showHeader && <Header {...headerProps} />}

        {/* Main Content */}
        <main
          className={cn(
            'container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8',
            maxWidthClasses[maxWidth],
            containerClassName
          )}
        >
          <div className={cn(contentClassName)}>{children}</div>
        </main>

        {/* Footer - Inside z-10 div to prevent click issues */}
        {showFooter && <Footer {...footerProps} />}
      </div>
    </div>
  );
}

/**
 * DashboardSection - Reusable section wrapper for dashboard content
 *
 * Provides consistent spacing and optional decorative backgrounds
 * for different sections within a dashboard.
 *
 * @example
 * ```tsx
 * <DashboardSection
 *   title="Markets Overview"
 *   description="Discover lending opportunities"
 *   decorativeColor="purple"
 * >
 *   <MarketsContent />
 * </DashboardSection>
 * ```
 */
export function DashboardSection({
  children,
  title,
  description,
  decorativeColor,
  className,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  decorativeColor?: 'purple' | 'orange' | 'blue';
  className?: string;
}) {
  return (
    <div className={cn('dashboard-tab-content relative space-y-8', className)}>
      {/* Optional Decorative Background */}
      {decorativeColor && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96"
            style={{
              background:
                decorativeColor === 'purple'
                  ? 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(153,69,255,0.15), transparent 70%)'
                  : decorativeColor === 'orange'
                  ? 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,107,53,0.12), transparent 70%)'
                  : 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(75,107,255,0.12), transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Optional Header */}
        {(title || description) && (
          <div className="text-center space-y-4">
            {title && (
              <h2
                className={cn(
                  'text-2xl sm:text-3xl font-bold bg-clip-text text-transparent',
                  decorativeColor === 'purple'
                    ? 'bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500'
                    : decorativeColor === 'orange'
                    ? 'bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500'
                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500'
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base sm:text-lg text-fg-secondary max-w-2xl mx-auto px-4">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Children Content */}
        {children}
      </div>
    </div>
  );
}
