import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types for different metric card variants
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  tooltip?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  highlightColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  tooltip,
  icon,
  variant = 'default',
  size = 'md',
  className,
  prefix,
  suffix,
  loading = false,
  highlightColor = 'primary',
}) => {
  // Size-based styles
  const sizeStyles = {
    sm: {
      card: 'p-3',
      title: 'text-xs',
      value: 'text-lg',
      subtitle: 'text-xs',
      icon: 'w-4 h-4',
    },
    md: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      card: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-base',
      icon: 'w-6 h-6',
    },
  };

  // Variant-based styles
  const variantStyles = {
    default: 'bg-bg-elevated border border-border-secondary',
    glass: 'bg-black/40 backdrop-blur-md border border-brand-500/20',
    gradient: `bg-gradient-to-br ${
      highlightColor === 'primary' ? 'from-brand-500/10 to-transparent' :
      highlightColor === 'secondary' ? 'from-green-500/10 to-transparent' :
      highlightColor === 'success' ? 'from-green-500/10 to-transparent' :
      highlightColor === 'warning' ? 'from-orange-500/10 to-transparent' :
      highlightColor === 'error' ? 'from-red-500/10 to-transparent' :
      'from-blue-500/10 to-transparent'
    } border border-brand-500/20`,
    bordered: 'bg-transparent border-2 border-brand-500/30',
  };

  // Trend colors
  const trendColorClass = trend?.direction === 'up'
    ? 'text-green-400'
    : trend?.direction === 'down'
    ? 'text-red-400'
    : 'text-fg-muted';

  // Trend icon
  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
    ? TrendingDown
    : Minus;

  // Highlight color for value
  const valueColorClass = {
    primary: 'text-brand-400',
    secondary: 'text-green-400',
    success: 'text-green-400',
    warning: 'text-orange-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }[highlightColor];

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200 hover:shadow-card-hover',
        variantStyles[variant],
        sizeStyles[size].card,
        className
      )}
    >
      {/* Header with title and tooltip */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn('text-fg-muted', sizeStyles[size].icon)}>
              {icon}
            </div>
          )}
          <span className={cn('font-medium text-fg-muted', sizeStyles[size].title)}>
            {title}
          </span>
        </div>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={cn('text-fg-muted cursor-help', sizeStyles[size].icon)} />
              </TooltipTrigger>
              <TooltipContent className="bg-bg-elev-2 border-brand-500/30">
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Value Section */}
      <div className="flex items-baseline gap-2">
        {loading ? (
          <div className="animate-pulse">
            <div className={cn('h-8 w-24 bg-bg-elev-2 rounded',
              size === 'sm' && 'h-6 w-20',
              size === 'lg' && 'h-10 w-32'
            )} />
          </div>
        ) : (
          <>
            {prefix && (
              <span className={cn('font-semibold', sizeStyles[size].value, valueColorClass)}>
                {prefix}
              </span>
            )}
            <span className={cn('font-bold', sizeStyles[size].value, valueColorClass)}>
              {value}
            </span>
            {suffix && (
              <span className={cn('font-semibold text-fg-muted', sizeStyles[size].subtitle)}>
                {suffix}
              </span>
            )}
          </>
        )}
      </div>

      {/* Subtitle or Trend Section */}
      <div className="mt-2 flex items-center justify-between">
        {subtitle && (
          <span className={cn('text-fg-muted', sizeStyles[size].subtitle)}>
            {subtitle}
          </span>
        )}

        {trend && !loading && (
          <div className={cn('flex items-center gap-1', trendColorClass)}>
            <TrendIcon className={sizeStyles[size].icon} />
            <span className={cn('font-medium', sizeStyles[size].subtitle)}>
              {trend.value}%
            </span>
            {trend.period && (
              <span className={cn('text-fg-muted ml-1', sizeStyles[size].subtitle)}>
                {trend.period}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Compound components for more complex metric displays
export const MetricCardGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  );
};

// Hero Metric Card for important KPIs
export const HeroMetricCard: React.FC<MetricCardProps & {
  chart?: React.ReactNode;
}> = ({ chart, ...props }) => {
  return (
    <div className="relative">
      <MetricCard {...props} size="lg" variant="glass" />
      {chart && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {chart}
        </div>
      )}
    </div>
  );
};

// Compact Metric for inline displays
export const CompactMetric: React.FC<{
  label: string;
  value: string | number;
  className?: string;
  highlightColor?: MetricCardProps['highlightColor'];
}> = ({ label, value, className, highlightColor = 'primary' }) => {
  const valueColorClass = {
    primary: 'text-brand-400',
    secondary: 'text-green-400',
    success: 'text-green-400',
    warning: 'text-orange-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }[highlightColor];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-fg-muted">{label}:</span>
      <span className={cn('text-sm font-semibold', valueColorClass)}>{value}</span>
    </div>
  );
};

export default MetricCard;