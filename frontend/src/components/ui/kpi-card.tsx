import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  variant?: "default" | "gradient";
  wrapperClassName?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className,
  variant = "default",
  wrapperClassName,
}: KPICardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-fg-muted"
  };

  const cardBody = (
    <Card
      className={cn(
        "card-institutional hover-lift p-4 sm:p-6",
        variant === "gradient" ? "h-28 sm:h-32" : "h-32 sm:h-36",
        variant === "gradient" && "bg-bg-elev-2/95 border border-transparent rounded-[1.4rem]",
        className,
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-fg-muted flex-shrink-0" />}
              <p className="text-xs sm:text-body-2 text-fg-secondary font-medium truncate">{title}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl lg:text-h2 font-semibold text-fg-primary tabular-nums break-words">
                {value}
              </h3>
            </div>
          </div>
          
          {trend && trendValue && (
            <div className={cn("text-xs sm:text-micro font-medium flex-shrink-0 ml-2", trendColors[trend])}>
              {trend === "up" && "↗ "}
              {trend === "down" && "↘ "}
              {trendValue}
            </div>
          )}
        </div>
        
        {subtitle && (
          <div className="mt-auto">
            <p className="text-xs sm:text-micro text-fg-muted">{subtitle}</p>
          </div>
        )}
      </div>
    </Card>
  );

  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "relative w-full max-w-[18rem] sm:max-w-xs rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500 p-[1px] shadow-[0_20px_45px_rgba(153,69,255,0.3)] backdrop-blur-sm overflow-hidden",
          wrapperClassName,
        )}
      >
        {cardBody}
      </div>
    );
  }

  return cardBody;
}
