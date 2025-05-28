"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Search, Music, TrendingUp, TrendingDown, Clock, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { BidSongModal } from "@/features/songs/components/bid-song-modal"
import { Skeleton } from "@/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getUserFromCookies } from "@/shared/utils/auth-utils"
import { useWebSocket } from "@/hooks/use-websocket"

interface EventSongsListProps {
  eventId: string
  userId?: string
}

export function EventSongsList({ eventId, userId }: EventSongsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"tokens" | "recent">("tokens")
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [userBids, setUserBids] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [songs, setSongs] = useState<any[]>([])
  const [userTokens, setUserTokens] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Use a ref to track if songs have been loaded
  const songsLoadedRef = useRef(false)

  // Get user from cookies
  const user = getUserFromCookies()

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
      await fetchUserData()
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
      router.push(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}/songs`)}`)
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

      // Immediately update the UI to show the new token count (optimistic update)
      setSongs((prevSongs) =>
        prevSongs.map((song) => {
          if (
            song.id === selectedSong.id ||
            (song.title === selectedSong.title && song.artist === selectedSong.artist)
          ) {
            // Add the bid amount to the existing token count
            const newTokenCount = song.tokens + amount
            console.log(
              `[EventSongsList] Updating song "${song.title}" tokens: ${song.tokens} + ${amount} = ${newTokenCount}`,
            )

            const updatedSong = {
              ...song,
              tokens: newTokenCount,
              bidders: song.bidders + (userBids[song.id] ? 0 : 1), // Increment bidders only if this is a new bidder
              trending: "up",
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
        }),
      )

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
      router.push(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}/songs`)}`)
      return
    }

    // Open bid modal with empty song
    setSelectedSong({ id: "new", title: "", artist: "" })
    setIsBidModalOpen(true)
  }

  // Filter and sort songs
  const filteredSongs = songs
    .filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "tokens") {
        return b.tokens - a.tokens
      } else {
        // Sort by recency of last bid
        const aTime = new Date(a.lastBid || "").getTime()
        const bTime = new Date(b.lastBid || "").getTime()
        return bTime - aTime
      }
    })

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
          <Input
            type="text"
            placeholder="Search songs or artists..."
            className="pl-10 bg-zinc-900 border-zinc-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={sortBy === "tokens" ? "default" : "outline"}
            className={sortBy === "tokens" ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700 text-zinc-300"}
            onClick={() => setSortBy("tokens")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Top Bids
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            className={sortBy === "recent" ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700 text-zinc-300"}
            onClick={() => setSortBy("recent")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700" onClick={handleRequestNewSong}>
            <Plus className="mr-2 h-4 w-4" />
            Request
          </Button>
        </div>
      </div>

      {/* WebSocket connection status */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center text-xs text-zinc-500">
          {isConnected && isAvailable ? (
            <>
              <Wifi className="h-3 w-3 text-green-500 mr-1" />
              <span>Live updates enabled</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-amber-500 mr-1" />
              <span>Using periodic updates</span>
            </>
          )}
        </div>
        {lastUpdate && <div className="text-xs text-zinc-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded bg-zinc-800" />
                  <div className="ml-3">
                    <Skeleton className="h-5 w-40 bg-zinc-800" />
                    <Skeleton className="h-4 w-32 mt-1 bg-zinc-800" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-8 w-16 mr-4 bg-zinc-800" />
                  <Skeleton className="h-9 w-16 bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-10 bg-zinc-900 rounded-lg">
          <Music className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-xl font-medium">No songs found</h3>
          <p className="text-zinc-400 mt-1">Try a different search term or be the first to request a song!</p>
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={handleRequestNewSong}>
            Request a Song
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSongs.map((song) => (
            <div key={song.id} className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative h-12 w-12 mr-3 rounded overflow-hidden">
                    <Image
                      src={song.albumArt || "/abstract-geometric-shapes.png"}
                      alt={`${song.title} album art`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-sm text-zinc-400">{song.artist}</p>
                    {userBids[song.id] && (
                      <div className="mt-1 text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded inline-block">
                        Your bid: {userBids[song.id]} tokens
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex flex-col items-end mr-4">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-purple-400">{song.tokens}</span>
                      <span className="ml-1 text-xs text-zinc-400">tokens</span>
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center">
                      <span className="mr-1">{song.bidders} bidders</span>
                      {song.trending === "up" ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBid(song)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={userTokens <= 0}
                  >
                    Bid
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user?.id && userTokens <= 0 && (
        <div className="mt-6 bg-amber-900/30 border border-amber-700/50 text-amber-200 p-4 rounded-lg text-center">
          <h3 className="font-medium mb-1">You're out of tokens!</h3>
          <p className="text-sm mb-3">Purchase more tokens to continue bidding on songs.</p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => router.push("/token-bidding")}>
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
