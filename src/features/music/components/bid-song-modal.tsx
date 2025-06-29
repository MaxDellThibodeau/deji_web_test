"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Loader2, Search, Music, ExternalLink, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/use-websocket"
import { musicSearchService, type MusicTrack } from "@/shared/services/music-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Badge } from "@/ui/badge"

interface BidSongModalProps {
  isOpen: boolean
  onClose: () => void
  song?: any // If null, it's a new song request
  eventId: string
  onBidComplete?: (amount: number) => void
}

export function BidSongModal({ isOpen, onClose, song, eventId, onBidComplete }: BidSongModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([])
  const [selectedSong, setSelectedSong] = useState<MusicTrack | null>(null)
  const [bidAmount, setBidAmount] = useState(10)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchSource, setSearchSource] = useState<'all' | 'spotify' | 'soundcloud'>('all')
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const sources = searchSource === 'all' ? ['spotify', 'soundcloud'] : [searchSource]
      const results = await musicSearchService.searchTracks(searchQuery, {
        limit: 15,
        sources,
        sortBy: 'popularity'
      })
      
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search Failed",
        description: "Unable to search for songs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSearchResult = (result: MusicTrack) => {
    setSelectedSong(result)
    setSearchResults([])
  }

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setBidAmount(value)
    }
  }

  const handlePlayPreview = (track: MusicTrack) => {
    if (!track.previewUrl) {
      toast({
        title: "No Preview Available",
        description: "This track doesn't have a preview available.",
        variant: "destructive",
      })
      return
    }

    if (isPlayingPreview === track.id) {
      setIsPlayingPreview(null)
      // Stop audio if playing
      const audio = document.querySelector('audio')
      if (audio) audio.pause()
    } else {
      setIsPlayingPreview(track.id)
      // Play preview
      const audio = new Audio(track.previewUrl)
      audio.play()
      audio.onended = () => setIsPlayingPreview(null)
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
      // Call the API to place the bid with enhanced metadata
      const { bidOnSongWithMetadata } = await import("@/features/payments/actions/token-actions")
      const result = await bidOnSongWithMetadata(
        selectedSong.id,
        eventId,
        selectedSong.title,
        selectedSong.artist,
        bidAmount,
        {
          musicSource: selectedSong.source,
          albumArt: selectedSong.albumArt,
          duration: selectedSong.duration,
          popularity: selectedSong.popularity,
          externalUrl: selectedSong.externalUrl,
          previewUrl: selectedSong.previewUrl,
          album: selectedSong.album,
          genre: selectedSong.genre,
        }
      )

      if (result.success) {
        toast({
          title: "Bid Placed Successfully!",
          description: `You bid ${bidAmount} tokens on "${selectedSong.title}" by ${selectedSong.artist}`,
        })

        if (onBidComplete) {
          onBidComplete(bidAmount)
        }

        onClose()
      } else {
        toast({
          title: "Bid Failed",
          description: result.error || "Failed to place bid. Please try again.",
          variant: "destructive",
        })
      }
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

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="song-search"
                      placeholder="Enter song title or artist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-zinc-800 border-zinc-700"
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

                <Tabs value={searchSource} onValueChange={(value) => setSearchSource(value as any)}>
                  <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                    <TabsTrigger value="all">Spotify</TabsTrigger>
                    <TabsTrigger value="spotify">Spotify Only</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.source}-${result.id}`}
                        className="flex items-center p-3 rounded-md bg-zinc-800 hover:bg-zinc-700 cursor-pointer border border-zinc-700"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        <div className="h-12 w-12 rounded overflow-hidden mr-3 flex-shrink-0">
                          <img
                            src={result.albumArt}
                            alt={`${result.album} cover`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-sm text-zinc-400 truncate">{result.artist}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {result.source}
                            </Badge>
                            <span className="text-xs text-zinc-500">
                              {formatDuration(result.duration)}
                            </span>
                            {result.popularity > 0 && (
                              <span className="text-xs text-zinc-500">
                                ★ {result.popularity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {result.previewUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPreview(result)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              {isPlayingPreview === result.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(result.externalUrl, '_blank')
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSong && (
                <div className="p-4 rounded-md bg-zinc-800 border border-zinc-700">
                  <div className="font-medium mb-2">Selected Song:</div>
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded overflow-hidden mr-4">
                      <img
                        src={selectedSong.albumArt}
                        alt={`${selectedSong.album} cover`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{selectedSong.title}</div>
                      <div className="text-sm text-zinc-400">{selectedSong.artist}</div>
                      <div className="text-sm text-zinc-500">{selectedSong.album}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selectedSong.source}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {formatDuration(selectedSong.duration)}
                        </span>
                        {selectedSong.popularity > 0 && (
                          <span className="text-xs text-zinc-500">
                            ★ {selectedSong.popularity}
                          </span>
                        )}
                      </div>
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
