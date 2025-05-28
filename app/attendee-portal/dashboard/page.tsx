"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Music, MapPin, ChevronRight, Music2, Ticket, Star, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { WelcomeNotification } from "@/shared/components/common/welcome-notification"
import { UserActiveBids } from "@/shared/components/common/user-active-bids"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

// Mock data - updated with valid event IDs that match our events data
const UPCOMING_EVENTS = [
  {
    id: "summer-beats-festival",
    title: "Summer Beats Festival",
    venue: "Skyline Venue",
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    image: "/summer-festival.jpg",
  },
  {
    id: "neon-nights",
    title: "Neon Nights",
    venue: "The Warehouse",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    image: "/neon-nights.jpg",
  },
  {
    id: "latin-fiesta",
    title: "Latin Fiesta",
    venue: "Salsa Club",
    date: new Date(Date.now() + 86400000 * 8).toISOString(),
    image: "/latin-fiesta.jpg",
  },
]

const RECOMMENDED_DJS = [
  {
    id: "dj-1",
    name: "DJ Pulse",
    genres: ["Deep House", "Techno"],
    image: "/focused-dj.png",
  },
  {
    id: "dj-2",
    name: "DJ Rhythm",
    genres: ["Hip-Hop", "R&B"],
    image: "/vibrant-dj-set.png",
  },
  {
    id: "dj-3",
    name: "DJ Nova",
    genres: ["Electronic", "Ambient"],
    image: "/energetic-dj-groove.png",
  },
]

const SONG_RECOMMENDATIONS = [
  { title: "Tsunami", artist: "Dash Berlin" },
  { title: "One", artist: "Veracocha" },
  { title: "Airwave", artist: "Rank 1" },
  { title: "Silence", artist: "Delerium ft. Sarah McLachlan" },
]

export default function AttendeeDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user from cookies
    const cookieUser = getUserFromCookies()
    if (cookieUser) {
      setUser(cookieUser)
    }
    setIsLoading(false)
  }, [])

  const formatEventDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString(undefined, { weekday: "short" })}, ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Attendee Dashboard</h1>
      {typeof WelcomeNotification !== "undefined" && <WelcomeNotification />}
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
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">Find Events</h3>
                  <p className="text-sm text-zinc-400 mb-3">Discover upcoming events near you</p>
                  <Link href="/events">
                    <Button variant="outline" size="sm" className="mt-auto w-full">
                      Browse Events
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1">Discover DJs</h3>
                  <p className="text-sm text-zinc-400 mb-3">Find DJs that match your music taste</p>
                  <Link href="/djs">
                    <Button variant="outline" size="sm" className="mt-auto w-full">
                      Browse DJs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-3">
                    <Ticket className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-medium mb-1">My Tickets</h3>
                  <p className="text-sm text-zinc-400 mb-3">View your purchased event tickets</p>
                  <Link href="/tickets">
                    <Button variant="outline" size="sm" className="mt-auto w-full">
                      View Tickets
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">My Profile</h3>
                  <p className="text-sm text-zinc-400 mb-3">Update your personal information</p>
                  <Link href="/attendee-portal/profile" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {user && <UserActiveBids userId={user.id} />}

            {/* Upcoming Events */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <CardTitle>Upcoming Events</CardTitle>
                  </div>
                  <Link href="/events" className="text-purple-400 hover:text-purple-300 text-sm">
                    View All
                  </Link>
                </div>
                <p className="text-zinc-400 text-sm mt-1">Events you might be interested in</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {UPCOMING_EVENTS.map((event) => (
                    <Link href={`/events/${event.id}`} key={event.id}>
                      <div className="flex gap-4 p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          <div className="flex items-center text-sm text-zinc-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{formatEventDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-zinc-400 mt-1">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{event.venue}</span>
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
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended DJs */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Music className="h-5 w-5 text-purple-500" />
                    <CardTitle>Recommended DJs</CardTitle>
                  </div>
                  <Button variant="link" size="sm" className="text-purple-400 hover:text-purple-300 -mr-2">
                    View All
                  </Button>
                </div>
                <p className="text-zinc-400 text-sm mt-1">DJs that match your music preferences</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {RECOMMENDED_DJS.map((dj) => (
                    <div
                      key={dj.id}
                      className="bg-zinc-800/50 border border-zinc-700/50 rounded-md overflow-hidden hover:bg-zinc-800 transition-colors"
                    >
                      <div className="relative w-full h-40">
                        <Image src={dj.image || "/placeholder.svg"} alt={dj.name} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium">{dj.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dj.genres.map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <Link href={`/djs/${dj.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-3">
                            View Profile
                          </Button>
                        </Link>
                      </div>
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
                <p className="text-zinc-400 text-sm mt-1">Personalized for your taste</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SONG_RECOMMENDATIONS.map((song, index) => (
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

            {/* Favorite DJs */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <CardTitle>Your Favorite DJs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image src="/focused-dj.png" alt="DJ Pulse" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">DJ Pulse</p>
                      <p className="text-xs text-zinc-400">5 events attended</p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image src="/vibrant-dj-set.png" alt="DJ Rhythm" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">DJ Rhythm</p>
                      <p className="text-xs text-zinc-400">3 events attended</p>
                    </div>
                  </div>

                  <Link href="/favorite-djs">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Favorites
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
