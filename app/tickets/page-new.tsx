"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/shared/services/client"
import { getUserFromCookies } from "@/shared/utils/auth-utils"
import { PublicHeader } from "@/shared/components/layout/public-header"

// UI Components
import { Button } from "@/ui/button"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"
import { Calendar, MapPin, Ticket, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/ui/input"
import { Badge } from "@/ui/badge"

// Types
interface TicketType {
  id: string
  event_id: string
  event_name: string
  event_date: string
  event_location: string
  ticket_type: string
  purchase_date: string
  status: "active" | "used" | "expired"
  image_url: string
}

export default function TicketsPage() {
  // State
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState("upcoming")
  const router = useRouter()
  const supabase = createClient()

  // Get user and tickets
  useEffect(() => {
    async function initPage() {
      try {
        // First check cookies for user info (for demo mode)
        const cookieUser = getUserFromCookies()

        if (cookieUser) {
          setUser(cookieUser)
          await fetchTickets(cookieUser.id)
          return
        }

        // If no cookie user, try Supabase auth
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          // If no user is found, redirect to login
          router.push("/login?redirectTo=/tickets")
          return
        }

        setUser(data.user)
        await fetchTickets(data.user.id)
      } catch (error) {
        console.error("Error initializing page:", error)
        setLoading(false)
      }
    }

    initPage()
  }, [router, supabase])

  // Fetch tickets
  async function fetchTickets(userId) {
    try {
      setLoading(true)

      // For demo purposes, we'll use mock data
      // In a real app, you would fetch from Supabase here
      setTimeout(() => {
        setTickets(mockTickets)
        filterTickets(mockTickets, currentTab, searchQuery)
        setLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setLoading(false)
    }
  }

  // Filter tickets based on tab and search query
  function filterTickets(ticketsToFilter, tab, query) {
    let filtered = [...ticketsToFilter]

    // Apply tab filter
    if (tab === "upcoming") {
      filtered = filtered.filter((ticket) => new Date(ticket.event_date) > new Date() && ticket.status === "active")
    } else if (tab === "past") {
      filtered = filtered.filter(
        (ticket) => new Date(ticket.event_date) < new Date() || ticket.status === "used" || ticket.status === "expired",
      )
    }

    // Apply search filter if query exists
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (ticket) =>
          ticket.event_name.toLowerCase().includes(lowercaseQuery) ||
          ticket.event_location.toLowerCase().includes(lowercaseQuery) ||
          ticket.ticket_type.toLowerCase().includes(lowercaseQuery),
      )
    }

    setFilteredTickets(filtered)
  }

  // Handle tab change
  function handleTabChange(tab) {
    setCurrentTab(tab)
    filterTickets(tickets, tab, searchQuery)
  }

  // Handle search
  function handleSearch(e) {
    const query = e.target.value
    setSearchQuery(query)
    filterTickets(tickets, currentTab, query)
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <PublicHeader currentPath="/tickets" user={user} />
        <div className="pt-16 flex-1">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">My Tickets</h1>
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="h-12 bg-zinc-800/50 animate-pulse rounded-md mb-6"></div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden">
                  <div className="h-48 bg-zinc-800/50 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-7 bg-zinc-800/50 animate-pulse rounded-md mb-4 w-3/4"></div>
                    <div className="h-5 bg-zinc-800/50 animate-pulse rounded-md mb-3 w-1/2"></div>
                    <div className="h-5 bg-zinc-800/50 animate-pulse rounded-md mb-6 w-2/3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-zinc-800/50 animate-pulse rounded-md w-1/3"></div>
                      <div className="h-10 bg-zinc-800/50 animate-pulse rounded-md w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user, show redirect message
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/tickets" user={user} />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">My Tickets</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Link href="/events">
                <Button>
                  Browse Events
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tickets by event name, location, or type..."
                className="pl-10 bg-zinc-900/50 border-zinc-800/50"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="mb-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tickets grid */}
          {filteredTickets.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <Ticket className="h-12 w-12 text-zinc-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Tickets Found</h3>
                  <p className="text-zinc-400 mb-6">
                    {searchQuery
                      ? "No tickets match your search criteria."
                      : currentTab === "upcoming"
                        ? "You don't have any upcoming event tickets."
                        : currentTab === "past"
                          ? "You don't have any past event tickets."
                          : "You haven't purchased any tickets yet."}
                  </p>
                  {!searchQuery && (
                    <Link href="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  )}
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        filterTickets(tickets, currentTab, "")
                      }}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Ticket Card Component
function TicketCard({ ticket, formatDate }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="relative">
        <div className="relative w-full h-48">
          <Image src={ticket.image_url || "/placeholder.svg"} alt={ticket.event_name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

        <Badge
          className={`absolute top-4 right-4 ${
            ticket.status === "active"
              ? "bg-green-900/80 text-green-400 hover:bg-green-900"
              : ticket.status === "used"
                ? "bg-blue-900/80 text-blue-400 hover:bg-blue-900"
                : "bg-red-900/80 text-red-400 hover:bg-red-900"
          }`}
        >
          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{ticket.event_name}</h3>

        <div className="flex items-center text-zinc-400 mb-1">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{formatDate(ticket.event_date)}</span>
        </div>

        <div className="flex items-center text-zinc-400 mb-4">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{ticket.event_location}</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-zinc-500">Ticket Type</span>
            <p className="font-medium">{ticket.ticket_type}</p>
          </div>

          <Link href={`/tickets/${ticket.id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock tickets for demo purposes
const mockTickets = [
  {
    id: "1",
    event_id: "summer-beats-festival",
    event_name: "Summer Beats Festival",
    event_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    event_location: "Skyline Venue, Downtown",
    ticket_type: "VIP",
    purchase_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "active",
    image_url: "/summer-festival.jpg",
  },
  {
    id: "2",
    event_id: "neon-nights",
    event_name: "Neon Nights",
    event_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    event_location: "The Warehouse, East Side",
    ticket_type: "General Admission",
    purchase_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "active",
    image_url: "/neon-nights.jpg",
  },
  {
    id: "3",
    event_id: "techno-tuesday",
    event_name: "Techno Tuesday",
    event_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    event_location: "Underground Club, Downtown",
    ticket_type: "General Admission",
    purchase_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: "used",
    image_url: "/techno-tuesday.jpg",
  },
  {
    id: "4",
    event_id: "house-party",
    event_name: "House Party",
    event_date: new Date(Date.now() + 86400000 * 15).toISOString(),
    event_location: "Beachfront Club, Waterfront",
    ticket_type: "VIP+",
    purchase_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "active",
    image_url: "/house-party.jpg",
  },
  {
    id: "5",
    event_id: "jazz-night",
    event_name: "Jazz Night",
    event_date: new Date(Date.now() - 86400000 * 15).toISOString(),
    event_location: "Blue Note Lounge, Uptown",
    ticket_type: "Reserved Seating",
    purchase_date: new Date(Date.now() - 86400000 * 20).toISOString(),
    status: "used",
    image_url: "/jazz-night.jpg",
  },
  {
    id: "6",
    event_id: "edm-explosion",
    event_name: "EDM Explosion",
    event_date: new Date(Date.now() + 86400000 * 25).toISOString(),
    event_location: "Mega Arena, North District",
    ticket_type: "Early Bird",
    purchase_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "active",
    image_url: "/edm-explosion.jpg",
  },
]
