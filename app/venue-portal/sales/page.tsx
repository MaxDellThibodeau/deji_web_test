"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Ticket, Users, Calendar, Download, ArrowLeft, BarChart3 } from "lucide-react"
import { RoleDashboardLayout } from "@/src/shared/components/layout/role-dashboard-layout"

export default function VenueSalesPage() {
  const router = useRouter()
  const [timeframe, setTimeframe] = useState("month")

  // Mock sales data
  const salesData = {
    totalRevenue: 45250,
    ticketsSold: 1847,
    totalEvents: 12,
    averageAttendance: 154,

    // Recent events with sales data
    recentEvents: [
      {
        id: "1",
        name: "Techno Tuesday",
        date: "2025-05-28",
        dj: "DJ Pulse",
        ticketsSold: 180,
        capacity: 200,
        revenue: 3600,
        status: "Completed",
      },
      {
        id: "2",
        name: "Weekend Beats",
        date: "2025-05-25",
        dj: "DJ Rhythm",
        ticketsSold: 165,
        capacity: 200,
        revenue: 3300,
        status: "Completed",
      },
      {
        id: "3",
        name: "Latin Fiesta",
        date: "2025-06-05",
        dj: "DJ Nova",
        ticketsSold: 95,
        capacity: 200,
        revenue: 1900,
        status: "Upcoming",
      },
      {
        id: "4",
        name: "House Party",
        date: "2025-05-20",
        dj: "DJ Echo",
        ticketsSold: 200,
        capacity: 200,
        revenue: 4000,
        status: "Completed",
      },
    ],

    // Monthly revenue data
    monthlyRevenue: [
      { month: "Jan", revenue: 6200 },
      { month: "Feb", revenue: 7500 },
      { month: "Mar", revenue: 8100 },
      { month: "Apr", revenue: 9200 },
      { month: "May", revenue: 11500 },
      { month: "Jun", revenue: 2750 }, // Partial month
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-900/30 text-green-400"
      case "Upcoming":
        return "bg-blue-900/30 text-blue-400"
      default:
        return "bg-zinc-900/30 text-zinc-400"
    }
  }

  return (
    <RoleDashboardLayout title="Sales & Analytics" role="venue">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Sales & Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-zinc-800 border-zinc-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</p>
                  <p className="text-xs text-green-400 mt-1">↑ 12% from last month</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Tickets Sold</p>
                  <p className="text-2xl font-bold">{salesData.ticketsSold.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">↑ 8% from last month</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Events</p>
                  <p className="text-2xl font-bold">{salesData.totalEvents}</p>
                  <p className="text-xs text-green-400 mt-1">↑ 2 from last month</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Avg Attendance</p>
                  <p className="text-2xl font-bold">{salesData.averageAttendance}</p>
                  <p className="text-xs text-green-400 mt-1">↑ 5% from last month</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Event Sales</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Chart */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between">
                  {salesData.monthlyRevenue.map((item, index) => {
                    const maxRevenue = Math.max(...salesData.monthlyRevenue.map((item) => item.revenue))
                    const heightPercentage = (item.revenue / maxRevenue) * 100

                    return (
                      <div key={index} className="flex flex-1 flex-col items-center">
                        <div className="mb-2 w-full px-1">
                          <div
                            className="rounded-t bg-purple-600"
                            style={{ height: `${heightPercentage * 0.6}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{item.month}</span>
                        <span className="text-xs text-zinc-400">{formatCurrency(item.revenue)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Event Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                        <th className="pb-3">Event</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">DJ</th>
                        <th className="pb-3">Tickets Sold</th>
                        <th className="pb-3">Revenue</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-zinc-800">
                          <td className="py-3 font-medium">{event.name}</td>
                          <td className="py-3">{formatDate(event.date)}</td>
                          <td className="py-3">{event.dj}</td>
                          <td className="py-3">
                            {event.ticketsSold} / {event.capacity}
                            <div className="w-full bg-zinc-800 rounded-full h-1 mt-1">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3">{formatCurrency(event.revenue)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Top Performing Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.recentEvents
                      .filter((event) => event.status === "Completed")
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 3)
                      .map((event, index) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-md">
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-sm text-zinc-400">{event.dj}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(event.revenue)}</p>
                            <p className="text-sm text-zinc-400">{event.ticketsSold} tickets</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <span>Average ticket price</span>
                      <span className="font-medium">$24.50</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <span>Conversion rate</span>
                      <span className="font-medium text-green-400">78%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <span>Repeat customers</span>
                      <span className="font-medium text-blue-400">42%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                      <span>Revenue growth</span>
                      <span className="font-medium text-green-400">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleDashboardLayout>
  )
}
