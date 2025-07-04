import { apiService } from '@api'

export interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string | null
  spotifyUrl: string
  popularity: number
  duration: number
  previewUrl: string | null
  source: 'spotify'
  // Bidding fields
  tokens: number
  bidders: number
  trending: 'up' | 'down' | 'neutral'
}

export interface SpotifySearchResponse {
  tracks: SpotifyTrack[]
  total: number
  limit: number
  offset: number
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[]
}

export const spotifyAPI = {
  // Get Spotify access token
  getToken: async (): Promise<{ access_token: string }> => {
    return apiService.post<{ access_token: string }>('/music/spotify/token')
  },

  // Search tracks
  searchTracks: async (query: string, limit = 10, offset = 0): Promise<SpotifySearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    return apiService.get<SpotifySearchResponse>(`/music/spotify/search?${params}`)
  },

  // Get track details
  getTrackDetails: async (trackId: string): Promise<SpotifyTrack> => {
    return apiService.get<SpotifyTrack>(`/music/spotify/track/${trackId}`)
  },

  // Get recommendations based on seed data
  getRecommendations: async (params: {
    seed_tracks?: string
    seed_artists?: string  
    seed_genres?: string
    limit?: number
  }): Promise<SpotifyRecommendationsResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params.seed_tracks) searchParams.append('seed_tracks', params.seed_tracks)
    if (params.seed_artists) searchParams.append('seed_artists', params.seed_artists)
    if (params.seed_genres) searchParams.append('seed_genres', params.seed_genres)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    
    return apiService.get<SpotifyRecommendationsResponse>(`/music/spotify/recommendations?${searchParams}`)
  },

  // Popular tracks by genre (using search with genre filters)
  getPopularByGenre: async (genre: string, limit = 20): Promise<SpotifySearchResponse> => {
    const query = `genre:${genre}`
    return spotifyAPI.searchTracks(query, limit)
  },

  // Search for specific artist's top tracks
  getArtistTopTracks: async (artist: string, limit = 10): Promise<SpotifySearchResponse> => {
    const query = `artist:${artist}`
    return spotifyAPI.searchTracks(query, limit)
  }
}

export default spotifyAPI 