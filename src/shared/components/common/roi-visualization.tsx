"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

// Sample data - in a real app, this would come from an API
const monthlyData = [
  { month: "Jan", revenue: 1200, expenses: 500, profit: 700 },
  { month: "Feb", revenue: 1800, expenses: 600, profit: 1200 },
  { month: "Mar", revenue: 2400, expenses: 700, profit: 1700 },
  { month: "Apr", revenue: 2000, expenses: 800, profit: 1200 },
  { month: "May", revenue: 2800, expenses: 900, profit: 1900 },
  { month: "Jun", revenue: 3600, expenses: 1000, profit: 2600 },
]

const gigData = [
  { name: "Club Events", count: 12, revenue: 6000, avgPayout: 500 },
  { name: "Private Parties", count: 8, revenue: 4800, avgPayout: 600 },
  { name: "Festivals", count: 3, revenue: 4500, avgPayout: 1500 },
  { name: "Corporate Events", count: 5, revenue: 5000, avgPayout: 1000 },
]

const investmentData = [
  { category: "Equipment", cost: 5000, roi: 320 },
  { category: "Software", cost: 1200, roi: 280 },
  { category: "Marketing", cost: 2000, roi: 240 },
  { category: "Training", cost: 800, roi: 180 },
]

export function RoiVisualization() {
  const [timeframe, setTimeframe] = useState("6m")

  return (
    <Card className="w-full bg-card border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">ROI & Performance Analytics</CardTitle>
            <CardDescription>Track your investments and performance metrics</CardDescription>
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
            <TabsTrigger value="gigs">Gig Analysis</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold">$13,800</div>
                  <div className="text-xs text-emerald-500">↑ 24% from last period</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                  <div className="text-2xl font-bold">$9,300</div>
                  <div className="text-xs text-emerald-500">↑ 18% from last period</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div className="text-2xl font-bold">247%</div>
                  <div className="text-xs text-emerald-500">↑ 12% from last period</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Revenue vs. Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                      expenses: {
                        label: "Expenses",
                        color: "hsl(var(--chart-3))",
                      },
                      profit: {
                        label: "Profit",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gigs" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Gigs by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        count: {
                          label: "Number of Gigs",
                          color: "hsl(var(--chart-1))",
                        },
                        revenue: {
                          label: "Revenue",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gigData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="count" fill="var(--color-count)" />
                          <Bar dataKey="revenue" fill="var(--color-revenue)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Average Payout by Gig Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        avgPayout: {
                          label: "Average Payout",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gigData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="avgPayout" fill="var(--color-avgPayout)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Gig Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {gigData.map((gig) => (
                    <Card key={gig.name} className="bg-card/30">
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium">{gig.name}</div>
                        <div className="text-2xl font-bold">${gig.revenue}</div>
                        <div className="text-xs text-muted-foreground">
                          {gig.count} gigs · ${gig.avgPayout} avg
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Investment ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        cost: {
                          label: "Investment Cost",
                          color: "hsl(var(--chart-1))",
                        },
                        roi: {
                          label: "ROI %",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={investmentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="cost" fill="var(--color-cost)" />
                          <Bar dataKey="roi" fill="var(--color-roi)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Investment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investmentData.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-muted-foreground">${item.cost}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-emerald-500 font-medium">{item.roi}% ROI</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Investment Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                    <div>
                      <div className="font-medium">Premium DJ Equipment</div>
                      <div className="text-sm text-muted-foreground">Estimated ROI: 280%</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                    <div>
                      <div className="font-medium">Social Media Marketing</div>
                      <div className="text-sm text-muted-foreground">Estimated ROI: 320%</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                    <div>
                      <div className="font-medium">Advanced DJ Course</div>
                      <div className="text-sm text-muted-foreground">Estimated ROI: 210%</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      projected: {
                        label: "Projected Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                      actual: {
                        label: "Actual Revenue",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", actual: 1200, projected: 1000 },
                          { month: "Feb", actual: 1800, projected: 1500 },
                          { month: "Mar", actual: 2400, projected: 2000 },
                          { month: "Apr", actual: 2000, projected: 2500 },
                          { month: "May", actual: 2800, projected: 2700 },
                          { month: "Jun", actual: 3600, projected: 3000 },
                          { month: "Jul", projected: 3500 },
                          { month: "Aug", projected: 4000 },
                          { month: "Sep", projected: 4200 },
                          { month: "Oct", projected: 3800 },
                          { month: "Nov", projected: 4500 },
                          { month: "Dec", projected: 5000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} />
                        <Line
                          type="monotone"
                          dataKey="projected"
                          stroke="var(--color-projected)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Projected Annual Revenue</div>
                  <div className="text-2xl font-bold">$38,000</div>
                  <div className="text-xs text-emerald-500">↑ 32% from last year</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Projected Gigs</div>
                  <div className="text-2xl font-bold">48</div>
                  <div className="text-xs text-emerald-500">↑ 20% from last year</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Projected ROI</div>
                  <div className="text-2xl font-bold">310%</div>
                  <div className="text-xs text-emerald-500">↑ 25% from last year</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
