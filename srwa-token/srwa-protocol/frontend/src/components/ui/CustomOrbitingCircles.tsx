import React from "react";
import { cn } from "@/lib/utils";

interface CustomOrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

export const CustomOrbitingCircles: React.FC<CustomOrbitingCirclesProps> = ({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 160,
  path = true,
}) => {
  const nodes = React.Children.toArray(children ?? []);
  const count = Math.max(nodes.length, 1);

  // Calculate the angle for each child if multiple children
  const angleStep = 360 / count;

  return (
    <div className={cn("absolute inset-0", className)}>
      {/* Optional path circle */}
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
            r={(radius / 200) * 43}
            className="stroke-white/10"
            strokeWidth="0.6"
            fill="none"
            strokeDasharray="2 2"
          />
        </svg>
      )}

      {/* Orbiting elements */}
      {nodes.map((node, index) => {
        const initialAngle = count > 1 ? angleStep * index : 0;
        
        return (
          <div
            key={index}
            className="absolute left-1/2 top-1/2"
            style={{
              animation: `${reverse ? 'orbit-reverse' : 'orbit'} ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              transform: `translate(-50%, -50%) rotate(${initialAngle}deg)`,
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                transform: `translateX(${radius}px) rotate(${reverse ? initialAngle : -initialAngle}deg)`,
              }}
            >
              {node}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomOrbitingCircles;
