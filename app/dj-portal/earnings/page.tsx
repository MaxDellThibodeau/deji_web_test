"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Calendar, Download, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"

export default function EarningsPage() {
  const [timeframe, setTimeframe] = useState("month")

  // Mock earnings data
  const earningsData = {
    totalEarnings: 12500,
    pendingPayments: 2800,
    completedGigs: 18,
    upcomingGigs: 5,

    // Monthly earnings
    monthlyEarnings: [
      { month: "Jan", amount: 1200 },
      { month: "Feb", amount: 1500 },
      { month: "Mar", amount: 1800 },
      { month: "Apr", amount: 2200 },
      { month: "May", amount: 2500 },
      { month: "Jun", amount: 3300 },
    ],

    // Recent transactions
    transactions: [
      {
        id: "tx1",
        date: "2025-05-15",
        venue: "Underground Club",
        event: "Techno Tuesday",
        amount: 500,
        status: "Paid",
      },
      {
        id: "tx2",
        date: "2025-05-10",
        venue: "Skyline Lounge",
        event: "Weekend Party",
        amount: 750,
        status: "Paid",
      },
      {
        id: "tx3",
        date: "2025-05-24",
        venue: "City Park",
        event: "Summer Festival",
        amount: 1200,
        status: "Pending",
      },
      {
        id: "tx4",
        date: "2025-05-03",
        venue: "Neon Nights",
        event: "House Party",
        amount: 600,
        status: "Paid",
      },
      {
        id: "tx5",
        date: "2025-05-31",
        venue: "Beach Club",
        event: "Sunset Sessions",
        amount: 800,
        status: "Pending",
      },
    ],
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">Earnings</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="mb-1 text-sm font-medium text-gray-400">Total Earnings</h2>
            <p className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-900/30">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="mb-1 text-sm font-medium text-gray-400">Pending Payments</h2>
            <p className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayments)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/30">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="mb-1 text-sm font-medium text-gray-400">Completed Gigs</h2>
            <p className="text-2xl font-bold">{earningsData.completedGigs}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/30">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="mb-1 text-sm font-medium text-gray-400">Upcoming Gigs</h2>
            <p className="text-2xl font-bold">{earningsData.upcomingGigs}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 bg-gray-900 text-white">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Earnings Overview</h2>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                {timeframe === "month" ? "Monthly" : timeframe === "week" ? "Weekly" : "Yearly"}
                <ChevronDown className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="h-64">
            <div className="flex h-full items-end justify-between">
              {earningsData.monthlyEarnings.map((item, index) => {
                // Calculate height percentage based on max value
                const maxAmount = Math.max(...earningsData.monthlyEarnings.map((item) => item.amount))
                const heightPercentage = (item.amount / maxAmount) * 100

                return (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <div className="mb-2 w-full px-1">
                      <div className="rounded-t bg-purple-600" style={{ height: `${heightPercentage * 0.6}%` }}></div>
                    </div>
                    <span className="text-xs font-medium">{item.month}</span>
                    <span className="text-xs text-gray-400">${item.amount}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Payment History</h2>

            <Tabs defaultValue="all" className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Venue</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-800">
                    <td className="py-3">{formatDate(transaction.date)}</td>
                    <td className="py-3">{transaction.venue}</td>
                    <td className="py-3">{transaction.event}</td>
                    <td className="py-3">{formatCurrency(transaction.amount)}</td>
                    <td className="py-3">{transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
