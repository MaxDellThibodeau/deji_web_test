"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Music, Clock, ChevronRight, BarChart, DollarSign, Star, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Mock data
const UPCOMING_EVENTS = [
  {
    id: "event-1",
    title: "Techno Tuesday",
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    dj: "DJ Pulse",
    ticketsSold: 120,
    capacity: 200,
    status: "confirmed",
    image: "/techno-tuesday.jpg",
  },
  {
    id: "event-2",
    title: "Weekend Beats",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    dj: "DJ Rhythm",
    ticketsSold: 85,
    capacity: 200,
    status: "confirmed",
    image: "/summer-festival.jpg",
  },
  {
    id: "event-3",
    title: "Latin Fiesta",
    date: new Date(Date.now() + 86400000 * 8).toISOString(),
    dj: "DJ Nova",
    ticketsSold: 45,
    capacity: 200,
    status: "confirmed",
    image: "/latin-fiesta.jpg",
  },
]

const TOP_DJS = [
  {
    name: "DJ Pulse",
    genres: ["Deep House", "Techno"],
    rating: 4.9,
    image: "/focused-dj.png",
    eventCount: 12,
  },
  {
    name: "DJ Rhythm",
    genres: ["Hip-Hop", "R&B"],
    rating: 4.7,
    image: "/vibrant-dj-set.png",
    eventCount: 8,
  },
  {
    name: "DJ Nova",
    genres: ["Electronic", "Ambient"],
    rating: 4.8,
    image: "/energetic-dj-groove.png",
    eventCount: 10,
  },
]

export default function VenueDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString(undefined, { weekday: "short" })}, ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Venue Dashboard</h1>
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl text-zinc-400">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">Create Event</h3>
                  <p className="text-sm text-zinc-400 mb-3">Schedule a new event at your venue</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => router.push("/venue-portal/events/new")}
                  >
                    New Event
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1">Find DJs</h3>
                  <p className="text-sm text-zinc-400 mb-3">Discover and book DJs for your events</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => router.push("/venue-portal/djs")}
                  >
                    Browse DJs
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-3">
                    <Ticket className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-medium mb-1">Ticket Sales</h3>
                  <p className="text-sm text-zinc-400 mb-3">Manage tickets and promotions</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => router.push("/venue-portal/sales")}
                  >
                    View Sales
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <CardTitle>Upcoming Events</CardTitle>
                  </div>
                  <Button variant="link" size="sm" className="text-purple-400 hover:text-purple-300 -mr-2">
                    View All
                  </Button>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Events scheduled at your venue</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {UPCOMING_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              event.status === "confirmed"
                                ? "bg-green-900/30 text-green-300"
                                : "bg-yellow-900/30 text-yellow-300"
                            }`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-zinc-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-zinc-400 mt-1">
                          <Music className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{event.dj}</span>
                        </div>
                        <div className="flex items-center text-sm text-zinc-400 mt-1">
                          <Ticket className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>
                            {event.ticketsSold} / {event.capacity} tickets sold
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
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

            {/* Venue Analytics */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    <CardTitle>Venue Analytics</CardTitle>
                  </div>
                  <Button variant="link" size="sm" className="text-purple-400 hover:text-purple-300 -mr-2">
                    View Details
                  </Button>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Performance metrics for your venue</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Average Attendance</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold mr-2">78%</span>
                      <span className="text-sm text-zinc-400">of capacity</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 12% from last month</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Total Events</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold">42</span>
                      <span className="text-sm text-zinc-400 ml-2">this year</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 8 from last year</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Average Rating</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold mr-2">4.7</span>
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current text-yellow-400/30" />
                      </div>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ 0.3 from last month</p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
                    <p className="text-sm text-zinc-400 mb-1">Total Revenue</p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold">$86,250</span>
                      <span className="text-sm text-zinc-400 ml-2">this year</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">↑ $12,450 from last year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Venue Profile */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle>Venue Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-full h-40 rounded-md overflow-hidden mb-3">
                    <Image src="/vibrant-nightclub.png" alt="Venue" fill className="object-cover" />
                  </div>
                  <h3 className="text-lg font-medium">Skyline Venue</h3>
                  <p className="text-sm text-zinc-400">New York, NY</p>
                  <div className="flex items-center mt-1 text-yellow-400 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">4.7 (86 reviews)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Capacity</span>
                    <span className="font-medium">500 people</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Established</span>
                    <span className="font-medium">2015</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Events Hosted</span>
                    <span className="font-medium">245</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push("/venue-portal/profile")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing DJs */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-purple-500" />
                  <CardTitle>Top Performing DJs</CardTitle>
                </div>
                <p className="text-zinc-400 text-sm mt-1">DJs with highest attendance at your venue</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TOP_DJS.map((dj, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image src={dj.image || "/placeholder.svg"} alt={dj.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{dj.name}</p>
                            <div className="flex items-center text-yellow-400 text-xs">
                              <Star className="h-3 w-3 fill-current mr-1" />
                              <span>{dj.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-zinc-400">{dj.genres.join(", ")}</p>
                            <p className="text-xs text-purple-400">{dj.eventCount} events</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" className="w-full">
                    View All DJs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* DJ Booking Requests */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <CardTitle>DJ Booking Requests</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src="/energetic-dj-groove.png" alt="DJ Nova" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">DJ Nova</p>
                        <p className="text-xs text-zinc-400">Electronic, Ambient</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-zinc-400">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Jun 15, 2023</span>
                      </div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>9:00 PM - 2:00 AM</span>
                      </div>
                      <div className="flex items-center text-sm text-green-400">
                        <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>$800 requested fee</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Decline
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-500">
                        Accept
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src="/vibrant-dj-set.png" alt="DJ Rhythm" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">DJ Rhythm</p>
                        <p className="text-xs text-zinc-400">Hip-Hop, R&B</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-zinc-400">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Jul 8, 2023</span>
                      </div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>10:00 PM - 3:00 AM</span>
                      </div>
                      <div className="flex items-center text-sm text-green-400">
                        <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>$750 requested fee</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Decline
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-500">
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
