import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]",
        gradient: "bg-gradient-purple-orange text-white hover:opacity-90 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]",
        solana: "bg-gradient-solana text-white hover:opacity-90 hover:shadow-lg hover:shadow-solana-500/30 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-brand-500/40 bg-transparent text-brand-400 hover:bg-brand-500/10 hover:border-brand-400 hover:text-brand-300",
        secondary: "bg-bg-elev-1 text-fg-primary border border-stroke-line hover:bg-bg-elev-2 hover:border-brand-500/30",
        ghost: "hover:bg-brand-500/10 hover:text-brand-400",
        link: "text-brand-400 underline-offset-4 hover:underline hover:text-brand-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
