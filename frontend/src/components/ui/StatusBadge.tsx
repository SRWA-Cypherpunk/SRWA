import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Clock,
  Lock,
  Unlock,
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  Building2,
  FileText,
  Home
} from 'lucide-react';

// Types for different badge variants
export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  pulse = false,
  glow = false,
  className,
}) => {
  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-bg-elev-2 text-fg-secondary border-brand-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-bg-elev-1 text-fg-muted border-border-secondary',
  };

  // Glow effect styles
  const glowStyles = {
    success: 'shadow-glow-green',
    warning: 'shadow-glow-orange',
    error: 'shadow-glow-red',
    info: 'shadow-glow-blue',
    default: 'shadow-glow-purple',
    neutral: '',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        sizeStyles[size],
        variantStyles[variant],
        glow && glowStyles[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

// Asset Class Badge
export const AssetClassBadge: React.FC<{
  type: 'T-Bills' | 'Receivables' | 'CRE' | 'Debentures' | 'FIDC';
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ type, size = 'sm', className }) => {
  const config = {
    'T-Bills': {
      icon: <DollarSign className="w-3 h-3" />,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    'Receivables': {
      icon: <FileText className="w-3 h-3" />,
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    },
    'CRE': {
      icon: <Home className="w-3 h-3" />,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    'Debentures': {
      icon: <Building2 className="w-3 h-3" />,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    'FIDC': {
      icon: <Shield className="w-3 h-3" />,
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    },
  };

  const { icon, color } = config[type] || config['T-Bills'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border px-2.5 py-1 text-sm',
        color,
        className
      )}
    >
      {icon}
      {type}
    </span>
  );
};

// Risk Level Badge
export const RiskBadge: React.FC<{
  level: 'low' | 'medium' | 'high' | 'experimental';
  showLabel?: boolean;
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ level, showLabel = true, size = 'sm', className }) => {
  const config = {
    low: {
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      label: 'Low Risk',
      icon: <Shield className="w-3 h-3" />,
    },
    medium: {
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      label: 'Medium Risk',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    high: {
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      label: 'High Risk',
      icon: <XCircle className="w-3 h-3" />,
    },
    experimental: {
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
      label: 'Experimental',
      icon: <Activity className="w-3 h-3" />,
    },
  };

  // Validate level and provide fallback
  const validLevel = config[level] ? level : 'medium';
  const { color, label, icon } = config[validLevel];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border px-2.5 py-1 text-sm',
        color,
        className
      )}
    >
      {icon}
      {showLabel && label}
    </span>
  );
};

// Phase Badge for Offering Phases
export const PhaseBadge: React.FC<{
  phase: 'Draft' | 'PreOffer' | 'OfferOpen' | 'OfferLocked' | 'OfferClosed' | 'Settlement' | 'Refund';
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ phase, size = 'sm', className }) => {
  const config = {
    Draft: { icon: <FileText className="w-3 h-3" />, variant: 'neutral' as const },
    PreOffer: { icon: <Clock className="w-3 h-3" />, variant: 'info' as const },
    OfferOpen: { icon: <Unlock className="w-3 h-3" />, variant: 'success' as const },
    OfferLocked: { icon: <Lock className="w-3 h-3" />, variant: 'warning' as const },
    OfferClosed: { icon: <XCircle className="w-3 h-3" />, variant: 'error' as const },
    Settlement: { icon: <CheckCircle2 className="w-3 h-3" />, variant: 'success' as const },
    Refund: { icon: <AlertCircle className="w-3 h-3" />, variant: 'warning' as const },
  };

  const { icon, variant } = config[phase] || config.Draft;

  return (
    <StatusBadge variant={variant} size={size} icon={icon} className={className}>
      {phase.replace(/([A-Z])/g, ' $1').trim()}
    </StatusBadge>
  );
};

// Compliance Badge
export const ComplianceBadge: React.FC<{
  type: 'KYC Required' | 'Accredited Only' | 'Institutional' | 'Open';
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ type, size = 'sm', className }) => {
  const config = {
    'KYC Required': {
      icon: <Shield className="w-3 h-3" />,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    'Accredited Only': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    'Institutional': {
      icon: <Building2 className="w-3 h-3" />,
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    },
    'Open': {
      icon: <Unlock className="w-3 h-3" />,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  };

  const { icon, color } = config[type] || config['Open'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border px-2.5 py-1 text-sm',
        color,
        className
      )}
    >
      {icon}
      {type}
    </span>
  );
};

// Yield Badge with APY display
export const YieldBadge: React.FC<{
  apy: number;
  trending?: 'up' | 'down' | 'stable';
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ apy, trending, size = 'sm', className }) => {
  const TrendIcon = trending === 'up' ? TrendingUp :
                     trending === 'down' ? TrendingDown :
                     Activity;

  const trendColor = trending === 'up' ? 'text-green-400' :
                      trending === 'down' ? 'text-red-400' :
                      'text-fg-muted';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        'bg-gradient-to-r from-brand-500/10 to-transparent',
        'text-brand-400 border-brand-500/20',
        'px-3 py-1 text-sm',
        className
      )}
    >
      <span className="font-bold">{apy.toFixed(2)}%</span>
      <span className="text-xs opacity-80">APY</span>
      {trending && (
        <TrendIcon className={cn('w-3 h-3', trendColor)} />
      )}
    </span>
  );
};

// Network Badge for multi-chain display
export const NetworkBadge: React.FC<{
  network: 'Solana' | 'Ethereum' | 'Polygon' | 'Arbitrum';
  size?: StatusBadgeProps['size'];
  className?: string;
}> = ({ network, size = 'sm', className }) => {
  const colors = {
    Solana: 'bg-gradient-to-r from-primary-100 to-secondary-100 text-white',
    Ethereum: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue',
    Polygon: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-500',
    Arbitrum: 'bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border-0',
        'px-2.5 py-1 text-xs',
        colors[network],
        className
      )}
    >
      {network}
    </span>
  );
};

// Status Indicator Dot
export const StatusDot: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}> = ({ status, size = 'sm', pulse = false, className }) => {
  const sizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    active: 'bg-green-400',
    inactive: 'bg-fg-muted',
    pending: 'bg-orange-400',
    error: 'bg-red-400',
  };

  return (
    <span className={cn('relative inline-flex', className)}>
      {pulse && status === 'active' && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            statusColors[status]
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full',
          sizeStyles[size],
          statusColors[status]
        )}
      />
    </span>
  );
};

export default StatusBadge;