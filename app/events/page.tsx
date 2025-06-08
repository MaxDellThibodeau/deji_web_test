"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Clock, Music, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { EventSongLeaderboard } from "@/features/events/components/event-song-leaderboard"
import { useUser } from "@/hooks/use-user"
import { EVENTS } from "@/shared/utils/mock-data"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEvents, setFilteredEvents] = useState(EVENTS)
  const [activeTab, setActiveTab] = useState("all")
  const { user, isLoading } = useUser()

  // Filter events based on search query and active tab
  useEffect(() => {
    let filtered = EVENTS

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.dj.toLowerCase().includes(query) ||
          event.genre.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.genre.toLowerCase() === activeTab)
    }

    setFilteredEvents(filtered)
  }, [searchQuery, activeTab])

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy")
  }

  // If loading, show a loading state
  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Welcome message for logged-in users */}
          {user && (
            <div className="mb-6 inline-flex items-center bg-purple-900/30 px-4 py-2 rounded-full border border-purple-500/30">
              <span className="text-sm text-purple-300">
                Welcome back, {user.name || 'User'}! Find your next event below.
              </span>
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-6">
            {user ? 'Events For You' : 'Upcoming Events'}
          </h1>

          {/* Signup CTA for logged-out users */}
          {!user && (
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 md:mr-8">
                  <h2 className="text-xl font-bold text-white mb-2">Get the Full Experience</h2>
                  <p className="text-gray-200">
                    Sign up to save events, bid on songs, and get personalized recommendations!
                  </p>
                </div>
                <Link href="/signup?redirectTo=/events">
                  <Button className="create-event-btn">Join Now</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search events, DJs, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
            <Button variant="outline" className="bg-zinc-800 border-zinc-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="electronic">Electronic</TabsTrigger>
              <TabsTrigger value="pop">Pop</TabsTrigger>
              <TabsTrigger value="latin">Latin</TabsTrigger>
              <TabsTrigger value="house">House</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-zinc-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="bg-navy-900 border-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative h-48 md:h-auto md:w-48 flex-shrink-0">
                          <Image
                            src={event.image || "/placeholder.svg?height=300&width=300"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <CardContent className="flex-grow p-4 md:p-6">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-purple-600">{event.genre}</Badge>
                            <Badge className="bg-zinc-700">{event.capacity} capacity</Badge>
                            <Badge className="bg-green-600">{event.ticketsRemaining} tickets left</Badge>
                          </div>

                          <h2 className="text-2xl font-bold mb-2">{event.name}</h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-zinc-300">
                              <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                              <span className="text-sm">{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center text-zinc-300">
                              <Clock className="h-4 w-4 mr-2 text-purple-400" />
                              <span className="text-sm">{event.time}</span>
                            </div>
                            <div className="flex items-center text-zinc-300">
                              <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                              <span className="text-sm">{event.venue}</span>
                            </div>
                            <div className="flex items-center text-zinc-300">
                              <Music className="h-4 w-4 mr-2 text-purple-400" />
                              <span className="text-sm">Featuring {event.dj}</span>
                            </div>
                          </div>

                          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold">${event.price}</div>
                            <Link href={`/events/${event.id}`}>
                              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                                {user ? 'Join Event' : 'View Details'}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </div>
                    </div>

                    <div className="px-4 pb-4 md:p-0">
                      <EventSongLeaderboard eventId={event.id} limit={3} className="h-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
