import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer, FooterProps } from './Footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;

  // Header customization
  showHeader?: boolean;
  headerProps?: {
    disableDashboardLink?: boolean;
    onDashboardLinkClick?: () => void;
  };

  // Footer customization
  showFooter?: boolean;
  footerProps?: FooterProps;

  // Content customization
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';
  containerClassName?: string;
  contentClassName?: string;

  // Layout customization
  withPadding?: boolean;
  fullHeight?: boolean;
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
  none: '',
};

/**
 * PageLayout - Standardized page layout component
 *
 * Features:
 * - Consistent Header + Content + Footer structure
 * - Flexible customization through props
 * - Eliminates layout duplication across pages
 * - Responsive and accessible
 *
 * @example
 * ```tsx
 * <PageLayout
 *   showFooter
 *   footerProps={{ showCTA: true, ctaAction: 'dashboard' }}
 *   maxWidth="7xl"
 * >
 *   <YourPageContent />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  showHeader = true,
  headerProps,
  showFooter = true,
  footerProps,
  maxWidth = '7xl',
  containerClassName,
  contentClassName,
  withPadding = true,
  fullHeight = false,
}: PageLayoutProps) {
  return (
    <div className={cn(
      'flex flex-col',
      fullHeight ? 'min-h-screen' : 'min-h-screen'
    )}>
      {/* Header */}
      {showHeader && <Header {...headerProps} />}

      {/* Main Content */}
      <main className={cn(
        'flex-1',
        containerClassName
      )}>
        <div className={cn(
          'mx-auto',
          maxWidth !== 'none' && maxWidthClasses[maxWidth],
          withPadding && 'px-4 sm:px-6 lg:px-8',
          contentClassName
        )}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && <Footer {...footerProps} />}
    </div>
  );
}

/**
 * PageSection - Reusable section component for consistent spacing
 *
 * @example
 * ```tsx
 * <PageSection className="bg-gray-50">
 *   <SectionContent />
 * </PageSection>
 * ```
 */
export function PageSection({
  children,
  className,
  as: Component = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component className={cn('py-12 sm:py-16 lg:py-20', className)}>
      {children}
    </Component>
  );
}
