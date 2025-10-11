import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  count?: number;
  color?: string;
}

export const Particles: React.FC<ParticlesProps> = ({ 
  className, 
  count = 50,
  color = "brand-500"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      element: HTMLDivElement;
    }> = [];

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = cn(
        "absolute rounded-full bg-brand-500/20 pointer-events-none",
        `w-1 h-1`
      );
      
      const x = Math.random() * container.offsetWidth;
      const y = Math.random() * container.offsetHeight;
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;
      const size = Math.random() * 2 + 1;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      container.appendChild(particle);

      particles.push({
        x,
        y,
        vx,
        vy,
        size,
        element: particle,
      });
    }

    // Animation loop
    const animate = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > container.offsetWidth) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > container.offsetHeight) {
          particle.vy *= -1;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(container.offsetWidth, particle.x));
        particle.y = Math.max(0, Math.min(container.offsetHeight, particle.y));

        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      particles.forEach((particle) => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
    };
  }, [count, color]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    />
  );
};
