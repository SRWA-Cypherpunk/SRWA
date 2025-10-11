import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-500 text-white hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30",
        gradient: "border-transparent bg-gradient-purple-orange text-white hover:opacity-90 hover:shadow-md hover:shadow-brand-500/30",
        solana: "border-transparent bg-gradient-solana text-white hover:opacity-90 hover:shadow-md hover:shadow-solana-500/30",
        secondary: "border-transparent bg-bg-elev-1 text-fg-primary hover:bg-bg-elev-2 border border-stroke-line",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-brand-400 border-brand-500/40 hover:bg-brand-500/10 hover:border-brand-400",
        success: "border-transparent bg-solana-500 text-white hover:bg-solana-400",
        orange: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
