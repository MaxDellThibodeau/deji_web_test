"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { songService, EventSong } from "@/features/music/services/song-service"

interface EventSongLeaderboardProps {
  eventId: string
  limit?: number
  className?: string
}

export function EventSongLeaderboard({ eventId, limit = 5, className = "" }: EventSongLeaderboardProps) {
  const [songs, setSongs] = useState<EventSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadSongs() {
      console.log(`[EventSongLeaderboard] Loading songs for event ${eventId}`)
      setIsLoading(true)

      try {
        // Get songs using the new song service with Spotify integration
        const songData = await songService.getEventSongs(eventId)
        
        if (songData && songData.length > 0) {
          console.log(`[EventSongLeaderboard] Loaded ${songData.length} songs for event ${eventId}`)
          // Sort by total bids descending and take the limit
          const sortedSongs = songData.sort((a, b) => b.totalBids - a.totalBids)
          setSongs(sortedSongs.slice(0, limit))
        } else {
          console.log(`[EventSongLeaderboard] No songs found for event ${eventId}`)
          setSongs([])
        }
      } catch (error) {
        console.error(`[EventSongLeaderboard] Error loading songs:`, error)
        setSongs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [eventId, limit])

  const handleLeaderboardClick = () => {
    console.log(`[EventSongLeaderboard] Navigating to full song list for event ${eventId}`)
    navigate(`/events/${eventId}/songs`)
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`
    }
    return tokens.toString()
  }

  return (
    <div className={`bg-zinc-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Top Song Requests</h3>
        <button onClick={handleLeaderboardClick}>
          <ExternalLink className="h-4 w-4 text-zinc-400 hover:text-white" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-zinc-400">No song requests yet</p>
          <button 
            onClick={handleLeaderboardClick}
            className="text-xs text-purple-400 hover:underline mt-2 inline-block"
          >
            Be the first to request a song
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song, index) => (
            <div key={song.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 text-center text-sm text-zinc-500">{index + 1}</div>
                
                {/* Album art */}
                {song.albumArt && (
                  <img 
                    src={song.albumArt} 
                    alt={`${song.album} cover`}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate max-w-[120px]">{song.title}</p>
                  <p className="text-xs text-zinc-400 truncate max-w-[120px]">{song.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-purple-400 mr-1">
                    {formatTokens(song.totalBids)}
                  </div>
                  {song.trending === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : song.trending === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                </div>
                
                {/* Spotify link */}
                <a 
                  href={song.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400 opacity-60 hover:opacity-100"
                  title="Open in Spotify"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.56.3z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
