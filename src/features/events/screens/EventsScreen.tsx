import { useState } from "react"
import { Search, Filter, Calendar, MapPin, Clock, Users, Crown, X, DollarSign, Music } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"

interface Song {
  id: number
  title: string
  artist: string
  bidAmount: number
  position: number
  duration: string
  genre: string
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  venue: string
  location: string
  description: string
  price: number
  image: string
  genre: string
  capacity: number
  ticketsLeft: number
  featuredDj: string
  songs: Song[]
  allSongs: Song[]
  longDescription: string
  amenities: string[]
  ageRestriction: string
  dateValue: string // Adding date value in YYYY-MM-DD format for filtering
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Summer Beats Festival",
    date: "Saturday, June 14, 2025",
    dateValue: "2025-06-14",
    time: "4:00 PM - 11:00 PM",
    venue: "Skyline Venue",
    location: "Downtown",
    description: "Join us for the hottest electronic music festival of the summer! DJ Pulse will be headlining with support from other amazing electronic artists.",
    longDescription: "Experience the ultimate summer electronic music festival featuring world-class DJs, state-of-the-art sound systems, and an unforgettable atmosphere. DJ Pulse headlines this incredible event with support from renowned artists in the electronic music scene. Dance under the stars as the city lights create the perfect backdrop for an epic night of music and energy.",
    price: 45,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    genre: "Electronic",
    capacity: 500,
    ticketsLeft: 456,
    featuredDj: "DJ Pulse",
    amenities: ["Full Bar", "VIP Area", "Coat Check", "Food Trucks", "Photo Booth"],
    ageRestriction: "21+",
    songs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ],
    allSongs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" },
      { id: 4, title: "Watermelon Sugar", artist: "Harry Styles", bidAmount: 87, position: 4, duration: "2:54", genre: "Pop" },
      { id: 5, title: "Physical", artist: "Dua Lipa", bidAmount: 76, position: 5, duration: "3:13", genre: "Pop" },
      { id: 6, title: "As It Was", artist: "Harry Styles", bidAmount: 65, position: 6, duration: "2:47", genre: "Pop" },
      { id: 7, title: "Anti-Hero", artist: "Taylor Swift", bidAmount: 54, position: 7, duration: "3:20", genre: "Pop" },
      { id: 8, title: "Flowers", artist: "Miley Cyrus", bidAmount: 43, position: 8, duration: "3:20", genre: "Pop" }
    ]
  },
  {
    id: 2,
    title: "Neon Nights",
    date: "Wednesday, July 2, 2025",
    dateValue: "2025-07-02",
    time: "10:00 PM - 4:00 AM",
    venue: "The Warehouse",
    location: "East Side",
    description: "Step into a world of neon lights and electronic beats at this immersive nightclub experience.",
    longDescription: "Neon Nights transforms The Warehouse into a cyberpunk paradise with cutting-edge lighting, immersive visuals, and the hottest electronic beats. DJ Nova brings their signature sound to create an otherworldly experience that will keep you dancing until dawn.",
    price: 35,
    image: "https://images.unsplash.com/photo-1571266028243-d220c846c1e7?w=400&h=300&fit=crop",
    genre: "Electronic",
    capacity: 300,
    ticketsLeft: 248,
    featuredDj: "DJ Nova",
    amenities: ["Full Bar", "LED Dance Floor", "Chill Zone", "Smoking Area"],
    ageRestriction: "18+",
    songs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ],
    allSongs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" },
      { id: 4, title: "One More Time", artist: "Daft Punk", bidAmount: 89, position: 4, duration: "5:20", genre: "Electronic" }
    ]
  },
  {
    id: 3,
    title: "Retro Remix",
    date: "Monday, July 21, 2025",
    dateValue: "2025-07-21",
    time: "9:00 PM - 2:00 AM",
    venue: "Classic Lounge",
    location: "West End",
    description: "Travel back in time with DJ Throwback as they spin the greatest hits from the 70s, 80s, and 90s.",
    longDescription: "Take a nostalgic journey through the greatest decades of music with DJ Throwback's incredible retro collection. From disco classics to new wave hits, this night celebrates the timeless tracks that defined generations.",
    price: 40,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
    genre: "Pop",
    capacity: 200,
    ticketsLeft: 178,
    featuredDj: "DJ Throwback",
    amenities: ["Cocktail Bar", "Retro Photo Booth", "Vintage Decor"],
    ageRestriction: "21+",
    songs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ],
    allSongs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ]
  },
  {
    id: 4,
    title: "Latin Fiesta",
    date: "Monday, September 1, 2025",
    dateValue: "2025-09-01",
    time: "8:00 PM - 1:00 AM",
    venue: "Salsa Club",
    location: "East End",
    description: "Experience the passion and energy of Latin music at this vibrant fiesta!",
    longDescription: "¡Vamos a bailar! Join us for an authentic Latin music celebration featuring the hottest reggaeton, salsa, bachata, and Latin pop hits. DJ Ritmo brings the heat with non-stop dancing and incredible energy all night long.",
    price: 40,
    image: "https://images.unsplash.com/photo-1574391884720-bbc2f1b6e15f?w=400&h=300&fit=crop",
    genre: "Latin",
    capacity: 250,
    ticketsLeft: 189,
    featuredDj: "DJ Ritmo",
    amenities: ["Salsa Lessons", "Latin Food", "Mojito Bar", "Dance Floor"],
    ageRestriction: "18+",
    songs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ],
    allSongs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", bidAmount: 145, position: 1, duration: "3:20", genre: "Electronic" },
      { id: 2, title: "Don't Start Now", artist: "Dua Lipa", bidAmount: 132, position: 2, duration: "3:03", genre: "Pop" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", bidAmount: 98, position: 3, duration: "3:23", genre: "Pop" }
    ]
  }
]

