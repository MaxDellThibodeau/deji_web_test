"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Music, MapPin, Clock, Users, ChevronRight, Music2, LogOut } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { SongQueue } from "@/features/songs/components/song-queue"
import { Button } from "@/ui/button"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { useRouter } from "next/navigation"

// Mock data for preview mode
const MOCK_EVENT = {
  id: "00000000-0000-0000-0000-000000000000", // Valid UUID format for mock
  title: "Saturday Night Dance Party",
  description: "Join us for an unforgettable night of music and dancing!",
  venue: "Club Neon",
  event_date: new Date().toISOString(),
  status: "live",
  attendees: 120,
  dj_name: "DJ Max",
}

const MOCK_UPCOMING_EVENTS = [
  {
    id: "mock-event-1",
    title: "Techno Tuesday",
    venue: "Underground Club",
    event_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
  },
  {
    id: "mock-event-2",
    title: "Weekend Beats",
    venue: "Skyline Lounge",
    event_date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
  },
]

const MOCK_RECOMMENDATIONS = [
  { title: "Tsunami", artist: "Dash Berlin" },
  { title: "One", artist: "Veracocha" },
  { title: "Airwave", artist: "Rank 1" },
  { title: "Silence", artist: "Delerium ft. Sarah McLachlan" },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [currentEvent, setCurrentEvent] = useState<any>(MOCK_EVENT)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(MOCK_UPCOMING_EVENTS)
  const [recommendations, setRecommendations] = useState<any[]>(MOCK_RECOMMENDATIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [userGenre, setUserGenre] = useState("electronic")
  const [userMood, setUserMood] = useState("energetic")
  const redirectAttempted = useRef(false)

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    // But only attempt this once to prevent loops
    if (!userLoading && !user && typeof window !== "undefined" && !redirectAttempted.current) {
      redirectAttempted.current = true
      router.push("/login")
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // In a real app, we would fetch this data from the server
      // For now, we'll use mock data
      setCurrentEvent(MOCK_EVENT)
      setUpcomingEvents(MOCK_UPCOMING_EVENTS)
      setRecommendations(MOCK_RECOMMENDATIONS)

      // Simulate user preferences
      setUserGenre("electronic")
      setUserMood("energetic")

      setIsLoading(false)
    }

    if (!userLoading && user) {
      loadData()
    }
  }, [user, userLoading])

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString(undefined, { weekday: "short" })}, ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
  }

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading...</p>
      </div>
    )
  }

  // If no user and not loading, the useEffect will redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Redirecting to login...</p>
      </div>
    )
  }

  // Check if user is a DJ and redirect to DJ dashboard
  if (user.role === "dj") {
    // Use client-side navigation to prevent middleware loops
    router.push("/dj-portal/dashboard")
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Redirecting to DJ dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/dashboard" user={user} />

      {/* Dashboard content */}
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

            {/* Desktop buttons - will be hidden on mobile */}
            <div className="hidden md:flex space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
              >
                <Music className="mr-2 h-4 w-4" />
                Update Preferences
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-0">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Button>
              <Link href="/landing">
                <Button
                  variant="outline"
                  className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit Dashboard
                </Button>
              </Link>
            </div>

            {/* Mobile buttons - will be shown in a column on mobile */}
            <div className="flex flex-col w-full space-y-3 md:hidden mt-4">
              <Button
                variant="outline"
                className="w-full bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
              >
                <Music className="mr-2 h-4 w-4" />
                Update Preferences
              </Button>
              <Link href="/landing" className="w-full">
                <Button
                  variant="outline"
                  className="w-full bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit Dashboard
                </Button>
              </Link>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-0">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-xl text-zinc-400">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content - 2/3 width */}
              <div className="md:col-span-2 space-y-6">
                {/* Current Event */}
                <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <CardTitle>Current Event</CardTitle>
                    </div>
                    <h3 className="text-xl font-medium mt-1">{currentEvent.title}</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-zinc-400">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{currentEvent.venue}</span>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{new Date(currentEvent.event_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{currentEvent.attendees || 0} Attendees</span>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Music className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{currentEvent.dj_name || "DJ TBA"}</span>
                      </div>
                    </div>

                    <p className="text-zinc-300">{currentEvent.description}</p>

                    <div className="mt-4">
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-md px-3 py-2 mb-3">
                        <p className="text-yellow-300 text-xs">Preview Mode: Using mock song queue data</p>
                      </div>
                      <SongQueue eventId={currentEvent.id} />
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <CardTitle>Upcoming Events</CardTitle>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">Events you might be interested in</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center text-sm text-zinc-400">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>{formatEventDate(event.event_date)}</span>
                              <span className="mx-2">•</span>
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - 1/3 width */}
              <div className="space-y-6">
                {/* User Stats */}
                <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-3 text-center">
                        <p className="text-sm text-zinc-400">Events Attended</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-3 text-center">
                        <p className="text-sm text-zinc-400">Songs Requested</p>
                        <p className="text-2xl font-bold">28</p>
                      </div>
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-3 text-center">
                        <p className="text-sm text-zinc-400">Tokens Spent</p>
                        <p className="text-2xl font-bold">450</p>
                      </div>
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-3 text-center">
                        <p className="text-sm text-zinc-400">DJ Rating</p>
                        <p className="text-2xl font-bold">4.8</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Song Recommendations */}
                <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Music2 className="h-5 w-5 text-purple-500" />
                      <CardTitle>AI Song Recommendations</CardTitle>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">
                      Personalized for {userGenre} and {userMood} mood
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map((song, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 text-purple-300">
                              <Music className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{song.title}</p>
                              <p className="text-sm text-zinc-400">{song.artist}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
