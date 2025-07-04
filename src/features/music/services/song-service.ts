import { apiService } from '@api'
import { spotifyAPI, SpotifyTrack } from './spotify-api'

export interface Song extends SpotifyTrack {
  eventId?: string
  addedAt?: string
  addedBy?: string
}

export interface SongBid {
  id: string
  songId: string
  eventId: string
  userId: string
  bidAmount: number
  createdAt: string
}

export interface EventSong {
  id: string
  eventId: string
  spotifyId: string
  title: string
  artist: string
  album: string
  albumArt: string | null
  spotifyUrl: string
  popularity: number
  duration: number
  previewUrl: string | null
  // Bidding data
  totalBids: number
  bidders: number
  trending: 'up' | 'down' | 'neutral'
  addedAt: string
  addedBy: string
}

export const songService = {
  // Search Spotify for songs to add to event
  searchSongs: async (query: string, limit = 10): Promise<SpotifyTrack[]> => {
    try {
      const response = await spotifyAPI.searchTracks(query, limit)
      return response.tracks
    } catch (error) {
      console.error('Error searching songs:', error)
      return []
    }
  },

  // Get songs for a specific event (with bidding data)
  getEventSongs: async (eventId: string): Promise<EventSong[]> => {
    try {
      return await apiService.get<EventSong[]>(`/events/${eventId}/songs`)
    } catch (error) {
      console.error('Error getting event songs:', error)
      // Return some mock songs with Spotify data for now
      return await songService.getMockEventSongs(eventId)
    }
  },

  // Add a Spotify song to an event
  addSongToEvent: async (eventId: string, spotifyId: string): Promise<EventSong> => {
    try {
      // First get the Spotify track details
      const spotifyTrack = await spotifyAPI.getTrackDetails(spotifyId)
      
      // Add to event
      const payload = {
        eventId,
        spotifyId,
        title: spotifyTrack.title,
        artist: spotifyTrack.artist,
        album: spotifyTrack.album,
        albumArt: spotifyTrack.albumArt,
        spotifyUrl: spotifyTrack.spotifyUrl,
        popularity: spotifyTrack.popularity,
        duration: spotifyTrack.duration,
        previewUrl: spotifyTrack.previewUrl
      }

      return await apiService.post<EventSong>(`/events/${eventId}/songs`, payload)
    } catch (error) {
      console.error('Error adding song to event:', error)
      throw error
    }
  },

  // Place bid on a song
  placeBid: async (eventId: string, songId: string, bidAmount: number): Promise<SongBid> => {
    try {
      return await apiService.post<SongBid>(`/events/${eventId}/songs/${songId}/bid`, {
        bidAmount
      })
    } catch (error) {
      console.error('Error placing bid:', error)
      throw error
    }
  },

  // Get user's bids for an event
  getUserBids: async (eventId: string): Promise<SongBid[]> => {
    try {
      return await apiService.get<SongBid[]>(`/events/${eventId}/my-bids`)
    } catch (error) {
      console.error('Error getting user bids:', error)
      return []
    }
  },

  // Get recommendations for an event based on existing songs
  getEventRecommendations: async (eventId: string, limit = 10): Promise<SpotifyTrack[]> => {
    try {
      // Get existing songs to use as seeds
      const eventSongs = await songService.getEventSongs(eventId)
      
      if (eventSongs.length === 0) {
        // If no songs, get popular electronic music
        const response = await spotifyAPI.searchTracks('genre:electronic', limit)
        return response.tracks
      }

      // Use top songs as seeds (max 5 for Spotify API)
      const seedTracks = eventSongs
        .slice(0, 5)
        .map(song => song.spotifyId)
        .join(',')

      const recommendations = await spotifyAPI.getRecommendations({
        seed_tracks: seedTracks,
        limit
      })

      return recommendations.tracks
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  },

  // Get popular songs by genre for event suggestions  
  getPopularByGenre: async (genre: string, limit = 20): Promise<SpotifyTrack[]> => {
    try {
      const response = await spotifyAPI.getPopularByGenre(genre, limit)
      return response.tracks
    } catch (error) {
      console.error('Error getting popular songs by genre:', error)
      return []
    }
  },

  // Mock data fallback for development
  getMockEventSongs: async (eventId: string): Promise<EventSong[]> => {
    // Generate some realistic mock data using Spotify-like structure
    const mockSongs: EventSong[] = [
      {
        id: `${eventId}-song-1`,
        eventId,
        spotifyId: '4iV5W9uYEdYUVa79Axb7Rh',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        spotifyUrl: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        popularity: 96,
        duration: 200040,
        previewUrl: 'https://p.scdn.co/mp3-preview/...',
        totalBids: 145,
        bidders: 3,
        trending: 'up',
        addedAt: new Date().toISOString(),
        addedBy: 'user123'
      },
      {
        id: `${eventId}-song-2`,
        eventId,
        spotifyId: '6WrI0LAC5M1Rw2MnX2ZvEg',
        title: "Don't Start Now",
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273d6b2c2d6c2a8e6e5e4f5f6f6',
        spotifyUrl: 'https://open.spotify.com/track/6WrI0LAC5M1Rw2MnX2ZvEg',
        popularity: 88,
        duration: 183290,
        previewUrl: 'https://p.scdn.co/mp3-preview/...',
        totalBids: 132,
        bidders: 2,
        trending: 'down',
        addedAt: new Date().toISOString(),
        addedBy: 'user456'
      },
      {
        id: `${eventId}-song-3`,
        eventId,
        spotifyId: '1Je1IMUlBXcx1Fz0WE7oPT',
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        album: 'SOUR',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a',
        spotifyUrl: 'https://open.spotify.com/track/1Je1IMUlBXcx1Fz0WE7oPT',
        popularity: 92,
        duration: 178147,
        previewUrl: 'https://p.scdn.co/mp3-preview/...',
        totalBids: 98,
        bidders: 4,
        trending: 'up',
        addedAt: new Date().toISOString(),
        addedBy: 'user789'
      }
    ]

    return mockSongs
  }
}

export default songService
