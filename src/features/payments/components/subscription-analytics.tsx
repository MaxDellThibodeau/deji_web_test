"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

// Sample data - in a real app, this would come from an API
const subscriptionData = [
  { month: "Jan", basic: 120, pro: 80, premium: 40, total: 240 },
  { month: "Feb", basic: 130, pro: 90, premium: 45, total: 265 },
  { month: "Mar", basic: 140, pro: 100, premium: 50, total: 290 },
  { month: "Apr", basic: 135, pro: 110, premium: 55, total: 300 },
  { month: "May", basic: 145, pro: 120, premium: 60, total: 325 },
  { month: "Jun", basic: 150, pro: 130, premium: 70, total: 350 },
]

const revenueData = [
  { month: "Jan", basic: 1200, pro: 1600, premium: 1200, total: 4000 },
  { month: "Feb", basic: 1300, pro: 1800, premium: 1350, total: 4450 },
  { month: "Mar", basic: 1400, pro: 2000, premium: 1500, total: 4900 },
  { month: "Apr", basic: 1350, pro: 2200, premium: 1650, total: 5200 },
  { month: "May", basic: 1450, pro: 2400, premium: 1800, total: 5650 },
  { month: "Jun", basic: 1500, pro: 2600, premium: 2100, total: 6200 },
]

const churnData = [
  { month: "Jan", rate: 3.2 },
  { month: "Feb", rate: 2.8 },
  { month: "Mar", rate: 2.5 },
  { month: "Apr", rate: 2.7 },
  { month: "May", rate: 2.4 },
  { month: "Jun", rate: 2.2 },
]

const planDistribution = [
  { name: "Basic", value: 150, color: "#4f46e5" },
  { name: "Pro", value: 130, color: "#8b5cf6" },
  { name: "Premium", value: 70, color: "#ec4899" },
]

const COLORS = ["#4f46e5", "#8b5cf6", "#ec4899"]

