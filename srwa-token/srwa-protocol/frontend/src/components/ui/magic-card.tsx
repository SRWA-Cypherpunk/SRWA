import React from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MagicCard: React.FC<MagicCardProps> = ({ children, className, style }) => {
  return (
    <div
      className={cn(
        "relative group/card overflow-hidden rounded-xl border border-stroke-line bg-card p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10",
        className
      )}
      style={style}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-brand-500/20 via-brand-500/40 to-brand-500/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
