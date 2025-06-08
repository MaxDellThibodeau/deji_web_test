"use client"

import { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Clock, MapPin, Music, Users, ArrowLeft, Share2, Heart } from "lucide-react"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Separator } from "@/ui/separator"
import { PublicHeader } from "@/shared/components/layout/public-header"
import EventTicketPurchase from "@/features/events/components/event-ticket-purchase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Mock event data
const events = [
  {
    id: "summer-beats-festival",
    title: "Summer Beats Festival",
    description:
      "Join us for the hottest summer music festival featuring top DJs and artists from around the world. Experience amazing music, food, and vibes in a beautiful outdoor setting.",
    longDescription:
      "The Summer Beats Festival is the premier electronic music event of the season. With multiple stages, world-class sound systems, and immersive art installations, this is more than just a concert—it's an experience. \n\nThis year's lineup features Grammy-winning producers, underground legends, and exciting newcomers. From house to techno, bass to trance, we've curated a diverse musical journey that will keep you dancing from day to night. \n\nIn addition to the music, enjoy gourmet food vendors, craft cocktails, and interactive art exhibits throughout the venue. Cool off in our water stations and chill-out zones when you need a break from dancing.",
    image: "/summer-festival.jpg",
    date: "2023-07-15T14:00:00",
    endDate: "2023-07-15T23:00:00",
    venue: "Sunset Park Amphitheater",
    address: "123 Festival Way, Los Angeles, CA",
    price: 89.99,
    ticketsRemaining: 250,
    genre: "Electronic",
    lineup: ["DJ Pulse", "Electra Waves", "Bass Collective", "Melody Masters"],
    features: ["Multiple stages", "Food vendors", "Art installations", "Water stations", "VIP areas"],
    ticketTypes: [
      {
        id: "general-admission",
        name: "General Admission",
        price: 89.99,
        available: 250,
        description: "Standard entry to the festival. Access to all main stages and food vendors.",
      },
      {
        id: "vip",
        name: "VIP",
        price: 149.99,
        available: 50,
        description: "VIP entry with access to exclusive viewing areas, premium restrooms, and a dedicated bar.",
      },
      {
        id: "vip-plus",
        name: "VIP+",
        price: 199.99,
        available: 25,
        description: "All VIP benefits plus backstage access, artist meet & greets, and complimentary food and drinks.",
      },
    ],
  },
  // Other events...
]

// Function to get user from cookies directly
function getUserFromCookies() {
  // In preview mode, we'll use a mock user
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = decodeURIComponent(value)
        return acc
      },
      {} as Record<string, string>,
    )

    if (cookies.user_id && cookies.user_role) {
      return {
        id: cookies.user_id,
        name: cookies.user_name || "User",
        email: cookies.user_email || null,
        role: cookies.user_role as "attendee" | "dj" | "venue",
      }
    }
  }
  return null
}

