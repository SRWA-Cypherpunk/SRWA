import React from 'react';
import { cn } from '@/lib/utils';

interface PageBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
}

/**
 * PageBackground Component
 * Provides sophisticated gradient backgrounds inspired by the landing page
 * Deep black base with subtle purple/orange gradient overlays
 */
export function PageBackground({
  children,
  className,
  variant = 'default'
}: PageBackgroundProps) {
  return (
    <div className={cn('min-h-screen bg-background overflow-x-hidden relative', className)}>
      {/* Master Background Gradient Container */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* SVG Noise Overlay for anti-banding (subtle) */}
        <svg className="absolute inset-0 opacity-[0.012] pointer-events-none w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        {/* Main Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: variant === 'subtle' ? `
              linear-gradient(
                to bottom,
                #0A0A0A 0%,
                #0B0A0C 10%,
                #0D0B0E 20%,
                #0F0C0F 30%,
                #110D12 40%,
                #130E14 50%,
                #110D12 60%,
                #0F0C0F 70%,
                #0D0B0E 80%,
                #0B0A0C 90%,
                #0A0A0A 100%
              )
            ` : variant === 'vibrant' ? `
              linear-gradient(
                to bottom,
                #0A0A0A 0%,
                #0D0B0E 15%,
                #110D14 30%,
                rgba(25,17,29,0.95) 45%,
                rgba(34,21,38,0.90) 50%,
                rgba(25,17,29,0.95) 55%,
                #110D14 70%,
                #0D0B0E 85%,
                #0A0A0A 100%
              )
            ` : `
              linear-gradient(
                to bottom,
                #0A0A0A 0%,
                #0A0A0A 5%,
                #0B0A0C 15%,
                #0C0B0D 25%,
                #0E0C0F 35%,
                #100D12 45%,
                #110D14 50%,
                #100D12 55%,
                #0E0C0F 65%,
                #0C0B0D 75%,
                #0B0A0C 85%,
                #0A0A0A 95%,
                #0A0A0A 100%
              )
            `,
          }}
        />

        {/* Purple Radial Gradient Overlay (Top Right) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 50% at 90% 0%,
                rgba(153,69,255,0.08),
                transparent 40%
              )
            `,
          }}
        />

        {/* Orange Radial Gradient Overlay (Bottom Left) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 60% 40% at 10% 100%,
                rgba(255,107,53,0.06),
                transparent 35%
              )
            `,
          }}
        />

        {/* Center Purple Glow (Subtle) */}
        {variant === 'vibrant' && (
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at 50% 50%,
                  rgba(153,69,255,0.04),
                  transparent 50%
                )
              `,
            }}
          />
        )}

        {/* Mesh Grid Pattern (Very Subtle) */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(153,69,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(153,69,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Floating Particles (Optional - for vibrant variant) */}
        {variant === 'vibrant' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
                style={{
                  background: i % 2 === 0 ? 'rgba(153,69,255,0.3)' : 'rgba(255,107,53,0.3)',
                  left: `${15 + Math.random() * 70}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default PageBackground;