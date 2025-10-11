import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ 
  children, 
  className,
  shimmerColor = "brand-500"
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};
