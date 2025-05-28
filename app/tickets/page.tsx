"use client"

import { useState, useEffect } from "react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { Button } from "@/ui/button"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Input } from "@/ui/input"
import { Calendar, MapPin, Search, Ticket, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

// Define ticket type
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
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Get user from cookies on mount
  useEffect(() => {
    const cookieUser = getUserFromCookies()
    if (cookieUser) {
      setUser(cookieUser)
      console.log("User from cookies:", cookieUser)
    }

    // Fetch tickets (mock data for now)
    setTimeout(() => {
      setTickets(mockTickets)
      setLoading(false)
    }, 1000)
  }, [])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Mock tickets data
  const mockTickets: TicketType[] = [
    {
      id: "1",
      event_id: "summer-beats-festival",
      event_name: "Summer Beats Festival",
      event_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      event_location: "Skyline Venue",
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
      event_location: "The Warehouse",
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
      event_location: "Underground Club",
      ticket_type: "General Admission",
      purchase_date: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: "used",
      image_url: "/techno-tuesday.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <PublicHeader currentPath="/tickets" user={user} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Tickets</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tickets..."
            className="pl-10 bg-zinc-900 border-zinc-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
          </TabsList>

          {/* Upcoming Tickets */}
          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <TicketSkeleton count={2} />
            ) : (
              <>
                {filteredTickets.filter(
                  (ticket) => new Date(ticket.event_date) > new Date() && ticket.status === "active",
                ).length === 0 ? (
                  <EmptyState
                    title="No Upcoming Tickets"
                    description="You don't have any upcoming event tickets yet."
                  />
                ) : (
                  filteredTickets
                    .filter((ticket) => new Date(ticket.event_date) > new Date() && ticket.status === "active")
                    .map((ticket) => <TicketCard key={ticket.id} ticket={ticket} formatDate={formatDate} />)
                )}
              </>
            )}
          </TabsContent>

          {/* Past Tickets */}
          <TabsContent value="past" className="space-y-4">
            {loading ? (
              <TicketSkeleton count={1} />
            ) : (
              <>
                {filteredTickets.filter(
                  (ticket) =>
                    new Date(ticket.event_date) < new Date() || ticket.status === "used" || ticket.status === "expired",
                ).length === 0 ? (
                  <EmptyState title="No Past Tickets" description="You don't have any past event tickets." />
                ) : (
                  filteredTickets
                    .filter(
                      (ticket) =>
                        new Date(ticket.event_date) < new Date() ||
                        ticket.status === "used" ||
                        ticket.status === "expired",
                    )
                    .map((ticket) => <TicketCard key={ticket.id} ticket={ticket} formatDate={formatDate} />)
                )}
              </>
            )}
          </TabsContent>

          {/* All Tickets */}
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <TicketSkeleton count={3} />
            ) : (
              <>
                {filteredTickets.length === 0 ? (
                  searchQuery ? (
                    <EmptyState
                      title="No Matching Tickets"
                      description={`No tickets found matching "${searchQuery}".`}
                    />
                  ) : (
                    <EmptyState title="No Tickets Found" description="You haven't purchased any tickets yet." />
                  )
                ) : (
                  filteredTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} formatDate={formatDate} />
                  ))
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Ticket Card Component
function TicketCard({ ticket, formatDate }: { ticket: TicketType; formatDate: (date: string) => string }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden hover:bg-zinc-900/70 transition-colors">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/4 h-48 md:h-auto">
          <Image
            src={ticket.image_url || "/placeholder.svg?height=300&width=400&query=event"}
            alt={ticket.event_name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r" />
        </div>
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold">{ticket.event_name}</h3>
              <div className="flex items-center text-zinc-400 mt-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(ticket.event_date)}</span>
              </div>
              <div className="flex items-center text-zinc-400 mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{ticket.event_location}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === "active"
                    ? "bg-green-900/30 text-green-400"
                    : ticket.status === "used"
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-red-900/30 text-red-400"
                }`}
              >
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <span className="text-sm text-zinc-400">Ticket Type</span>
              <p className="font-medium">{ticket.ticket_type}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link href={`/tickets/${ticket.id}`}>View Ticket</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Empty State Component
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50">
      <CardContent className="pt-6 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <Ticket className="h-12 w-12 text-zinc-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <p className="text-zinc-400 mb-6">{description}</p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Loading Component
function TicketSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/4 h-48 md:h-auto bg-zinc-800/50 animate-pulse" />
              <div className="flex-1 p-6">
                <div className="h-7 w-3/4 bg-zinc-800/50 rounded animate-pulse mb-4" />
                <div className="h-4 w-1/2 bg-zinc-800/50 rounded animate-pulse mb-2" />
                <div className="h-4 w-2/3 bg-zinc-800/50 rounded animate-pulse mb-4" />
                <div className="flex justify-between items-center">
                  <div className="h-5 w-1/4 bg-zinc-800/50 rounded animate-pulse" />
                  <div className="h-9 w-24 bg-zinc-800/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </Card>
        ))}
    </>
  )
}
