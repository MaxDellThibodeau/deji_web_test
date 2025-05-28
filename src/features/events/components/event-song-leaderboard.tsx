"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { getSongRequests } from "@/features/payments/actions/token-actions"
import { MOCK_SONGS } from "@/shared/utils/mock-data"

interface EventSongLeaderboardProps {
  eventId: string
  limit?: number
  className?: string
}

export function EventSongLeaderboard({ eventId, limit = 5, className = "" }: EventSongLeaderboardProps) {
  const [songs, setSongs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSongs() {
      console.log(`[EventSongLeaderboard] Loading songs for event ${eventId}`)
      setIsLoading(true)

      try {
        // First try to get songs from the API
        const songData = await getSongRequests(eventId)

        // If we got songs from the API, use those
        if (songData && songData.length > 0) {
          console.log(`[EventSongLeaderboard] Loaded ${songData.length} songs for event ${eventId}`)
          setSongs(songData.slice(0, limit))
        }
        // If no songs from API, check our mock data
        else if (MOCK_SONGS[eventId]) {
          console.log(`[EventSongLeaderboard] Using mock data for event ${eventId}`)
          setSongs(MOCK_SONGS[eventId].slice(0, limit))
        }
        // If no songs at all, use empty array
        else {
          console.log(`[EventSongLeaderboard] No songs found for event ${eventId}`)
          setSongs([])
        }
      } catch (error) {
        console.error(`[EventSongLeaderboard] Error loading songs:`, error)

        // Fallback to mock data on error
        if (MOCK_SONGS[eventId]) {
          console.log(`[EventSongLeaderboard] Using mock data after error for event ${eventId}`)
          setSongs(MOCK_SONGS[eventId].slice(0, limit))
        } else {
          setSongs([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [eventId, limit])

  const handleLeaderboardClick = () => {
    console.log(`[EventSongLeaderboard] Navigating to full song list for event ${eventId}`)
  }

  return (
    <div className={`bg-zinc-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Top Song Requests</h3>
        <Link href={`/events/${eventId}/songs`} onClick={handleLeaderboardClick}>
          <ExternalLink className="h-4 w-4 text-zinc-400 hover:text-white" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-zinc-400">No song requests yet</p>
          <Link href={`/events/${eventId}/songs`} className="text-xs text-purple-400 hover:underline mt-2 inline-block">
            Be the first to request a song
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song, index) => (
            <div key={song.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 text-center text-sm text-zinc-500">{index + 1}</div>
                <div className="ml-2">
                  <p className="text-sm font-medium truncate max-w-[120px]">{song.title}</p>
                  <p className="text-xs text-zinc-400 truncate max-w-[120px]">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-sm font-medium text-purple-400 mr-1">{song.tokens}</div>
                {song.trending === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
