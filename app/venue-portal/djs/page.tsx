"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Filter, Star, Music, MapPin, DollarSign, Calendar, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleDashboardLayout } from "@/src/shared/components/layout/role-dashboard-layout"
import { useRouter } from "next/navigation"

// Mock data for DJs
const DJS = [
  {
    id: "dj-pulse",
    name: "DJ Pulse",
    genres: ["Electronic", "House", "Techno"],
    rating: 4.9,
    reviews: 124,
    location: "Los Angeles, CA",
    image: "/hip-hop-dj-in-action.png",
    bio: "DJ Pulse is known for energetic sets that blend house and techno with unexpected samples and remixes.",
    upcomingEvents: 3,
    hourlyRate: 200,
    bookingFee: 500,
    featured: true,
    availability: "Available",
  },
  {
    id: "dj-nova",
    name: "DJ Nova",
    genres: ["Hip Hop", "R&B", "Trap"],
    rating: 4.7,
    reviews: 98,
    location: "New York, NY",
    image: "/energetic-dj-set.png",
    bio: "With roots in the NYC hip hop scene, DJ Nova brings authentic urban vibes to every performance.",
    upcomingEvents: 5,
    hourlyRate: 250,
    bookingFee: 600,
    featured: true,
    availability: "Busy",
  },
  {
    id: "dj-rhythm",
    name: "DJ Rhythm",
    genres: ["Latin", "Reggaeton", "Salsa"],
    rating: 4.8,
    reviews: 87,
    location: "Miami, FL",
    image: "/vibrant-latin-beats.png",
    bio: "DJ Rhythm specializes in Latin beats that get everyone on the dance floor, from salsa to modern reggaeton.",
    upcomingEvents: 4,
    hourlyRate: 180,
    bookingFee: 450,
    featured: false,
    availability: "Available",
  },
]

export default function VenueBrowseDJsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDJs, setFilteredDJs] = useState(DJS)
  const [activeTab, setActiveTab] = useState("all")

  // Filter DJs based on search query and active tab
  useEffect(() => {
    let filtered = DJS

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (dj) =>
          dj.name.toLowerCase().includes(query) ||
          dj.location.toLowerCase().includes(query) ||
          dj.genres.some((genre) => genre.toLowerCase().includes(query)),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "available") {
        filtered = filtered.filter((dj) => dj.availability === "Available")
      } else if (activeTab === "featured") {
        filtered = filtered.filter((dj) => dj.featured)
      } else {
        filtered = filtered.filter((dj) => dj.genres.some((genre) => genre.toLowerCase() === activeTab.toLowerCase()))
      }
    }

    setFilteredDJs(filtered)
  }, [searchQuery, activeTab])

  const handleBookDJ = (djId: string) => {
    // Navigate to booking page or open booking modal
    router.push(`/venue-portal/djs/${djId}/book`)
  }

  return (
    <RoleDashboardLayout title="Browse DJs" role="venue">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Browse DJs</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search DJs, genres, locations..."
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
            <TabsTrigger value="all">All DJs</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="electronic">Electronic</TabsTrigger>
            <TabsTrigger value="hip hop">Hip Hop</TabsTrigger>
            <TabsTrigger value="latin">Latin</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredDJs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium mb-2">No DJs found</h3>
            <p className="text-zinc-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredDJs.map((dj) => (
              <Card key={dj.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-64 md:h-auto md:w-64 flex-shrink-0">
                    <Image src={dj.image || "/placeholder.svg"} alt={dj.name} fill className="object-cover" />
                    {dj.featured && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          dj.availability === "Available"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {dj.availability}
                      </span>
                    </div>
                  </div>

                  <CardContent className="flex-grow p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dj.genres.map((genre) => (
                        <Badge key={genre} className="bg-zinc-700">
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">{dj.name}</h2>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{dj.rating}</span>
                        <span className="text-zinc-400 text-sm ml-1">({dj.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center text-zinc-300 mb-4">
                      <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                      <span>{dj.location}</span>
                    </div>

                    <p className="text-zinc-400 mb-6">{dj.bio}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-zinc-400">Hourly Rate</div>
                        <div className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {dj.hourlyRate}/hour
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Booking Fee</div>
                        <div className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {dj.bookingFee}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Upcoming events</div>
                        <div className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {dj.upcomingEvents} events
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="bg-zinc-800 border-zinc-700"
                        onClick={() => router.push(`/djs/${dj.id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                        onClick={() => handleBookDJ(dj.id)}
                        disabled={dj.availability !== "Available"}
                      >
                        {dj.availability === "Available" ? "Book DJ" : "Not Available"}
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  )
}
