import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        "card-institutional hover-lift p-3 sm:p-5 h-full relative overflow-hidden group cursor-pointer transition-all duration-400",
        variant === "gradient" && "bg-bg-elev-2/95 border-0 hover:bg-bg-elev-2/90",
        className,
      )}
      style={variant === "gradient" ? { borderRadius: "calc(1rem - 1px)" } : undefined}
    >
      {/* Scan line effect on hover */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
        initial={{ y: 0 }}
        whileHover={{ y: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      {/* Corner sparkles on hover */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400/0 group-hover:bg-purple-400/60 rounded-full transition-all duration-300 group-hover:scale-150" />
      <div className="absolute bottom-2 left-2 w-1 h-1 bg-orange-400/0 group-hover:bg-orange-400/60 rounded-full transition-all duration-300 group-hover:scale-150 delay-75" />

      <div className="flex flex-col h-full justify-between min-h-[4.5rem] sm:min-h-[5.5rem] relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {Icon && (
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-fg-muted flex-shrink-0 transition-colors duration-300 group-hover:text-purple-400" />
                </motion.div>
              )}
              <p className="text-xs sm:text-sm text-fg-secondary font-medium truncate transition-colors duration-300 group-hover:text-fg-primary">
                {title}
              </p>
            </div>
            <div className="space-y-0.5">
              <motion.h3
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-fg-primary tabular-nums break-words transition-all duration-300 group-hover:text-white"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.h3>
            </div>
          </div>

          {trend && trendValue && (
            <>
              {/* Special gradient badge for "Markets" */}
              {trend === "neutral" && trendValue === "Markets" ? (
                <motion.div
                  className="relative flex-shrink-0 ml-2 px-2.5 py-1 rounded-full overflow-hidden border-0"
                  style={{
                    background: "linear-gradient(135deg, #9945FF 0%, #FF6B35 100%)",
                    boxShadow: "0 0 12px rgba(153,69,255,0.4), 0 0 8px rgba(255,107,53,0.3)",
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(153,69,255,0.6), 0 0 12px rgba(255,107,53,0.5)",
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold text-white relative z-10">
                    {trendValue}
                  </span>
                </motion.div>
              ) : (
                /* Regular trend badges */
                <motion.div
                  className={cn(
                    "text-xs sm:text-sm font-medium flex-shrink-0 ml-2 px-2 py-0.5 rounded-full transition-all duration-300 border-0",
                    trendColors[trend],
                    "group-hover:shadow-[0_0_12px_currentColor]"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {trend === "up" && "↗ "}
                  {trend === "down" && "↘ "}
                  {trendValue}
                </motion.div>
              )}
            </>
          )}
        </div>

        {subtitle && (
          <div className="mt-auto">
            <p className="text-xs sm:text-sm text-fg-muted transition-colors duration-300 group-hover:text-fg-secondary">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  if (variant === "gradient") {
    return (
      <motion.div
        className={cn(
          "relative w-full h-full rounded-2xl p-[1px] shadow-[0_20px_45px_rgba(153,69,255,0.3)] backdrop-blur-sm overflow-hidden group cursor-pointer",
          wrapperClassName,
        )}
        style={{
          background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #FF6B35 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        whileHover={{
          boxShadow: "0 25px 60px rgba(153,69,255,0.5), 0 0 40px rgba(255,107,53,0.3)",
          scale: 1.02,
        }}
        transition={{
          backgroundPosition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 0.3 },
          scale: { duration: 0.3, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {cardBody}
      </motion.div>
    );
  }

  return cardBody;
}
