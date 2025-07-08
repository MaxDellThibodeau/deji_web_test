"use client"

import { useEffect, useState } from "react"
import { Coins, Music } from "lucide-react"

interface SongQueueProps {
  eventId: string
}

// Removed mock song queue data - now using real Supabase data

export function SongQueue({ eventId }: SongQueueProps) {
  const [songs, setSongs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    async function loadSongQueue() {
      setIsLoading(true)

      if (!eventId) {
        console.warn("No event ID provided for song queue")
        setSongs([])
        setIsLoading(false)
        return
      }

      try {
        // Import the real function to get song queue from Supabase
        const { getSongQueue } = await import("@/features/payments/actions/token-actions")
        
        const queue = await getSongQueue(eventId)
        setSongs(queue || [])
        setIsPreviewMode(false)
      } catch (error) {
        console.error("Error loading song queue:", error)
        setSongs([])
        setIsPreviewMode(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSongQueue()
    // Set up polling to refresh the queue every 30 seconds
    const interval = setInterval(loadSongQueue, 30000)
    return () => clearInterval(interval)
  }, [eventId])

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-400">Loading song queue...</p>
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-md p-4">
        <div className="text-center py-4">
          <Music className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
          <p className="text-zinc-400">No songs in the queue yet. Be the first to request a song!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <div
          key={song.id}
          className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700/70 text-xs font-medium">
              {index + 1}
            </div>
            <div>
              <p className="font-medium">{song.song_title}</p>
              <p className="text-sm text-zinc-400">{song.artist}</p>
            </div>
          </div>
          <div className="flex items-center text-yellow-500">
            <Coins className="h-3 w-3 mr-1" />
            <span className="font-medium">{song.bid_amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
