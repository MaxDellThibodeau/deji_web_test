"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/shared/services/client"
import { getUserFromCookies } from "@/shared/utils/auth-utils"
import { PublicHeader } from "@/shared/components/layout/public-header"

// UI Components
import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Calendar, MapPin, ArrowLeft, Download, Share2, Clock, Info, MessageSquare, AlertCircle } from "lucide-react"
import { Badge } from "@/ui/badge"
import { Separator } from "@/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"

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
  qr_code: string
  ticket_number: string
  seat?: string
  price?: string
  description?: string
  terms?: string[]
  venue_info?: {
    name: string
    address: string
    opening_time: string
    facilities: string[]
  }
}

export default function TicketDetailPage() {
  // State
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Get user and ticket
  useEffect(() => {
    let isMounted = true

    async function initPage() {
      try {
        // First check cookies for user info (for demo mode)
        const cookieUser = getUserFromCookies()

        if (cookieUser) {
          if (isMounted) setUser(cookieUser)
          await fetchTicket(params.id, isMounted)
          return
        }

        // If no cookie user, try Supabase auth
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          // If no user is found, redirect to login
          router.push("/login?redirectTo=/tickets")
          return
        }

        if (isMounted) setUser(data.user)
        await fetchTicket(params.id, isMounted)
      } catch (error) {
        console.error("Error initializing page:", error)
        if (isMounted) setLoading(false)
      }
    }

    initPage()

    return () => {
      isMounted = false
    }
  }, [params.id, router, supabase])

  // Fetch ticket
  async function fetchTicket(ticketId, isMounted) {
    try {
      // For demo purposes, we'll use mock data
      // In a real app, you would fetch from Supabase here
      setTimeout(() => {
        const foundTicket = mockTickets.find((t) => t.id === ticketId)

        if (foundTicket && isMounted) {
          setTicket(foundTicket)
        } else if (isMounted) {
          // Handle not found
          router.push("/tickets")
        }

        if (isMounted) setLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error fetching ticket:", error)
      if (isMounted) setLoading(false)
    }
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time
  function formatTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <PublicHeader currentPath={`/tickets/${params.id}`} user={user} />
        <div className="pt-16 flex-1">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center mb-6">
              <Link href="/tickets" className="flex items-center text-zinc-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Tickets</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-64 bg-zinc-800/50 animate-pulse rounded-md mb-6"></div>
                <div className="h-8 bg-zinc-800/50 animate-pulse rounded-md mb-4 w-3/4"></div>
                <div className="h-5 bg-zinc-800/50 animate-pulse rounded-md mb-3 w-1/2"></div>
                <div className="h-5 bg-zinc-800/50 animate-pulse rounded-md mb-6 w-2/3"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-zinc-800/50 animate-pulse rounded-md"></div>
                  <div className="h-20 bg-zinc-800/50 animate-pulse rounded-md"></div>
                </div>
              </div>

              <div>
                <div className="h-80 bg-zinc-800/50 animate-pulse rounded-md mb-6"></div>
                <div className="h-40 bg-zinc-800/50 animate-pulse rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no ticket, show not found
  if (!ticket) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <PublicHeader currentPath={`/tickets/${params.id}`} user={user} />
        <div className="pt-16 flex-1">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center mb-6">
              <Link href="/tickets" className="flex items-center text-zinc-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Tickets</span>
              </Link>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-zinc-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Ticket Not Found</h3>
                  <p className="text-zinc-400 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
                  <Link href="/tickets">
                    <Button>View All Tickets</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath={`/tickets/${params.id}`} user={user} />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Back button */}
          <div className="flex items-center mb-6">
            <Link href="/tickets" className="flex items-center text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Tickets</span>
            </Link>

            <Badge
              className={`ml-auto ${
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden mb-6">
                <div className="relative w-full h-64">
                  <Image
                    src={ticket.image_url || "/placeholder.svg"}
                    alt={ticket.event_name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h1 className="text-3xl font-bold text-white">{ticket.event_name}</h1>
                    <div className="flex items-center text-zinc-300 mt-2">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(ticket.event_date)}</span>
                    </div>
                    <div className="flex items-center text-zinc-300 mt-1">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatTime(ticket.event_date)}</span>
                    </div>
                    <div className="flex items-center text-zinc-300 mt-1">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{ticket.event_location}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="details">Ticket Details</TabsTrigger>
                      <TabsTrigger value="venue">Venue Info</TabsTrigger>
                      <TabsTrigger value="terms">Terms</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-zinc-400">Ticket Type</h3>
                          <p className="text-lg font-semibold">{ticket.ticket_type}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-zinc-400">Ticket Number</h3>
                          <p className="text-lg font-semibold">{ticket.ticket_number}</p>
                        </div>
                        {ticket.seat && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-400">Seat/Section</h3>
                            <p className="text-lg font-semibold">{ticket.seat}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-zinc-400">Purchase Date</h3>
                          <p className="text-lg font-semibold">{formatDate(ticket.purchase_date)}</p>
                        </div>
                        {ticket.price && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-400">Price</h3>
                            <p className="text-lg font-semibold">{ticket.price}</p>
                          </div>
                        )}
                      </div>

                      {ticket.description && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-zinc-400 mb-2">Event Description</h3>
                          <p className="text-zinc-300">{ticket.description}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="venue">
                      {ticket.venue_info ? (
                        <div>
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-zinc-400">Venue</h3>
                            <p className="text-lg font-semibold">{ticket.venue_info.name}</p>
                          </div>

                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-zinc-400">Address</h3>
                            <p className="text-zinc-300">{ticket.venue_info.address}</p>
                          </div>

                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-zinc-400">Doors Open</h3>
                            <p className="text-zinc-300">{ticket.venue_info.opening_time}</p>
                          </div>

                          {ticket.venue_info.facilities && (
                            <div>
                              <h3 className="text-sm font-medium text-zinc-400 mb-2">Facilities</h3>
                              <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                                {ticket.venue_info.facilities.map((facility, index) => (
                                  <li key={index}>{facility}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Info className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                          <p className="text-zinc-400">No venue information available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="terms">
                      {ticket.terms && ticket.terms.length > 0 ? (
                        <div>
                          <h3 className="text-sm font-medium text-zinc-400 mb-2">Terms & Conditions</h3>
                          <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                            {ticket.terms.map((term, index) => (
                              <li key={index}>{term}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Info className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                          <p className="text-zinc-400">No terms and conditions available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-6" />

                  <div className="flex flex-wrap gap-3">
                    <Button className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      <span>Download Ticket</span>
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      <span>Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="bg-zinc-900/50 border-zinc-800/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Ticket QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={ticket.qr_code || "/generic-qr-code.png"}
                        alt="Ticket QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-center text-sm text-zinc-400 mt-4">
                    Present this QR code at the venue entrance for admission
                  </p>

                  <div
                    className={`mt-6 p-3 rounded-md text-center ${
                      ticket.status === "active"
                        ? "bg-green-900/30 text-green-400"
                        : ticket.status === "used"
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    <p className="font-medium">
                      Status: {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 mb-4">
                    If you have any questions or issues with your ticket, please contact our support team.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock tickets for demo purposes
const mockTickets = [
  {
    id: "1",
    event_id: "summer-beats-festival",
    event_name: "Summer Beats Festival",
    event_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    event_location: "Skyline Venue, 123 Main St, Downtown",
    ticket_type: "VIP",
    purchase_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "active",
    image_url: "/summer-festival.jpg",
    qr_code: "/generic-qr-code.png",
    ticket_number: "SBF-VIP-12345",
    seat: "VIP Section A",
    price: "$149.99",
    description:
      "Join us for the biggest summer music festival featuring top artists from around the world. This VIP ticket includes premium viewing areas, complimentary drinks, and exclusive artist meet & greets.",
    terms: [
      "No refunds or exchanges",
      "Event is rain or shine",
      "VIP access includes premium viewing area and complimentary drinks",
      "Must be 21+ to consume alcohol",
      "Re-entry is allowed with valid ticket and hand stamp",
    ],
    venue_info: {
      name: "Skyline Venue",
      address: "123 Main St, Downtown, City",
      opening_time: "6:00 PM",
      facilities: ["Food vendors", "Full bar service", "Restrooms", "First aid station", "VIP lounge", "Coat check"],
    },
  },
  {
    id: "2",
    event_id: "neon-nights",
    event_name: "Neon Nights",
    event_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    event_location: "The Warehouse, 456 Club Ave, East Side",
    ticket_type: "General Admission",
    purchase_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "active",
    image_url: "/neon-nights.jpg",
    qr_code: "/generic-qr-code.png",
    ticket_number: "NN-GA-67890",
    price: "$59.99",
    description:
      "Experience the ultimate electronic music night with world-class DJs and incredible light shows. This General Admission ticket provides access to all main areas of the venue.",
    terms: [
      "No refunds or exchanges",
      "Event is 18+",
      "Valid ID required for entry",
      "No outside food or drinks",
      "Management reserves the right to refuse entry",
    ],
    venue_info: {
      name: "The Warehouse",
      address: "456 Club Ave, East Side, City",
      opening_time: "9:00 PM",
      facilities: ["Multiple dance floors", "Several bars", "Outdoor smoking area", "Coat check ($5)", "ATM available"],
    },
  },
  {
    id: "3",
    event_id: "techno-tuesday",
    event_name: "Techno Tuesday",
    event_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    event_location: "Underground Club, 789 Bass Blvd, Downtown",
    ticket_type: "General Admission",
    purchase_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: "used",
    image_url: "/techno-tuesday.jpg",
    qr_code: "/generic-qr-code.png",
    ticket_number: "TT-GA-24680",
    price: "$25.00",
    description:
      "Our weekly techno night featuring local DJs and special guests. This event showcases the best underground techno talent in the city.",
    terms: ["No refunds or exchanges", "Event is 21+", "Valid ID required for entry", "Re-entry not permitted"],
    venue_info: {
      name: "Underground Club",
      address: "789 Bass Blvd, Downtown, City",
      opening_time: "10:00 PM",
      facilities: ["Main dance floor", "Full bar", "Limited seating area", "Outdoor patio"],
    },
  },
]
