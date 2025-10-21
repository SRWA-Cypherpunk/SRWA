import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketChartProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  data: { time: string; value: number; volume?: number }[];
  type?: "line" | "area";
  color?: string;
}

export function MarketChart({ 
  title, 
  value, 
  change, 
  changeType, 
  data, 
  type = "area",
  color = "#4DB2FF" 
}: MarketChartProps) {
  const chartColor = changeType === "up" ? "#10B981" : changeType === "down" ? "#EF4444" : color;
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-stroke-line rounded-lg p-3 shadow-lg">
          <p className="text-micro text-fg-muted">{`Time: ${label}`}</p>
          <p className="text-body-2 text-fg-primary">
            {`Value: ${payload[0].value.toFixed(2)}%`}
          </p>
          {payload[0].payload.volume && (
            <p className="text-micro text-fg-secondary">
              {`Volume: $${(payload[0].payload.volume / 1000000).toFixed(1)}M`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const TrendIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card className="card-institutional hover-lift h-full p-0 overflow-hidden border-brand-500/20 mobile-full-width">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-h3 font-semibold text-fg-primary mb-1 truncate">{title}</h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-h2 font-semibold text-fg-primary tabular-nums">{value}</span>
                <Badge 
                  variant="outline" 
                  className={`text-micro ${
                    changeType === "up" 
                      ? "text-green-400 border-green-500/30 bg-green-500/10" 
                      : changeType === "down"
                      ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : "text-fg-muted border-stroke-line bg-card"
                  }`}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {change}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-28 sm:h-32 px-4 sm:px-6 pb-4 sm:pb-6">
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  hide 
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  fillOpacity={1}
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <XAxis 
                  dataKey="time" 
                  hide 
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: chartColor }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}