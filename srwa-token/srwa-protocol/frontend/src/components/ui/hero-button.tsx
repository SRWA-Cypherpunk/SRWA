import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface HeroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'solana' | 'brand';
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * HeroButton - Premium animated button for special CTAs
 *
 * Features:
 * - Animated gradient backgrounds
 * - Pulsing glow effect
 * - Border glow
 * - Shine animation
 * - Smooth hover/tap interactions
 * - Two variants: solana (purple-blue) and brand (purple-orange)
 */
export function HeroButton({
  children,
  onClick,
  variant = 'brand',
  className,
  disabled = false,
  icon,
}: HeroButtonProps) {
  const variants = {
    solana: {
      bg: 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500',
      hoverBg: 'from-purple-500 via-blue-500 to-cyan-400',
      shadow: 'shadow-purple-500/30 hover:shadow-purple-500/50',
      glow: 'shadow-2xl shadow-blue-500/40',
      border: 'border-purple-500/30',
    },
    brand: {
      bg: 'bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500',
      hoverBg: 'from-purple-500 via-orange-500 to-orange-400',
      shadow: 'shadow-purple-500/30 hover:shadow-orange-500/50',
      glow: 'shadow-2xl shadow-orange-500/40',
      border: 'border-purple-500/30',
    },
  };

  const currentVariant = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2.5',
        'px-6 sm:px-8 py-3 sm:py-4',
        'text-sm sm:text-base font-bold text-white',
        'rounded-3xl',
        'overflow-hidden group',
        'transition-all duration-300',
        'border-2',
        currentVariant.border,
        'shadow-lg',
        currentVariant.shadow,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Animated gradient background */}
      <motion.div
        className={cn(
          'absolute inset-0',
          currentVariant.bg
        )}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Hover gradient overlay */}
      <motion.div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100',
          'bg-gradient-to-r',
          currentVariant.hoverBg
        )}
        transition={{ duration: 0.3 }}
      />

      {/* Pulsing glow effect */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-50',
          currentVariant.glow
        )}
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Border glow animation */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: `linear-gradient(45deg, transparent, ${
            variant === 'solana' ? '#4DB2FF' : '#FF6B35'
          }, transparent)`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        initial={{ x: '-200%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        {icon && (
          <motion.span
            className="inline-flex"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Floating particles on hover (subtle) */}
      {!disabled && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: variant === 'solana' ? '#4DB2FF' : '#FF6B35',
                left: `${20 + i * 15}%`,
                top: '50%',
              }}
              animate={{
                y: [-5, -20, -5],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}
