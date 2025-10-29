import { DashboardLayout, DashboardSection } from "@/components/layout";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AdminPanel } from "@/components/srwa/AdminPanel";
import { AdminAllowlistPanel } from "@/components/srwa/AdminAllowlistPanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const pieColors = ['#9945FF', '#A855F7', '#FF6B35', '#EC4899', '#8B5CF6', '#F59E0B'];

export default function DashboardAdmin() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-base sm:text-lg text-fg-secondary mt-2">
            Manage token requests, allowlist, and view market analytics
          </p>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Admin Content */}
      <DashboardSection decorativeColor="purple">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="requests">Token Requests</TabsTrigger>
            <TabsTrigger value="allowlist">Admin Allowlist</TabsTrigger>
            <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="allowlist">
            <AdminAllowlistPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-micro text-fg-muted uppercase">Total Value</p>
                    <div className="flex items-center gap-2">
                      <p className="text-h3 font-semibold text-fg-primary">$7.49B</p>
                      <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">+0.58%</Badge>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-micro text-fg-muted uppercase">Avg. Yield to Maturity</p>
                    <p className="text-h3 font-semibold text-fg-primary">4.12%</p>
                  </div>
                </Card>
                <Card className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-micro text-fg-muted uppercase">Total Assets</p>
                    <p className="text-h3 font-semibold text-fg-primary">49</p>
                  </div>
                </Card>
                <Card className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-micro text-fg-muted uppercase">Holders</p>
                    <div className="flex items-center gap-2">
                      <p className="text-h3 font-semibold text-fg-primary">53,049</p>
                      <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">+0.26%</Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 lg:col-span-2 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h3 font-medium text-fg-primary">Total RWA Value</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9945FF" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax+0.5"]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid rgba(153, 69, 255, 0.3)',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#9945FF" strokeWidth={2} fill="url(#areaFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 card-institutional rounded-lg border border-purple-500/20 bg-card hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
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
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid rgba(153, 69, 255, 0.3)',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </DashboardLayout>
  );
}
