import React from "react";
import { cn } from "@/lib/utils";

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

// MagicUI-compatible OrbitingCircles: accepts multiple children and
// distributes them evenly around a single orbit.
export const OrbitingCircles: React.FC<OrbitingCirclesProps> = ({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 160,
  path = true,
}) => {
  const nodes = React.Children.toArray(children ?? []);
  const count = Math.max(nodes.length, 1);

  return (
    <div className={cn("absolute inset-0", className)}>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx="50"
            cy="50"
            r={(radius / 200) * 43} // keep proportion for 100x100 viewBox
            className="stroke-white/10"
            strokeWidth="0.6"
            fill="none"
            strokeDasharray="2 2"
          />
        </svg>
      )}

      {nodes.map((node, index) => {
        const angle = (360 / count) * index;
        return (
          <div
            key={index}
            style={{
              // animation/custom properties for the orbit keyframes
              // @ts-ignore CSS custom properties
              "--duration": duration,
              // @ts-ignore
              "--radius": radius,
              // @ts-ignore
              "--delay": -delay,
              // @ts-ignore
              "--angle": angle,
            } as React.CSSProperties}
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu animate-orbit [animation-duration:calc(var(--duration)*1s)]",
              { "[animation-direction:reverse]": reverse },
            )}
          >
            <div className="flex items-center justify-center">
              {node}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrbitingCircles;


