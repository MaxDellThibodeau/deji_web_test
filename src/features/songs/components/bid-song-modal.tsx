"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/use-websocket"

interface BidSongModalProps {
  isOpen: boolean
  onClose: () => void
  song?: any // If null, it's a new song request
  eventId: string
  onBidComplete?: (amount: number) => void
}

export function BidSongModal({ isOpen, onClose, song, eventId, onBidComplete }: BidSongModalProps) {
  const [bidAmount, setBidAmount] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSong, setSelectedSong] = useState<any>(song)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  // Set up WebSocket connection
  const { isConnected, sendMessage } = useWebSocket({
    eventId,
    autoConnect: false, // We'll connect only when needed
  })

  // Mock search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock search results
      const results = [
        {
          id: `search-1-${Date.now()}`,
          title: `${searchQuery} - Top Hit`,
          artist: "Popular Artist",
          album: "Latest Album",
          albumArt: "/abstract-soundscape.png",
        },
        {
          id: `search-2-${Date.now()}`,
          title: `${searchQuery} Remix`,
          artist: "DJ Remix",
          album: "Remix Collection",
          albumArt: "/abstract-soundscape.png",
        },
        {
          id: `search-3-${Date.now()}`,
          title: `${searchQuery} (Extended Version)`,
          artist: "Original Artist",
          album: "Deluxe Edition",
          albumArt: "/abstract-soundscape.png",
        },
      ]

      setSearchResults(results)
    } catch (error) {
      console.error("Error searching songs:", error)
      toast({
        title: "Search Failed",
        description: "Failed to search for songs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSearchResult = (result: any) => {
    setSelectedSong(result)
    setSearchResults([])
  }

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setBidAmount(value)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSong) {
      toast({
        title: "No Song Selected",
        description: "Please select a song to bid on",
        variant: "destructive",
      })
      return
    }

    if (bidAmount <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a positive number of tokens",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful bid
      const updatedSong = {
        ...selectedSong,
        tokens: (selectedSong.tokens || 0) + bidAmount,
        bidders: (selectedSong.bidders || 0) + 1,
      }

      // Call the onBidComplete callback if provided
      if (onBidComplete) {
        onBidComplete(bidAmount)
      }

      // Close the modal
      onClose()
    } catch (error) {
      console.error("Error placing bid:", error)
      toast({
        title: "Bid Failed",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>{song ? "Bid on Song" : "Request a Song"}</DialogTitle>
          <DialogDescription>
            {song
              ? "Place tokens on this song to increase its chances of being played"
              : "Search for a song to request and place your initial bid"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!song && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="song-search">Search for a Song</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="song-search"
                    placeholder="Enter song title or artist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-zinc-800 border-zinc-700"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        <div className="h-8 w-8 rounded overflow-hidden mr-3">
                          <img
                            src={result.albumArt || "/placeholder.svg"}
                            alt={`${result.album} cover`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{result.title}</div>
                          <div className="text-xs text-zinc-400">{result.artist}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSong && (
                <div className="p-3 rounded-md bg-zinc-800 border border-zinc-700">
                  <div className="font-medium">Selected Song:</div>
                  <div className="flex items-center mt-2">
                    <div className="h-10 w-10 rounded overflow-hidden mr-3">
                      <img
                        src={selectedSong.albumArt || "/placeholder.svg"}
                        alt={`${selectedSong.album} cover`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{selectedSong.title}</div>
                      <div className="text-sm text-zinc-400">{selectedSong.artist}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(song || selectedSong) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="bid-amount">Your Bid (Tokens)</Label>
                <span className="text-sm text-zinc-400">Balance: 100 tokens</span>
              </div>
              <Input
                id="bid-amount"
                type="number"
                min="1"
                max="100"
                value={bidAmount}
                onChange={handleBidAmountChange}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">
                Minimum bid is 1 token. Unused tokens will be refunded if the song isn't played.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-zinc-700">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSong || bidAmount <= 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Place Bid"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
