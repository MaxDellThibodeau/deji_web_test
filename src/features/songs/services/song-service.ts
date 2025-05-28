import { websocketService } from "./websocket-service"
import { MOCK_SONGS } from "./mock-data"

// Types
export interface Song {
  id: string
  title: string
  artist: string
  tokens: number
  bidders: number
  trending: "up" | "down"
  albumArt?: string
  lastBid?: string
}

export interface Bid {
  userId: string
  songId: string
  amount: number
  timestamp: string
}

// Song Service class
export class SongService {
  private static instance: SongService

  // Singleton pattern
  public static getInstance(): SongService {
    if (!SongService.instance) {
      SongService.instance = new SongService()
    }
    return SongService.instance
  }

  // Get songs for an event
  public async getSongs(eventId: string): Promise<Song[]> {
    console.log(`[SongService] Getting songs for event ${eventId}`)

    try {
      // In a real implementation, this would query the database
      // For now, we'll use mock data
      if (MOCK_SONGS[eventId]) {
        console.log(`[SongService] Found ${MOCK_SONGS[eventId].length} songs for event ${eventId}`)
        return MOCK_SONGS[eventId]
      }

      // If no mock data, return empty array
      console.log(`[SongService] No songs found for event ${eventId}`)
      return []
    } catch (error) {
      console.error(`[SongService] Error getting songs:`, error)
      return []
    }
  }

  // Place a bid on a song
  public async placeBid(
    eventId: string,
    songId: string,
    userId: string,
    amount: number,
  ): Promise<{ success: boolean; song?: Song; error?: string }> {
    console.log(`[SongService] Placing bid of ${amount} tokens on song ${songId} by user ${userId} in event ${eventId}`)

    try {
      // In a real implementation, this would update the database
      // For now, we'll update the mock data

      // Find the song
      const songs = MOCK_SONGS[eventId] || []
      const songIndex = songs.findIndex((song) => song.id === songId)

      if (songIndex === -1) {
        console.error(`[SongService] Song ${songId} not found in event ${eventId}`)
        return { success: false, error: "Song not found" }
      }

      // Update the song
      const updatedSong = {
        ...songs[songIndex],
        tokens: songs[songIndex].tokens + amount,
        lastBid: new Date().toISOString(),
        trending: "up" as const,
      }

      // Update the mock data
      MOCK_SONGS[eventId][songIndex] = updatedSong

      // Broadcast the update to all connected clients
      websocketService.broadcastPublicUpdate(eventId, {
        songs: MOCK_SONGS[eventId],
        updatedSong,
      })

      console.log(`[SongService] Bid placed successfully. Song ${songId} now has ${updatedSong.tokens} tokens`)

      return { success: true, song: updatedSong }
    } catch (error) {
      console.error(`[SongService] Error placing bid:`, error)
      return { success: false, error: "Failed to place bid" }
    }
  }

  // Request a new song
  public async requestSong(
    eventId: string,
    userId: string,
    title: string,
    artist: string,
    initialBid: number,
  ): Promise<{ success: boolean; song?: Song; error?: string }> {
    console.log(
      `[SongService] Requesting new song "${title}" by ${artist} with initial bid of ${initialBid} tokens by user ${userId} in event ${eventId}`,
    )

    try {
      // In a real implementation, this would insert into the database
      // For now, we'll update the mock data

      // Create a new song
      const newSong: Song = {
        id: `mock-song-${Date.now()}`,
        title,
        artist,
        tokens: initialBid,
        bidders: 1,
        trending: "up",
        lastBid: new Date().toISOString(),
      }

      // Add to mock data
      if (!MOCK_SONGS[eventId]) {
        MOCK_SONGS[eventId] = []
      }

      MOCK_SONGS[eventId].push(newSong)

      // Sort by tokens
      MOCK_SONGS[eventId].sort((a, b) => b.tokens - a.tokens)

      // Broadcast the update to all connected clients
      websocketService.broadcastPublicUpdate(eventId, {
        songs: MOCK_SONGS[eventId],
        newSong,
      })

      console.log(`[SongService] Song "${title}" by ${artist} requested successfully with ${initialBid} tokens`)

      return { success: true, song: newSong }
    } catch (error) {
      console.error(`[SongService] Error requesting song:`, error)
      return { success: false, error: "Failed to request song" }
    }
  }
}

// Export a singleton instance
export const songService = SongService.getInstance()
