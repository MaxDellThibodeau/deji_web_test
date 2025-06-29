import { apiClient } from '@/shared/services/api-client'

interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  spotifyUrl: string
  popularity: number
  duration: number
  previewUrl: string | null
  source: 'spotify'
}

export const spotifyAPI = {
  // Get Spotify access token
  getToken: async () => {
    const response = await apiClient.post('/music/spotify/token')
    return response.data
  },

  // Search tracks (will implement after backend has search endpoint)
  searchTracks: async (query: string, limit = 10): Promise<SpotifyTrack[]> => {
    // TODO: Implement when backend has search endpoint
    console.log(`Searching for: ${query} with limit: ${limit}`)
    return []
  },

  // Get track details
  getTrackDetails: async (trackId: string): Promise<SpotifyTrack | null> => {
    // TODO: Implement when backend has track details endpoint
    console.log(`Getting track details for: ${trackId}`)
    return null
  }
}

export default spotifyAPI 