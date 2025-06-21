interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; width: number; height: number }>
  }
  external_urls: {
    spotify: string
  }
  popularity: number
  duration_ms: number
  preview_url: string | null
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
  }
}

export class SpotifyAPI {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    // Don't automatically refresh token in constructor
  }

  private getBaseUrl(): string {
    // Get the base URL for API calls
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    // For server-side, use localhost during development
    return process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }

  private async refreshToken() {
    try {
      const baseUrl = this.getBaseUrl()
      const response = await fetch(`${baseUrl}/api/spotify/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get Spotify token: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000)
      
      console.log('[SpotifyAPI] Token refreshed successfully')
    } catch (error) {
      console.error('Error refreshing Spotify token:', error)
      throw error
    }
  }

  private async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshToken()
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<Array<{
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
  }>> {
    await this.ensureValidToken()

    if (!this.accessToken) {
      throw new Error('No Spotify access token available')
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const data: SpotifySearchResponse = await response.json()

      return data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || '/placeholder-album.png',
        spotifyUrl: track.external_urls.spotify,
        popularity: track.popularity,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        source: 'spotify' as const,
      }))
    } catch (error) {
      console.error('Error searching Spotify tracks:', error)
      throw error
    }
  }

  async getTrackDetails(trackId: string) {
    await this.ensureValidToken()

    if (!this.accessToken) {
      throw new Error('No Spotify access token available')
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const track: SpotifyTrack = await response.json()

      return {
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || '/placeholder-album.png',
        spotifyUrl: track.external_urls.spotify,
        popularity: track.popularity,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        source: 'spotify' as const,
      }
    } catch (error) {
      console.error('Error getting track details:', error)
      throw error
    }
  }
}

export const spotifyAPI = new SpotifyAPI() 