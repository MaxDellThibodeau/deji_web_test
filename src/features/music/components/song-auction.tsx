"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { 
  Trophy, 
  Music, 
  TrendingUp, 
  Clock, 
  Star, 
  ExternalLink, 
  Gavel,
  Timer,
  Users,
  Coins,
  ArrowUp,
  Flame,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface SongAuctionProps {
  songs: Array<{
    id: string
    title: string
    artist: string
    tokens: number
    bidders: number
    ranking_score?: number
    album_art_url?: string
    music_source?: 'spotify' | 'soundcloud' | 'manual'
    duration_ms?: number
    popularity_score?: number
    external_url?: string
    album?: string
    genre?: string
    current_highest_bid?: number
    time_remaining?: string
    is_hot?: boolean
    bid_history?: Array<{
      user: string
      amount: number
      timestamp: string
    }>
  }>
  userTokens: number
  onPlaceBid: (songId: string, amount: number) => Promise<void>
  onSongClick?: (song: any) => void
}

export function SongAuction({ 
  songs, 
  userTokens, 
  onPlaceBid, 
  onSongClick 
}: SongAuctionProps) {
  const [biddingSong, setBiddingSong] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({})
  const { toast } = useToast()

  // Simulate countdown timers for each song
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: {[key: string]: string} = {}
      songs.forEach(song => {
        // Simulate random time remaining for demo
        const remaining = Math.floor(Math.random() * 3600) + 300 // 5-65 minutes
        const minutes = Math.floor(remaining / 60)
        const seconds = remaining % 60
        newTimeLeft[song.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`
      })
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [songs])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getRankingColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-black"
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
    return "bg-gradient-to-r from-zinc-600 to-zinc-800 text-white"
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'spotify':
        return <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg" />
      case 'soundcloud':
        return <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg" />
      default:
        return <Music className="w-4 h-4 text-zinc-400" />
    }
  }

  const handleBidClick = (song: any) => {
    setBiddingSong(song.id)
    setBidAmount(song.tokens + 1) // Minimum bid is current highest + 1
  }

  const handlePlaceBid = async () => {
    if (!biddingSong || bidAmount <= 0) return

    if (bidAmount > userTokens) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough tokens for this bid.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onPlaceBid(biddingSong, bidAmount)
      toast({
        title: "Bid Placed! 🎉",
        description: `You bid ${bidAmount} tokens on this song.`,
      })
      setBiddingSong(null)
      setBidAmount(0)
    } catch (error) {
      toast({
        title: "Bid Failed",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTrendingIcon = (song: any) => {
    if (song.is_hot) return <Flame className="w-4 h-4 text-red-500 animate-pulse" />
    if (song.bidders > 5) return <TrendingUp className="w-4 h-4 text-green-500" />
    return null
  }

  const getTimeColor = (timeStr: string) => {
    const [minutes] = timeStr.split(':').map(Number)
    if (minutes < 5) return "text-red-500"
    if (minutes < 15) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-purple-500" />
          <span className="text-xl">Live Song Auctions</span>
          <Badge variant="outline" className="ml-auto">
            <Coins className="w-3 h-3 mr-1" />
            {userTokens} tokens
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-500/50' 
                  : index === 1 
                  ? 'bg-gradient-to-r from-gray-800/20 to-gray-700/20 border-gray-400/50'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-800/20 to-amber-700/20 border-amber-500/50'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {/* Hot/Trending Badge */}
              {getTrendingIcon(song) && (
                <div className="absolute top-2 right-2">
                  {getTrendingIcon(song)}
                </div>
              )}

              <div className="flex items-center">
                {/* Ranking Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-lg ${getRankingColor(index + 1)}`}>
                  {index + 1}
                </div>

                {/* Album Art */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 shadow-lg">
                  <Image
                    src={song.album_art_url || "/placeholder-album.png"}
                    alt={`${song.title} album art`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{song.title}</h3>
                    {getSourceIcon(song.music_source)}
                  </div>
                  <p className="text-zinc-300 truncate">{song.artist}</p>
                  {song.album && (
                    <p className="text-sm text-zinc-500 truncate">{song.album}</p>
                  )}
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-400">{song.tokens} tokens</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{song.bidders} bidders</span>
                    </div>
                    
                    {song.duration_ms && (
                      <div className="flex items-center gap-1 text-sm text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(song.duration_ms)}</span>
                      </div>
                    )}
                    
                    {song.popularity_score && (
                      <div className="flex items-center gap-1 text-sm text-zinc-400">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{song.popularity_score}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auction Section */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  {/* Time Remaining */}
                  <div className="flex items-center gap-1 text-sm">
                    <Timer className="w-4 h-4" />
                    <span className={`font-mono ${getTimeColor(timeLeft[song.id] || '0:00')}`}>
                      {timeLeft[song.id] || '0:00'}
                    </span>
                  </div>

                  {biddingSong === song.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={song.tokens + 1}
                        max={userTokens}
                        className="w-20 h-8 text-center bg-zinc-700 border-zinc-600"
                      />
                      <Button
                        size="sm"
                        onClick={handlePlaceBid}
                        disabled={isSubmitting || bidAmount <= song.tokens || bidAmount > userTokens}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSubmitting ? "..." : "Bid"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBiddingSong(null)}
                        className="border-zinc-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">
                          {song.tokens}
                        </div>
                        <div className="text-xs text-zinc-500">current bid</div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleBidClick(song)}
                        disabled={userTokens <= song.tokens}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Gavel className="w-4 h-4 mr-1" />
                        Bid Now
                      </Button>
                    </div>
                  )}

                  {/* External Link */}
                  {song.external_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(song.external_url, '_blank')
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Bid History (if available) */}
              {song.bid_history && song.bid_history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <div className="text-xs text-zinc-500 mb-1">Recent Bids:</div>
                  <div className="flex gap-2">
                    {song.bid_history.slice(0, 3).map((bid, bidIndex) => (
                      <div key={bidIndex} className="text-xs bg-zinc-700 px-2 py-1 rounded">
                        <span className="text-purple-400">{bid.amount}</span> by {bid.user}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Time Warning */}
              {timeLeft[song.id] && timeLeft[song.id].startsWith('0:') && (
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Ending Soon!
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-center py-12">
            <Gavel className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-zinc-300 mb-2">No Active Auctions</h3>
            <p className="text-zinc-500">Be the first to request a song and start the bidding!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 