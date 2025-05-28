"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Music,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  BarChart,
  Shield,
  AlertTriangle,
  UserCheck,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { attendeeAccounts, djAccounts, venueAccounts, adminAccounts } from "@/features/auth/services/dummy-accounts"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Count users by role
  const userCounts = {
    attendees: attendeeAccounts.length,
    djs: djAccounts.length,
    venues: venueAccounts.length,
    admins: adminAccounts.length,
    total: attendeeAccounts.length + djAccounts.length + venueAccounts.length + adminAccounts.length,
  }

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: "user_signup",
      user: "Jamie Smith",
      role: "attendee",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: 2,
      type: "event_created",
      user: "Skyline Venue",
      eventName: "Summer Beach Party",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: 3,
      type: "dj_signup",
      user: "DJ Mix",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: 4,
      type: "report_submitted",
      user: "Alex Johnson",
      subject: "Inappropriate behavior",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    },
    {
      id: 5,
      type: "venue_signup",
      user: "The Loft",
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    },
  ]

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60)
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffMins / 1440)
      return `${days} day${days !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl text-zinc-400">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">Users</h3>
                  <p className="text-2xl font-bold">{userCounts.total}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1">DJs</h3>
                  <p className="text-2xl font-bold">{userCounts.djs}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-medium mb-1">Venues</h3>
                  <p className="text-2xl font-bold">{userCounts.venues}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-medium mb-1">Events</h3>
                  <p className="text-2xl font-bold">42</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
                    <UserCheck className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">User Management</h3>
                  <p className="text-sm text-zinc-400 mb-3">Manage user accounts and permissions</p>
                  <Button variant="outline" size="sm" className="mt-auto w-full">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="font-medium mb-1">Reports & Issues</h3>
                  <p className="text-sm text-zinc-400 mb-3">Handle user reports and platform issues</p>
                  <Button variant="outline" size="sm" className="mt-auto w-full">
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1">Platform Settings</h3>
                  <p className="text-sm text-zinc-400 mb-3">Configure global platform settings</p>
                  <Button variant="outline" size="sm" className="mt-auto w-full">
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <CardTitle>Recent Activity</CardTitle>
                  </div>
                  <Button variant="link" size="sm" className="text-purple-400 hover:text-purple-300 -mr-2">
                    View All
                  </Button>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Latest platform activities</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === "user_signup" ||
                              activity.type === "dj_signup" ||
                              activity.type === "venue_signup"
                                ? "bg-green-600/20 text-green-400"
                                : activity.type === "report_submitted"
                                  ? "bg-red-600/20 text-red-400"
                                  : "bg-blue-600/20 text-blue-400"
                            }`}
                          >
                            {activity.type === "user_signup" ||
                            activity.type === "dj_signup" ||
                            activity.type === "venue_signup" ? (
                              <UserCheck className="w-5 h-5" />
                            ) : activity.type === "report_submitted" ? (
                              <AlertTriangle className="w-5 h-5" />
                            ) : (
                              <Calendar className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {activity.type === "user_signup" && `New attendee signup: ${activity.user}`}
                              {activity.type === "dj_signup" && `New DJ signup: ${activity.user}`}
                              {activity.type === "venue_signup" && `New venue signup: ${activity.user}`}
                              {activity.type === "event_created" && `New event created: ${activity.eventName}`}
                              {activity.type === "report_submitted" && `Report submitted by ${activity.user}`}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Analytics */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    <CardTitle>Platform Analytics</CardTitle>
                  </div>
                  <Button variant="link" size="sm" className="text-purple-400 hover:text-purple-300 -mr-2">
                    View Details
                  </Button>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Key performance metrics</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Active Users</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold mr-2">1,245</span>
                      <span className="text-sm text-zinc-400">this month</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 12% from last month</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">New Signups</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold">87</span>
                      <span className="text-sm text-zinc-400 ml-2">this week</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 23% from last week</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Events Created</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold">42</span>
                      <span className="text-sm text-zinc-400 ml-2">this month</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 15% from last month</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Platform Revenue</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold">$24,850</span>
                      <span className="text-sm text-zinc-400 ml-2">this month</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 18% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Admin Profile */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle>Admin Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
                    <Shield className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium">System Admin</h3>
                  <p className="text-sm text-zinc-400">admin@example.com</p>
                  <div className="flex items-center mt-1 text-green-400 text-sm">
                    <span>Super Admin</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Last Login</span>
                    <span className="font-medium">Today, 9:45 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Account Created</span>
                    <span className="font-medium">Jan 15, 2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">2FA Status</span>
                    <span className="font-medium text-green-400">Enabled</span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-purple-500" />
                  <CardTitle>Pending Approvals</CardTitle>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Items requiring admin approval</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                          <Music className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">DJ Verification</p>
                          <p className="text-xs text-zinc-400">DJ Beats</p>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full">Pending</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Reject
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-500">
                        Approve
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Venue Verification</p>
                          <p className="text-xs text-zinc-400">The Loft</p>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full">Pending</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Reject
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-500">
                        Approve
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium">Content Report</p>
                          <p className="text-xs text-zinc-400">Inappropriate event description</p>
                        </div>
                      </div>
                      <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded-full">Urgent</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Dismiss
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-500">
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <CardTitle>System Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-md bg-green-900/20 border border-green-900/30">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">API Services</span>
                    </div>
                    <span className="text-xs text-green-400">Operational</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-green-900/20 border border-green-900/30">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Database</span>
                    </div>
                    <span className="text-xs text-green-400">Operational</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-green-900/20 border border-green-900/30">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Authentication</span>
                    </div>
                    <span className="text-xs text-green-400">Operational</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-yellow-900/20 border border-yellow-900/30">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Payment Processing</span>
                    </div>
                    <span className="text-xs text-yellow-400">Degraded</span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
