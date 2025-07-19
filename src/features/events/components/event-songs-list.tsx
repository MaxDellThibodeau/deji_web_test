
import { useState, useEffect, useRef } from "react"
// // import Image from "next/image" // Use regular img tags in Vite // Replaced with regular img tags
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Search, Music, TrendingUp, TrendingDown, Clock, Plus, RefreshCw, Wifi, WifiOff, ExternalLink } from "lucide-react"
import { BidSongModal } from "@/features/music/components/bid-song-modal"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useToast } from "@/shared/hooks/use-toast"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useWebSocket } from "@/shared/hooks/use-websocket"
import { songService, EventSong } from "@/features/music/services/song-service"
import { SpotifyTrack } from "@/features/music/services/spotify-api"
import { Card } from "@/shared/components/ui/card"

interface EventSongsListProps {
  eventId: string
  showAll?: boolean
  onToggleShowAll?: () => void
  className?: string
}

export function EventSongsList({ eventId, showAll = false, onToggleShowAll, className = "" }: EventSongsListProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"tokens" | "recent">("tokens")
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [userBids, setUserBids] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [songs, setSongs] = useState<EventSong[]>([])
  const [userTokens, setUserTokens] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Use a ref to track if songs have been loaded
  const songsLoadedRef = useRef(false)

  // Get user from auth store
  const { user, isAuthenticated } = useAuthStore()

  // Set up WebSocket connection with fallback
  const { isConnected, isAvailable, sendMessage } = useWebSocket({
    eventId,
    userId: user?.id,
    enableWebSockets: true, // Try to enable WebSockets
    onMessage: (data) => {
      // Handle real-time updates
      if (data.songs) {
        console.log("[WebSocket] Received song updates:", data.songs)
        setSongs(data.songs)
        setLastUpdate(new Date())
      }

      if (data.updatedSong) {
        console.log("[WebSocket] Received single song update:", data.updatedSong)
        // Update a single song in the list
        setSongs((prevSongs) => {
          return prevSongs.map((song) => {
            if (
              song.id === data.updatedSong.id ||
              (song.title === data.updatedSong.title && song.artist === data.updatedSong.artist)
            ) {
              return {
                ...song,
                ...data.updatedSong,
                trending: "up", // Mark as trending up when updated
              }
            }
            return song
          })
        })
        setLastUpdate(new Date())
      }

      if (data.userTokens && user?.id === data.userId) {
        console.log("[WebSocket] Received token update:", data.userTokens)
        setUserTokens(data.userTokens)
      }
    },
  })

  // Set up polling interval based on WebSocket availability
  useEffect(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }

    // If WebSockets are connected, use a longer interval (as a backup)
    // If not, use a shorter interval for more frequent updates
    const interval = isConnected ? 60000 : 15000 // 60 seconds if connected, 15 seconds if not

    const newInterval = setInterval(() => {
      if (!document.hidden) {
        // Only refresh if the page is visible
        fetchSongData()
      }
    }, interval)

    setRefreshInterval(newInterval)

    return () => {
      if (newInterval) {
        clearInterval(newInterval)
      }
    }
  }, [isConnected])

  // Fetch song data from the API
  const fetchSongData = async () => {
    try {
      setIsRefreshing(true)

      // Import the getSongRequests function
      const { getSongRequests } = await import("@/features/payments/actions/token-actions")

      // Fetch song data for this event
      const songData = await getSongRequests(eventId)

      if (songData && Array.isArray(songData)) {
        console.log(`[EventSongsList] Loaded ${songData.length} songs for event ${eventId}`)

        // Store the songs in localStorage for persistence
        if (typeof window !== "undefined") {
          try {
            // Convert array to object with song keys for easier updates
            const songsObject = {}
            songData.forEach((song) => {
              songsObject[`${song.title}:${song.artist}`] = {
                ...song,
                event_id: eventId,
              }
            })

            // Store in localStorage with event-specific key
            localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(songsObject))
          } catch (err) {
            console.error("[EventSongsList] Error storing songs in localStorage:", err)
          }
        }

        setSongs(songData)
        songsLoadedRef.current = true
        setLastUpdate(new Date())
      } else {
        console.log("[EventSongsList] No song data returned or invalid format")
      }
    } catch (error) {
      console.error("[EventSongsList] Error fetching song data:", error)
      toast({
        title: "Error",
        description: "Failed to load song data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch user's bids and token balance
  const fetchUserData = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      // Fetch user's token balance
      const { getUserTokens } = await import("@/features/payments/actions/token-actions")
      const tokenData = await getUserTokens(user.id)

      if (tokenData) {
        console.log("User token balance:", tokenData.balance)
        setUserTokens(tokenData.balance || 0)
      }

      // Fetch user's bids for this event
      // In a real app, we would have an API endpoint for this
      // For now, we'll use mock data
      const mockUserBids = {
        "mock-song-1": 45,
        "mock-song-3": 25,
      }
      setUserBids(mockUserBids)

      console.log(`[USER DATA] Loaded bids for user ${user.id} on event ${eventId}`)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your bid information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    console.log(`[EventSongsList] Initializing for event ${eventId}`)

    const loadData = async () => {
      setIsLoading(true)

      // Try to load songs from localStorage first for immediate display
      if (typeof window !== "undefined") {
        try {
          const storedSongsString = localStorage.getItem(`eventSongs_${eventId}`)
          if (storedSongsString) {
            const storedSongs = JSON.parse(storedSongsString)
            const songsArray = Object.values(storedSongs)

            if (songsArray.length > 0) {
              console.log(`[EventSongsList] Loaded ${songsArray.length} songs from localStorage for event ${eventId}`)
              setSongs(songsArray)
              songsLoadedRef.current = true
            }
          }
        } catch (err) {
          console.error("[EventSongsList] Error loading songs from localStorage:", err)
        }
      }

      // Then fetch fresh data from the API
      await fetchSongData()
      // TODO: Fix fetchUserData authentication issue
      // await fetchUserData()
      
      // Set mock token balance for now
      if (user?.id) {
        setUserTokens(100) // Demo user gets 100 tokens
      }
      setIsLoading(false)
    }

    loadData()

    // Cleanup function
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [eventId])

  const handleBid = (song: any) => {
    if (!user?.id) {
      // Redirect to login with return URL
      navigate(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}/songs`)}`)
      return
    }

    // Open bid modal
    setSelectedSong(song)
    setIsBidModalOpen(true)
  }

  const handleBidComplete = async (amount: number) => {
    try {
      console.log(`[EventSongsList] Bid completed: ${amount} tokens on song ${selectedSong?.title}`)

      // Update user's token balance locally (optimistic update)
      setUserTokens((prev) => prev - amount)

      // Update user's bids locally (optimistic update)
      setUserBids((prev) => ({
        ...prev,
        [selectedSong.id]: (prev[selectedSong.id] || 0) + amount,
      }))

      // Update the songs list - either update existing song or add new one
      setSongs((prevSongs) => {
        // Check if song already exists in the list
        const existingSongIndex = prevSongs.findIndex((song) => 
          song.id === selectedSong.id ||
          (song.title === selectedSong.title && song.artist === selectedSong.artist)
        )

        if (existingSongIndex >= 0) {
          // Update existing song
          return prevSongs.map((song) => {
          if (
            song.id === selectedSong.id ||
            (song.title === selectedSong.title && song.artist === selectedSong.artist)
          ) {
            // Add the bid amount to the existing token count
            const newTokenCount = song.tokens + amount
            console.log(
                `[EventSongsList] Updating existing song "${song.title}" tokens: ${song.tokens} + ${amount} = ${newTokenCount}`,
            )

            const updatedSong = {
              ...song,
              tokens: newTokenCount,
              bidders: song.bidders + (userBids[song.id] ? 0 : 1), // Increment bidders only if this is a new bidder
                trending: "up" as const,
              lastBid: new Date().toISOString(),
            }

            // Also update the song in localStorage
            if (typeof window !== "undefined") {
              try {
                const storedSongsString = localStorage.getItem(`eventSongs_${eventId}`) || "{}"
                const storedSongs = JSON.parse(storedSongsString)
                const songKey = `${song.title}:${song.artist}`

                storedSongs[songKey] = {
                  ...updatedSong,
                  event_id: eventId,
                }

                localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(storedSongs))
              } catch (err) {
                console.error("[EventSongsList] Error updating song in localStorage:", err)
              }
            }

            return updatedSong
          }
          return song
          })
        } else {
          // Add new song to the leaderboard
          console.log(`[EventSongsList] Adding new song "${selectedSong.title}" to leaderboard with ${amount} tokens`)
          
          const newSong = {
            id: selectedSong.id || `${selectedSong.title}-${selectedSong.artist}`,
            eventId: eventId,
            spotifyId: selectedSong.id,
            title: selectedSong.title,
            artist: selectedSong.artist,
            album: selectedSong.album || "",
            albumArt: selectedSong.albumArt || null,
            duration: selectedSong.duration || 0,
            popularity: selectedSong.popularity || 0,
            spotifyUrl: selectedSong.spotifyUrl || "",
            previewUrl: selectedSong.previewUrl || null,
            tokens: amount, // Start with the bid amount
            totalBids: amount,
            bidders: 1, // First bidder
            trending: "up" as const,
            lastBid: new Date().toISOString(),
            addedAt: new Date().toISOString(),
            addedBy: user!.id,
          }

          // Add to localStorage
          if (typeof window !== "undefined") {
            try {
              const storedSongsString = localStorage.getItem(`eventSongs_${eventId}`) || "{}"
              const storedSongs = JSON.parse(storedSongsString)
              const songKey = `${selectedSong.title}:${selectedSong.artist}`

              storedSongs[songKey] = {
                ...newSong,
                event_id: eventId,
              }

              localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(storedSongs))
            } catch (err) {
              console.error("[EventSongsList] Error adding new song to localStorage:", err)
            }
          }

          return [newSong, ...prevSongs]
        }
      })

      // Make the actual API call to place the bid
      const { bidOnSong } = await import("@/features/payments/actions/token-actions")
      const result = await bidOnSong(user!.id, eventId, selectedSong.title, selectedSong.artist, amount)

      if (!result.success) {
        throw new Error(result.error || "Failed to place bid")
      }

      // Send WebSocket update if available
      if (isConnected && isAvailable) {
        sendMessage({
          type: "event_update",
          eventId,
          data: {
            updatedSong: {
              id: selectedSong.id,
              title: selectedSong.title,
              artist: selectedSong.artist,
              tokens: selectedSong.tokens + amount,
              bidders: selectedSong.bidders + (userBids[selectedSong.id] ? 0 : 1),
            },
          },
        })
      }

      toast({
        title: "Bid placed successfully!",
        description: `Your bid of ${amount} tokens has been placed.`,
      })
    } catch (error) {
      console.error("Error updating after bid:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the song data",
        variant: "destructive",
      })

      // Revert optimistic updates
      fetchSongData()
      fetchUserData()
    }
  }

  const handleRefresh = () => {
    fetchSongData()
  }

  const handleRequestNewSong = () => {
    if (!user?.id) {
      // Redirect to login with return URL
      navigate(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}/songs`)}`)
      return
    }

    // Open bid modal with empty song
    setSelectedSong({ id: "new", title: "", artist: "" })
    setIsBidModalOpen(true)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await songService.searchSongs(query, 10)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching songs:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddSong = async (spotifyId: string) => {
    // Check if user has enough tokens
    if (userTokens < 10) {
      toast({
        title: "Insufficient Tokens",
        description: "You need at least 10 tokens to add a song to the event",
        variant: "destructive",
      })
      return
    }

    // Find the selected song from search results
    const selectedTrack = searchResults.find(track => track.id === spotifyId)
    if (!selectedTrack) {
      toast({
        title: "Song Not Found",
        description: "Unable to find the selected song",
        variant: "destructive",
      })
      return
    }

    // Clear search and open bid modal for the selected song
      setSearchQuery("")
      setSearchResults([])
      setShowSearch(false)
    
    // Set the selected song and open bid modal
    setSelectedSong({
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      album: selectedTrack.album || "",
      albumArt: selectedTrack.albumArt || "",
      duration: selectedTrack.duration || 0,
      popularity: selectedTrack.popularity || 0,
      spotifyUrl: selectedTrack.spotifyUrl || "",
      previewUrl: selectedTrack.previewUrl || "",
      tokens: 0, // Starting with no bids
      bidders: 0,
      trending: "neutral"
    })
    setIsBidModalOpen(true)
  }

  const handlePlaceBid = async (songId: string, bidAmount: number) => {
    try {
      await songService.placeBid(eventId, songId, bidAmount)
      // Reload songs to get updated bid amounts
      await fetchSongData()
    } catch (error) {
      console.error('Error placing bid:', error)
      // TODO: Show error toast
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTokens = (tokens: number | undefined) => {
    if (!tokens && tokens !== 0) {
      return "0"
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`
    }
    return tokens.toString()
  }

  const displayedSongs = showAll ? songs : songs.slice(0, 3)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with search toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Song Requests</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Song</span>
        </Button>
      </div>

      {/* Search section */}
      {showSearch && (
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search for songs on Spotify..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
            />
          </div>

          {/* Search results */}
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {track.albumArt && (
                      <img 
                        src={track.albumArt} 
                        alt={track.album}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{track.title}</p>
                      <p className="text-xs text-zinc-400">{track.artist}</p>
                      <p className="text-xs text-zinc-500">{track.album}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-400">{formatDuration(track.duration)}</span>
                    <Button
                      size="sm"
                      onClick={() => handleAddSong(track.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Songs list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-2">No songs requested yet</p>
          <p className="text-sm text-zinc-500">Be the first to add a song to this event!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedSongs.map((song, index) => (
            <Card key={song.id} className="p-4 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-zinc-800 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  {song.albumArt && (
                    <img 
                      src={song.albumArt} 
                      alt={song.album}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{song.title}</h4>
                      <a 
                        href={song.spotifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-400"
                        title="Open in Spotify"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-sm text-zinc-400">{song.artist}</p>
                    <p className="text-xs text-zinc-500">{song.album} • {formatDuration(song.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-purple-400">
                        {formatTokens(song.totalBids)}
                      </span>
                      {song.trending === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : song.trending === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-500">{song.bidders} bidders</p>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      // TODO: Open bid modal
                      const amount = prompt('Enter bid amount:')
                      if (amount && !isNaN(Number(amount))) {
                        handlePlaceBid(song.id, Number(amount))
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Bid
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Show more/less toggle */}
      {songs.length > 3 && onToggleShowAll && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onToggleShowAll}
            className="text-purple-400 hover:text-purple-300"
          >
            {showAll ? "Show less" : `View all ${songs.length} songs`}
          </Button>
        </div>
      )}

      {user?.id && userTokens <= 0 && (
        <div className="mt-6 bg-amber-900/30 border border-amber-700/50 text-amber-200 p-4 rounded-lg text-center">
          <h3 className="font-medium mb-1">You're out of tokens!</h3>
          <p className="text-sm mb-3">Purchase more tokens to continue bidding on songs.</p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate("/token-bidding")}>
            Buy Tokens
          </Button>
        </div>
      )}

      {isBidModalOpen && selectedSong && (
        <BidSongModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          song={selectedSong}
          eventId={eventId}
          onBidComplete={handleBidComplete}
        />
      )}
    </div>
  )
}
