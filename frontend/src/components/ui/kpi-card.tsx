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
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className 
}: KPICardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-fg-muted"
  };

  return (
    <Card className={cn("card-institutional hover-lift p-4 sm:p-6 h-32 sm:h-36", className)}>
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
}