/**
 * CSS Class Name Utilities
 * Functions for combining, manipulating, and conditionally applying CSS classes
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with Tailwind CSS conflict resolution
 * Merges classes and resolves Tailwind CSS conflicts intelligently
 *
 * @param inputs - Class names to combine (strings, objects, arrays)
 * @returns Merged class name string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', { 'text-blue-500': true }) // 'text-blue-500'
 * cn('bg-white', undefined, 'text-black') // 'bg-white text-black'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Conditionally apply a class name
 * @param className - Class name to apply
 * @param condition - Condition to check
 * @returns Class name if condition is true, empty string otherwise
 *
 * @example
 * conditionalClass('active', isActive) // 'active' or ''
 * conditionalClass('text-red-500', hasError) // 'text-red-500' or ''
 */
export function conditionalClass(className: string, condition: boolean): string {
  return condition ? className : '';
}

/**
 * Apply classes based on a variant mapping
 * @param variants - Object mapping variant names to class names
 * @param activeVariant - Currently active variant
 * @param baseClasses - Base classes to always apply
 * @returns Combined class names
 *
 * @example
 * variantClass(
 *   { primary: 'bg-purple-500', secondary: 'bg-gray-500' },
 *   'primary',
 *   'px-4 py-2'
 * ) // 'px-4 py-2 bg-purple-500'
 */
export function variantClass<T extends string>(
  variants: Record<T, string>,
  activeVariant: T,
  baseClasses = ''
): string {
  return cn(baseClasses, variants[activeVariant]);
}

/**
 * Apply classes based on multiple state conditions
 * @param baseClasses - Base classes to always apply
 * @param stateClasses - Object mapping state names to classes and conditions
 * @returns Combined class names
 *
 * @example
 * stateClass('button', {
 *   hover: { classes: 'hover:bg-gray-700', condition: true },
 *   disabled: { classes: 'opacity-50 cursor-not-allowed', condition: isDisabled }
 * })
 */
export function stateClass(
  baseClasses: string,
  stateClasses: Record<string, { classes: string; condition: boolean }>
): string {
  const activeStates = Object.entries(stateClasses)
    .filter(([, { condition }]) => condition)
    .map(([, { classes }]) => classes);

  return cn(baseClasses, ...activeStates);
}

/**
 * Create focus ring classes for accessibility
 * @param color - Focus ring color (Tailwind color)
 * @param width - Focus ring width (1-4)
 * @returns Focus ring class names
 *
 * @example
 * focusRing('purple-500') // 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
 * focusRing('blue-400', 3) // 'focus:outline-none focus:ring-3 focus:ring-blue-400 focus:ring-offset-2'
 */
export function focusRing(color = 'purple-500', width = 2): string {
  return `focus:outline-none focus:ring-${width} focus:ring-${color} focus:ring-offset-2`;
}

/**
 * Create hover classes for interactive elements
 * @param baseColor - Base color
 * @param hoverColor - Hover color
 * @returns Hover class names
 *
 * @example
 * hoverClass('bg-purple-500', 'bg-purple-600') // 'bg-purple-500 hover:bg-purple-600 transition-colors'
 */
export function hoverClass(baseColor: string, hoverColor: string): string {
  return cn(baseColor, `hover:${hoverColor}`, 'transition-colors');
}

/**
 * Create responsive class names
 * @param mobile - Mobile classes
 * @param tablet - Tablet classes (md breakpoint)
 * @param desktop - Desktop classes (lg breakpoint)
 * @returns Responsive class names
 *
 * @example
 * responsiveClass('text-sm', 'text-base', 'text-lg')
 * // 'text-sm md:text-base lg:text-lg'
 */
export function responsiveClass(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
}

/**
 * Create grid column classes
 * @param cols - Number of columns (1-12)
 * @param gap - Gap between columns
 * @returns Grid class names
 *
 * @example
 * gridCols(3) // 'grid grid-cols-3'
 * gridCols(4, 'gap-4') // 'grid grid-cols-4 gap-4'
 */
