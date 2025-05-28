"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { Button } from "@/ui/button"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Calendar, MapPin, ArrowLeft, Download, Share2, Info, Phone } from "lucide-react"
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
  price: string
  seat?: string
  section?: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_state: string
  venue_zip: string
  terms?: string[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  // State
  const [user, setUser] = useState(null)
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [loading, setLoading] = useState(true)

  // Get user from cookies on mount
  useEffect(() => {
    const cookieUser = getUserFromCookies()
    if (cookieUser) {
      setUser(cookieUser)
    }

    // Fetch ticket (mock data for now)
    setTimeout(() => {
      const foundTicket = mockTickets.find((t) => t.id === ticketId)
      setTicket(foundTicket || null)
      setLoading(false)
    }, 800)
  }, [ticketId])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

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
      price: "$149.99",
      seat: "GA",
      section: "VIP Area",
      venue_name: "Skyline Venue",
      venue_address: "123 Main Street",
      venue_city: "Los Angeles",
      venue_state: "CA",
      venue_zip: "90001",
      terms: [
        "No refunds or exchanges",
        "Valid ID required for entry",
        "No outside food or drinks",
        "Event is rain or shine",
        "Ticket is non-transferable",
      ],
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
      price: "$59.99",
      venue_name: "The Warehouse",
      venue_address: "456 Club Avenue",
      venue_city: "New York",
      venue_state: "NY",
      venue_zip: "10001",
      terms: [
        "No refunds or exchanges",
        "Valid ID required for entry",
        "No outside food or drinks",
        "Event is rain or shine",
      ],
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
      price: "$29.99",
      venue_name: "Underground Club",
      venue_address: "789 Bass Street",
      venue_city: "Chicago",
      venue_state: "IL",
      venue_zip: "60601",
      terms: [
        "No refunds or exchanges",
        "Valid ID required for entry",
        "No outside food or drinks",
        "Event is rain or shine",
      ],
    },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader currentPath="/tickets" user={user} />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" className="mr-4 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-48 bg-zinc-800/50 rounded animate-pulse" />
          </div>
          <div className="relative w-full h-64 bg-zinc-800/50 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-8 w-3/4 bg-zinc-800/50 rounded animate-pulse mb-4" />
              <div className="h-6 w-1/2 bg-zinc-800/50 rounded animate-pulse mb-4" />
              <div className="h-6 w-2/3 bg-zinc-800/50 rounded animate-pulse mb-6" />
              <div className="h-40 w-full bg-zinc-800/50 rounded animate-pulse" />
            </div>
            <div>
              <div className="h-full bg-zinc-800/50 rounded animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Not found state
  if (!ticket) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader currentPath="/tickets" user={user} />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <Link href="/tickets">
              <Button variant="ghost" size="icon" className="mr-4 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Ticket Not Found</h1>
          </div>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <Info className="h-12 w-12 text-zinc-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Ticket Not Found</h3>
                <p className="text-zinc-400 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
                <Link href="/tickets">
                  <Button>Back to My Tickets</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader currentPath="/tickets" user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link href="/tickets">
            <Button variant="ghost" size="icon" className="mr-4 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Ticket Details</h1>
        </div>

        {/* Event Image */}
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image
            src={ticket.image_url || "/placeholder.svg?height=400&width=800&query=event"}
            alt={ticket.event_name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{ticket.event_name}</h2>
            <div className="flex items-center text-zinc-200">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {formatDate(ticket.event_date)} at {formatTime(ticket.event_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800/50 mb-6">
              <CardContent className="p-0">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="details">Ticket Details</TabsTrigger>
                    <TabsTrigger value="venue">Venue Info</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                  </TabsList>

                  {/* Ticket Details Tab */}
                  <TabsContent value="details" className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm text-zinc-400">Ticket Type</h3>
                        <p className="font-medium">{ticket.ticket_type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-zinc-400">Price</h3>
                        <p className="font-medium">{ticket.price}</p>
                      </div>
                      {ticket.section && (
                        <div>
                          <h3 className="text-sm text-zinc-400">Section</h3>
                          <p className="font-medium">{ticket.section}</p>
                        </div>
                      )}
                      {ticket.seat && (
                        <div>
                          <h3 className="text-sm text-zinc-400">Seat</h3>
                          <p className="font-medium">{ticket.seat}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm text-zinc-400">Purchase Date</h3>
                        <p className="font-medium">{formatDate(ticket.purchase_date)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-zinc-400">Status</h3>
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

                    <div className="flex space-x-4">
                      <Button variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Venue Info Tab */}
                  <TabsContent value="venue" className="p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">{ticket.venue_name}</h3>
                      <p className="text-zinc-400">{ticket.venue_address}</p>
                      <p className="text-zinc-400">
                        {ticket.venue_city}, {ticket.venue_state} {ticket.venue_zip}
                      </p>
                    </div>

                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6 bg-zinc-800/50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-zinc-500">Map view unavailable in demo</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </TabsContent>

                  {/* Terms Tab */}
                  <TabsContent value="terms" className="p-6">
                    <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
                    <ul className="space-y-2">
                      {ticket.terms?.map((term, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-zinc-400 mr-2">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 pt-6 border-t border-zinc-800">
                      <h4 className="font-medium mb-2">Need Help?</h4>
                      <Button variant="outline" className="w-full">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Support
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Sidebar */}
          <div>
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Entry Pass</h3>

                <div className="bg-white p-4 rounded-lg mb-4">
                  <div className="aspect-square relative">
                    <Image src="/generic-qr-code.png" alt="QR Code" fill className="object-contain" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm text-zinc-400 mb-1">Ticket ID</p>
                  <p className="font-mono font-medium">{ticket.id.toUpperCase()}</p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-center text-zinc-400">
                    Present this QR code at the venue entrance for admission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
