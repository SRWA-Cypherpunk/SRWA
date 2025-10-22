import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { cn } from '@/lib/utils';

export interface GlobeProps {
  className?: string;
  size?: number;
}

/**
 * Globe - Interactive 3D globe component using Cobe
 *
 * Features:
 * - Auto-rotating WebGL globe (5kB library)
 * - Smooth animations with 60 FPS
 * - Responsive sizing
 * - Brand color integration (purple/blue theme)
 * - Markers for global presence
 */
export function Globe({ className, size = 600 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;

    if (!canvasRef.current) return;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.6, 0.7, 1],
      glowColor: [0.4, 0.4, 0.6],
      markers: [
        // North America
        { location: [37.7595, -122.4367], size: 0.05 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.05 },   // New York
        // Europe
        { location: [51.5074, -0.1278], size: 0.05 },   // London
        { location: [48.8566, 2.3522], size: 0.04 },     // Paris
        { location: [52.52, 13.405], size: 0.04 },       // Berlin
        // Asia
        { location: [35.6762, 139.6503], size: 0.05 },  // Tokyo
        { location: [1.3521, 103.8198], size: 0.04 },    // Singapore
        { location: [22.3193, 114.1694], size: 0.04 },   // Hong Kong
        // Australia
        { location: [-33.8688, 151.2093], size: 0.04 }, // Sydney
        // South America
        { location: [-23.5505, -46.6333], size: 0.04 }, // São Paulo
      ],
      onRender: (state) => {
        // Auto-rotation
        state.phi = phi;
        phi += 0.005;

        // Slight vertical wobble for more life
        state.theta = 0.3 + Math.sin(phi * 0.5) * 0.1;

        // Adjust size on window resize
        state.width = size * 2;
        state.height = size * 2;
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [size]);

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          maxWidth: '100%',
          aspectRatio: '1',
        }}
        className="opacity-80"
      />

      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(153,69,255,0.6) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