export function gridCols(cols: number, gap?: string): string {
  return cn('grid', `grid-cols-${cols}`, gap);
}

/**
 * Create flex layout classes
 * @param direction - Flex direction
 * @param align - Align items
 * @param justify - Justify content
 * @param gap - Gap between items
 * @returns Flex class names
 *
 * @example
 * flexLayout('row', 'center', 'between') // 'flex flex-row items-center justify-between'
 * flexLayout('col', 'start', 'start', 'gap-4') // 'flex flex-col items-start justify-start gap-4'
 */
export function flexLayout(
  direction: 'row' | 'col' = 'row',
  align: 'start' | 'center' | 'end' | 'stretch' = 'center',
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start',
  gap?: string
): string {
  return cn(
    'flex',
    `flex-${direction}`,
    `items-${align}`,
    `justify-${justify}`,
    gap
  );
}

/**
 * Create text classes with responsive sizing
 * @param baseSize - Base text size
 * @param weight - Font weight
 * @param color - Text color
 * @returns Text class names
 *
 * @example
 * textClass('text-lg', 'font-semibold', 'text-white')
 * // 'text-lg font-semibold text-white'
 */
export function textClass(
  baseSize: string,
  weight?: string,
  color?: string
): string {
  return cn(baseSize, weight, color);
}

/**
 * Create button variant classes
 * @param variant - Button variant
 * @param size - Button size
 * @returns Button class names
 *
 * @example
 * buttonVariant('primary', 'md')
 * // 'bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg'
 */
export function buttonVariant(
  variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const variants = {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'hover:bg-gray-800 text-gray-300',
    outline: 'border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-purple-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return cn(
    'rounded-lg transition-colors font-medium',
    variants[variant],
    sizes[size],
    focusRing()
  );
}

/**
 * Create card classes with optional variants
 * @param variant - Card variant
 * @param interactive - Whether card is interactive (hoverable)
 * @returns Card class names
 *
 * @example
 * cardClass('default', true)
 * // 'bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors'
 */
export function cardClass(
  variant: 'default' | 'elevated' | 'outlined' = 'default',
  interactive = false
): string {
  const variants = {
    default: 'bg-gray-900 border border-gray-800',
    elevated: 'bg-gray-900 shadow-xl',
    outlined: 'border-2 border-gray-700',
  };

  return cn(
    'rounded-lg p-6',
    variants[variant],
    interactive && 'hover:border-purple-500 transition-colors cursor-pointer'
  );
}

/**
 * Create input field classes
 * @param error - Whether input has an error
 * @param disabled - Whether input is disabled
 * @returns Input class names
 *
 * @example
 * inputClass(false, false)
 * // 'bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500'
 */
export function inputClass(error = false, disabled = false): string {
  return cn(
    'bg-gray-900 border rounded-lg px-4 py-2 text-white transition-colors',
    error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-purple-500',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && focusRing()
  );
}

/**
 * Create badge classes
 * @param variant - Badge variant
 * @param size - Badge size
 * @returns Badge class names
 *
 * @example
 * badgeClass('success', 'sm')
 * // 'bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 text-xs rounded-full'
 */
export function badgeClass(
  variant: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const variants = {
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return cn('border rounded-full font-medium', variants[variant], sizes[size]);
}

/**
 * Create transition classes
 * @param property - CSS property to transition
 * @param duration - Duration (default, fast, slow)
 * @returns Transition class names
 *
 * @example
 * transitionClass('all') // 'transition-all duration-200'
 * transitionClass('colors', 'fast') // 'transition-colors duration-150'
 */
export function transitionClass(
  property: 'all' | 'colors' | 'opacity' | 'transform' = 'all',
  duration: 'fast' | 'default' | 'slow' = 'default'
): string {
  const durations = {
    fast: 'duration-150',
    default: 'duration-200',
    slow: 'duration-300',
  };

  return cn(`transition-${property}`, durations[duration]);
}