const genres = ["All", "Electronic", "Pop", "Latin", "Hip Hop"]

export function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [filteredEvents, setFilteredEvents] = useState(mockEvents)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showAllSongs, setShowAllSongs] = useState<number | null>(null)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [locationFilter, setLocationFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [dateRangeError, setDateRangeError] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterEvents(query, selectedGenre)
  }

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre)
    filterEvents(searchQuery, genre)
  }

  const validateDateRange = (start: string, end: string) => {
    if (start && end) {
      const startDateObj = new Date(start)
      const endDateObj = new Date(end)
      
      if (startDateObj > endDateObj) {
        setDateRangeError("Start date must be the same or before end date")
        return false
      }
    }
    setDateRangeError("")
    return true
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    validateDateRange(date, endDate)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    validateDateRange(startDate, date)
  }

  const filterEvents = (query: string, genre: string) => {
    let filtered = mockEvents

    if (genre !== "All") {
      filtered = filtered.filter(event => event.genre === genre)
    }

    if (query.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.venue.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase()) ||
        event.featuredDj.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Apply additional filters
    if (locationFilter) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    filtered = filtered.filter(event =>
      event.price >= priceRange[0] && event.price <= priceRange[1]
    )

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.dateValue)
        
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          return eventDate >= start && eventDate <= end
        } else if (startDate) {
          const start = new Date(startDate)
          return eventDate >= start
        } else if (endDate) {
          const end = new Date(endDate)
          return eventDate <= end
        }
        
        return true
      })
    }

    setFilteredEvents(filtered)
  }

  const handleBid = (song: Song, eventId: number) => {
    setSelectedSong(song)
    setBidModalOpen(true)
  }

  const submitBid = () => {
    if (selectedSong && bidAmount) {
      // Here you would normally submit the bid to your backend
      console.log(`Bid submitted: $${bidAmount} for "${selectedSong.title}" by ${selectedSong.artist}`)
      setBidModalOpen(false)
      setBidAmount("")
      setSelectedSong(null)
      // You could update the local state to reflect the new bid
    }
  }

  const toggleAllSongs = (eventId: number) => {
    setShowAllSongs(showAllSongs === eventId ? null : eventId)
  }

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
  }

  const clearFilters = () => {
    setPriceRange([0, 100])
    setLocationFilter("")
    setStartDate("")
    setEndDate("")
    setDateRangeError("")
    filterEvents(searchQuery, selectedGenre)
  }

  const applyFilters = () => {
    if (!dateRangeError) {
      filterEvents(searchQuery, selectedGenre)
      setShowFilters(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-8">Upcoming Events</h1>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events, DJs, venues..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-6 py-3 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Filter Events</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                      />
                    </div>
                    {dateRangeError && (
                      <p className="text-red-400 text-xs">{dateRangeError}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={applyFilters}
                    disabled={!!dateRangeError}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Genre Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGenre === genre
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="flex">
                {/* Event Image */}
                <div className="w-72 h-64 flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {event.genre}
                        </span>
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          {event.ticketsLeft} tickets left
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.venue}, {event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-300 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">Featuring {event.featuredDj}</span>
                  </div>

                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      ${event.price}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => window.location.href = `/events/${event.id}/songs`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2"
                      >
                        <Music className="h-4 w-4" />
                        Request Songs
                      </Button>
                      <Button 
                        onClick={() => openEventDetails(event)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Song Leaderboard */}
                <div className="w-80 bg-zinc-800 p-6 border-l border-zinc-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-white">Song Leaderboard</h3>
                  </div>

                  <div className="space-y-3">
                    {(showAllSongs === event.id ? event.allSongs : event.songs).map((song) => (
                      <div key={song.id} className="flex items-center gap-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${song.position === 1 ? 'bg-yellow-500 text-black' : 
                            song.position === 2 ? 'bg-gray-400 text-black' : 
                            'bg-orange-600 text-white'}
                        `}>
                          {song.position}
                        </div>
                        <div className="w-10 h-10 bg-gray-600 rounded"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {song.title}
                          </div>
                          <div className="text-gray-400 text-xs truncate">
                            {song.artist}
                          </div>
                        </div>
                        <div className="text-white text-sm font-medium">
                          ${song.bidAmount}
                        </div>
                        <Button
                          onClick={() => handleBid(song, event.id)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
                        >
                          Bid
                        </Button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => toggleAllSongs(event.id)}
                    className="text-purple-400 hover:text-purple-300 text-sm mt-4 w-full text-center"
                  >
                    {showAllSongs === event.id ? 'Show less' : 'View all songs'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={closeEventDetails}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.venue}, {selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{selectedEvent.featuredDj}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${selectedEvent.price}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-zinc-800 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-400">Age Restriction: </span>
                    <span className="text-sm font-medium">{selectedEvent.ageRestriction}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                <p className="text-gray-300 leading-relaxed">{selectedEvent.longDescription}</p>
              </div>
              
              <div className="flex gap-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Buy Tickets - ${selectedEvent.price}
                </Button>
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                  Add to Favorites
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bid Modal */}
      {bidModalOpen && selectedSong && (
        <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Place Your Bid</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg">
                <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                  <Music className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <div className="font-medium">{selectedSong.title}</div>
                  <div className="text-sm text-gray-400">{selectedSong.artist}</div>
                  <div className="text-sm text-gray-400">Current bid: ${selectedSong.bidAmount}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Bid Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Minimum: $${selectedSong.bidAmount + 1}`}
                    min={selectedSong.bidAmount + 1}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Minimum bid: ${selectedSong.bidAmount + 1}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setBidModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= selectedSong.bidAmount}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Place Bid
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 