export function SubscriptionAnalytics() {
  const [timeframe, setTimeframe] = useState("6m")

  return (
    <Card className="w-full bg-card border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Subscription Analytics</CardTitle>
            <CardDescription>Monitor your subscription business metrics</CardDescription>
          </div>
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Subscribers</div>
                  <div className="text-2xl font-bold">350</div>
                  <div className="text-xs text-emerald-500">↑ 8% from last month</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  <div className="text-2xl font-bold">$6,200</div>
                  <div className="text-xs text-emerald-500">↑ 10% from last month</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Churn Rate</div>
                  <div className="text-2xl font-bold">2.2%</div>
                  <div className="text-xs text-emerald-500">↓ 0.2% from last month</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Avg. Revenue Per User</div>
                  <div className="text-2xl font-bold">$17.71</div>
                  <div className="text-xs text-emerald-500">↑ 2% from last month</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Subscribers Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        basic: {
                          label: "Basic",
                          color: "hsl(var(--indigo-9))",
                        },
                        pro: {
                          label: "Pro",
                          color: "hsl(var(--violet-9))",
                        },
                        premium: {
                          label: "Premium",
                          color: "hsl(var(--pink-9))",
                        },
                        total: {
                          label: "Total",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subscriptionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="basic" stroke="var(--color-basic)" strokeWidth={2} />
                          <Line type="monotone" dataKey="pro" stroke="var(--color-pro)" strokeWidth={2} />
                          <Line type="monotone" dataKey="premium" stroke="var(--color-premium)" strokeWidth={2} />
                          <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} subscribers`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Subscriber Growth by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      basic: {
                        label: "Basic",
                        color: "hsl(var(--indigo-9))",
                      },
                      pro: {
                        label: "Pro",
                        color: "hsl(var(--violet-9))",
                      },
                      premium: {
                        label: "Premium",
                        color: "hsl(var(--pink-9))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subscriptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="basic" fill="var(--color-basic)" />
                        <Bar dataKey="pro" fill="var(--color-pro)" />
                        <Bar dataKey="premium" fill="var(--color-premium)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Basic Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">150</div>
                  <div className="text-sm text-muted-foreground mb-4">Total subscribers</div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New this month</span>
                      <span className="font-medium">+12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Churn rate</span>
                      <span className="font-medium">2.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. subscription length</span>
                      <span className="font-medium">4.2 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Pro Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">130</div>
                  <div className="text-sm text-muted-foreground mb-4">Total subscribers</div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New this month</span>
                      <span className="font-medium">+15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Churn rate</span>
                      <span className="font-medium">2.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. subscription length</span>
                      <span className="font-medium">6.8 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Premium Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">70</div>
                  <div className="text-sm text-muted-foreground mb-4">Total subscribers</div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New this month</span>
                      <span className="font-medium">+8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Churn rate</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. subscription length</span>
                      <span className="font-medium">9.2 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      basic: {
                        label: "Basic",
                        color: "hsl(var(--indigo-9))",
                      },
                      pro: {
                        label: "Pro",
                        color: "hsl(var(--violet-9))",
                      },
                      premium: {
                        label: "Premium",
                        color: "hsl(var(--pink-9))",
                      },
                      total: {
                        label: "Total",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="basic" stroke="var(--color-basic)" strokeWidth={2} />
                        <Line type="monotone" dataKey="pro" stroke="var(--color-pro)" strokeWidth={2} />
                        <Line type="monotone" dataKey="premium" stroke="var(--color-premium)" strokeWidth={2} />
                        <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                        <div className="text-2xl font-bold">$6,200</div>
                      </div>
                      <div className="text-emerald-500">↑ 10%</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Annual Recurring Revenue</div>
                        <div className="text-2xl font-bold">$74,400</div>
                      </div>
                      <div className="text-emerald-500">↑ 10%</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Average Revenue Per User</div>
                        <div className="text-2xl font-bold">$17.71</div>
                      </div>
                      <div className="text-emerald-500">↑ 2%</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Lifetime Value</div>
                        <div className="text-2xl font-bold">$142</div>
                      </div>
                      <div className="text-emerald-500">↑ 5%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Basic", value: 1500, color: "#4f46e5" },
                            { name: "Pro", value: 2600, color: "#8b5cf6" },
                            { name: "Premium", value: 2100, color: "#ec4899" },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        rate: {
                          label: "Churn Rate",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={churnData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Retention by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Basic</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "72%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Pro</span>
                        <span className="text-sm font-medium">84%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: "84%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Premium</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-pink-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-muted-foreground mb-2">Retention by Subscription Length</div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>1-3 months</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>4-6 months</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>7-12 months</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>12+ months</span>
                          <span className="font-medium">97%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Cohort Retention Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium p-2">Cohort</th>
                        <th className="text-center font-medium p-2">Month 1</th>
                        <th className="text-center font-medium p-2">Month 2</th>
                        <th className="text-center font-medium p-2">Month 3</th>
                        <th className="text-center font-medium p-2">Month 4</th>
                        <th className="text-center font-medium p-2">Month 5</th>
                        <th className="text-center font-medium p-2">Month 6</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-medium">Jan 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center bg-emerald-500/10">92%</td>
                        <td className="p-2 text-center bg-emerald-500/10">88%</td>
                        <td className="p-2 text-center bg-emerald-500/10">85%</td>
                        <td className="p-2 text-center bg-emerald-500/10">82%</td>
                        <td className="p-2 text-center bg-emerald-500/10">80%</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Feb 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center bg-emerald-500/10">94%</td>
                        <td className="p-2 text-center bg-emerald-500/10">90%</td>
                        <td className="p-2 text-center bg-emerald-500/10">87%</td>
                        <td className="p-2 text-center bg-emerald-500/10">84%</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Mar 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center bg-emerald-500/10">95%</td>
                        <td className="p-2 text-center bg-emerald-500/10">91%</td>
                        <td className="p-2 text-center bg-emerald-500/10">88%</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Apr 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center bg-emerald-500/10">96%</td>
                        <td className="p-2 text-center bg-emerald-500/10">92%</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">May 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center bg-emerald-500/10">97%</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Jun 2025</td>
                        <td className="p-2 text-center bg-emerald-500/10">100%</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
