"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Star, Music, MapPin } from "lucide-react"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { useUser } from "@/hooks/use-user"

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
    price: "$500-1500",
    featured: true,
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
    price: "$600-2000",
    featured: true,
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
    price: "$450-1200",
    featured: false,
  },
  {
    id: "dj-echo",
    name: "DJ Echo",
    genres: ["EDM", "Trance", "Progressive"],
    rating: 4.6,
    reviews: 76,
    location: "Las Vegas, NV",
    image: "/vibrant-edm-stage.png",
    bio: "DJ Echo creates immersive soundscapes that take listeners on a journey through trance and progressive EDM.",
    upcomingEvents: 2,
    price: "$800-3000",
    featured: true,
  },
  {
    id: "dj-vinyl",
    name: "DJ Vinyl",
    genres: ["Funk", "Soul", "Disco"],
    rating: 4.9,
    reviews: 112,
    location: "Chicago, IL",
    image: "/groovy-beats.png",
    bio: "A true vinyl enthusiast, DJ Vinyl brings the authentic sounds of funk, soul, and disco to every event.",
    upcomingEvents: 3,
    price: "$550-1800",
    featured: false,
  },
]

export default function DJsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDJs, setFilteredDJs] = useState(DJS)
  const [activeTab, setActiveTab] = useState("all")
  const { user, isLoading } = useUser()

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
      filtered = filtered.filter((dj) => dj.genres.some((genre) => genre.toLowerCase() === activeTab.toLowerCase()))
    }

    setFilteredDJs(filtered)
  }, [searchQuery, activeTab])

  // If loading, show a loading state
  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/djs" user={user} />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Find DJs</h1>

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
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="electronic">Electronic</TabsTrigger>
              <TabsTrigger value="hip hop">Hip Hop</TabsTrigger>
              <TabsTrigger value="latin">Latin</TabsTrigger>
              <TabsTrigger value="edm">EDM</TabsTrigger>
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

                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="text-sm text-zinc-400">Price range</div>
                          <div className="font-medium">{dj.price}</div>
                        </div>
                        <div className="mb-4 md:mb-0">
                          <div className="text-sm text-zinc-400">Upcoming events</div>
                          <div className="font-medium">{dj.upcomingEvents} events</div>
                        </div>
                        <Link href={`/djs/${dj.id}`}>
                          <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
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
