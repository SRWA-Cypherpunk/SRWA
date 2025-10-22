import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface SolanaBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "purple" | "gradient" | "solana" | "orange";
  showIcon?: boolean;
}

/**
 * SolanaBadge - Badge component específico para tema Solana
 * Com cores roxo/laranja/verde do ecossistema Solana
 */
export function SolanaBadge({
  variant = "gradient",
  showIcon = false,
  className,
  children,
  ...props
}: SolanaBadgeProps) {
  const badgeVariants = {
    purple: "gradient",
    gradient: "gradient",
    solana: "solana",
    orange: "orange",
  };

  return (
    <Badge
      variant={badgeVariants[variant] as any}
      className={cn("gap-1.5", className)}
      {...props}
    >
      {showIcon && (
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </Badge>
  );
}

/**
 * StatusBadge - Badge para status de compliance, transações, etc
 */
interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "active" | "pending" | "success" | "error" | "compliant" | "non-compliant";
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: "solana" as const, text: "Active", showDot: true },
    pending: { variant: "secondary" as const, text: "Pending", showDot: true },
    success: { variant: "success" as const, text: "Success", showDot: false },
    error: { variant: "destructive" as const, text: "Error", showDot: false },
    compliant: { variant: "success" as const, text: "Compliant", showDot: true },
    "non-compliant": { variant: "destructive" as const, text: "Non-Compliant", showDot: false },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)} {...props}>
      {config.showDot && (
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      )}
      {children || config.text}
    </Badge>
  );
}