export default function EventPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Get user directly from cookies and Supabase
  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true)

      try {
        // First try to get user from cookies
        const cookieUser = getUserFromCookies()
        console.log("[DIRECT COOKIE CHECK] User from cookies:", cookieUser)

        // Then try to get user from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log("[DIRECT SUPABASE CHECK] Session:", session)

        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email,
            role: session.user.user_metadata?.role || "attendee",
          }
          console.log("[DIRECT SUPABASE CHECK] User data:", userData)
          setUser(userData)
          setUserRole(userData.role)
        } else if (cookieUser) {
          console.log("[DIRECT COOKIE CHECK] Using cookie user data")
          setUser(cookieUser)
          setUserRole(cookieUser.role)
        } else {
          console.log("[AUTH CHECK] No user found in session or cookies")
          setUser(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error("[AUTH ERROR]", error)
        setUser(null)
        setUserRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()

    // Also set up a listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AUTH STATE CHANGE]", event, session?.user?.id)
      if (event === "SIGNED_IN" && session) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
          role: session.user.user_metadata?.role || "attendee",
        }
        setUser(userData)
        setUserRole(userData.role)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    const foundEvent = events.find((e) => e.id === id)
    if (foundEvent) {
      setEvent(foundEvent)
    }
  }, [id])

  // Add more debug logging
  useEffect(() => {
    console.log("[EVENT PAGE] User state:", user)
    console.log("[EVENT PAGE] User role state:", userRole)
  }, [user, userRole])

  if (isLoading) {
    console.log("[EVENT PAGE] Still loading user data...")
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (!event) {
    console.log("[EVENT PAGE] Event not found")
    notFound()
  }

  const eventDate = new Date(event.date)
  const endDate = new Date(event.endDate)

  // Format the date and time
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedStartTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const formattedEndTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  // Check if the user is a DJ
  const isDJ = userRole === "dj"

  // Debug the ticket section rendering
  console.log("[TICKET SECTION] Rendering ticket section with:")
  console.log("[TICKET SECTION] User:", user)
  console.log("[TICKET SECTION] User role:", userRole)
  console.log("[TICKET SECTION] Is DJ:", isDJ)
  console.log("[TICKET SECTION] Is user logged in:", !!user)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath={`/events/${id}`} user={user} />

      <div className="pt-16 flex-1">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh]">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <Link href="/events">
              <Button variant="ghost" className="bg-black/30 hover:bg-black/50 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <Button variant="ghost" className="bg-black/30 hover:bg-black/50 text-white">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="bg-black/30 hover:bg-black/50 text-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge className="bg-purple-600 hover:bg-purple-700">{event.genre}</Badge>
                  <Badge className="bg-zinc-700 hover:bg-zinc-600">
                    <Users className="h-3 w-3 mr-1" />
                    {event.ticketsRemaining} tickets left
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-zinc-300">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-purple-400" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-400" />
                    <span>
                      {formattedStartTime} - {formattedEndTime}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl overflow-hidden mb-8">
                <Tabs defaultValue="details" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="lineup">Lineup</TabsTrigger>
                      <TabsTrigger value="venue">Venue</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="details" className="p-6">
                    <h2 className="text-xl font-bold mb-4">About This Event</h2>
                    <p className="text-zinc-300 whitespace-pre-line mb-6">{event.longDescription}</p>

                    <h3 className="text-lg font-bold mb-3">Event Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {event.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center bg-zinc-800 rounded-md p-3">
                          <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                            <span className="text-purple-400 text-lg">✓</span>
                          </div>
                          <span className="text-zinc-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="lineup" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Event Lineup</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.lineup.map((artist: string, index: number) => (
                        <div key={index} className="bg-zinc-800 p-4 rounded-lg flex items-center">
                          <div className="bg-purple-900/50 p-3 rounded-full mr-3">
                            <Music className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{artist}</h3>
                            <p className="text-sm text-zinc-400">Performer</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="venue" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Venue Information</h2>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">{event.venue}</h3>
                      <p className="text-zinc-300">{event.address}</p>
                    </div>
                    <div className="h-64 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-zinc-600 mr-2" />
                      <span className="text-zinc-500">Map view would appear here</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      <p>Doors open 1 hour before event start time. Please arrive early to avoid lines.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column - Ticket Purchase or DJ Options */}
            <div>
              <div className="bg-zinc-900 rounded-xl overflow-hidden sticky top-4">
                <div className="p-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold mb-2">Tickets</h2>
                  <p className="text-zinc-400">Secure your spot at {event.title}</p>
                </div>

                {/* Debug info */}
                <div className="p-2 bg-red-900/30 border-t border-b border-red-700 text-xs">
                  <p>Debug: User logged in: {user ? "YES" : "NO"}</p>
                  <p>Debug: User role: {userRole || "none"}</p>
                  <p>Debug: User object: {JSON.stringify(user)}</p>
                </div>

                {user ? (
                  // User is logged in - show appropriate interface based on role
                  isDJ ? (
                    // DJ interface
                    <div className="p-6">
                      <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500 rounded-lg">
                        <h3 className="font-medium text-purple-300 mb-2">DJ Dashboard</h3>
                        <p className="text-sm text-zinc-300 mb-3">
                          You're logged in as a DJ. Would you like to perform at this event?
                        </p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">Request to Perform</Button>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Event Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Date:</span>
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Time:</span>
                            <span>
                              {formattedStartTime} - {formattedEndTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Venue:</span>
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Attendee interface - show ticket purchase options
                    <div className="p-6">
                      <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
                        <p className="text-sm text-green-300">
                          You're logged in as an attendee. You can purchase tickets below.
                        </p>
                      </div>
                      <EventTicketPurchase
                        eventId={event.id}
                        eventName={event.title}
                        ticketTypes={event.ticketTypes}
                        userId={user.id}
                      />
                    </div>
                  )
                ) : (
                  // User is not logged in - show sign in prompt
                  <div className="p-6">
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                      <p className="text-sm text-yellow-300">
                        Debug: Not showing purchase interface because user is not logged in
                      </p>
                    </div>
                    <div className="text-center mb-4">
                      <p className="mb-2">Sign in to purchase tickets</p>
                      <Link href={`/login?redirectTo=${encodeURIComponent(`/events/${event.id}`)}`}>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">Sign In</Button>
                      </Link>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      {event.ticketTypes.map((ticket: any) => (
                        <div key={ticket.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            <p className="text-sm text-zinc-400">{ticket.available} available</p>
                          </div>
                          <p className="font-bold">${ticket.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
