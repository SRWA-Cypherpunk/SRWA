import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';
  withPadding?: boolean;
  as?: keyof JSX.IntrinsicElements;
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
 * Container - Responsive container component with consistent spacing
 *
 * Features:
 * - Configurable max-width
 * - Optional padding
 * - Centered content
 * - Supports custom HTML element
 *
 * @example
 * ```tsx
 * <Container maxWidth="7xl">
 *   <YourContent />
 * </Container>
 * ```
 */
export function Container({
  children,
  className,
  maxWidth = '7xl',
  withPadding = true,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        maxWidth !== 'none' && maxWidthClasses[maxWidth],
        withPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Section - Wrapper for page sections with consistent vertical spacing
 *
 * @example
 * ```tsx
 * <Section className="bg-gray-50">
 *   <Container>
 *     <SectionContent />
 *   </Container>
 * </Section>
 * ```
 */
export function Section({
  children,
  className,
  withPadding = true,
  as: Component = 'section',
}: {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component
      className={cn(
        withPadding && 'py-12 sm:py-16 lg:py-20',
        className
      )}
    >
      {children}
    </Component>
  );
}
