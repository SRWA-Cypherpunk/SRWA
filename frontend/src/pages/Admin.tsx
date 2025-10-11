import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const lineData = [
  { date: "1/23", value: 0.8 },
  { date: "4/23", value: 1.2 },
  { date: "7/23", value: 1.9 },
  { date: "10/23", value: 2.7 },
  { date: "1/24", value: 3.2 },
  { date: "4/24", value: 3.9 },
  { date: "7/24", value: 4.6 },
  { date: "10/24", value: 1.3 },
  { date: "1/25", value: 6.1 },
  { date: "4/25", value: 6.7 },
  { date: "7/25", value: 7.2 },
];

const pieData = [
  { name: "Private Equity", value: 5300 },
  { name: "US Treasury Debt", value: 507 },
  { name: "non-US Government Debt", value: 304 },
  { name: "Institutional", value: 426 },
  { name: "Comodities", value: 179 },
  { name: "Private Credit", value: 275 },
];

const pieColors = ["#60A5FA", "#34D399", "#F59E0B", "#F97316", "#A78BFA", "#94A3B8"];

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-h1 font-semibold text-fg-primary">RWA Dashboard</h1>
            <p className="text-body-1 text-fg-secondary">Tokenized Treasuries overview and market metrics.</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase">Total Value</p>
              <div className="flex items-center gap-2">
                <p className="text-h3 font-semibold text-fg-primary">$7.49B</p>
                <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">+0.58%</Badge>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase">Avg. Yield to Maturity</p>
              <p className="text-h3 font-semibold text-fg-primary">4.12%</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase">Total Assets</p>
              <p className="text-h3 font-semibold text-fg-primary">49</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-1">
              <p className="text-micro text-fg-muted uppercase">Holders</p>
              <div className="flex items-center gap-2">
                <p className="text-h3 font-semibold text-fg-primary">53,049</p>
                <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">+0.26%</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-medium text-fg-primary">Total RWA Value</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax+0.5"]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#60A5FA" strokeWidth={2} fill="url(#areaFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-medium text-fg-primary">Market Caps</h3>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={24} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}