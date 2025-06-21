interface SoundCloudTrack {
  id: number
  title: string
  user: {
    username: string
    avatar_url: string
  }
  artwork_url: string | null
  stream_url: string | null
  duration: number
  playback_count: number
  likes_count: number
  permalink_url: string
  genre: string | null
  created_at: string
}

interface SoundCloudSearchResponse {
  collection: SoundCloudTrack[]
  total_results: number
}

export class SoundCloudAPI {
  private clientId: string | null = null

  constructor() {
    this.initializeClientId()
  }

  private async initializeClientId() {
    try {
      const response = await fetch('/api/soundcloud/client-id')
      if (response.ok) {
        const data = await response.json()
        this.clientId = data.clientId
      }
    } catch (error) {
      console.error('Error getting SoundCloud client ID:', error)
    }
  }

  private async ensureClientId() {
    if (!this.clientId) {
      await this.initializeClientId()
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<Array<{
    id: string
    title: string
    artist: string
    album: string
    albumArt: string
    soundcloudUrl: string
    popularity: number
    duration: number
    previewUrl: string | null
    source: 'soundcloud'
  }>> {
    await this.ensureClientId()

    if (!this.clientId) {
      throw new Error('No SoundCloud client ID available')
    }

    try {
      const response = await fetch(
        `https://api.soundcloud.com/search/sounds?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${this.clientId}`
      )

      if (!response.ok) {
        throw new Error(`SoundCloud API error: ${response.status}`)
      }

      const data: SoundCloudSearchResponse = await response.json()

      return data.collection.map(track => ({
        id: track.id.toString(),
        title: track.title,
        artist: track.user.username,
        album: 'SoundCloud Track',
        albumArt: track.artwork_url || track.user.avatar_url || '/placeholder-album.png',
        soundcloudUrl: track.permalink_url,
        popularity: track.playback_count + track.likes_count,
        duration: track.duration,
        previewUrl: track.stream_url ? `${track.stream_url}?client_id=${this.clientId}` : null,
        source: 'soundcloud' as const,
      }))
    } catch (error) {
      console.error('Error searching SoundCloud tracks:', error)
      throw error
    }
  }

  async getTrackDetails(trackId: string) {
    await this.ensureClientId()

    if (!this.clientId) {
      throw new Error('No SoundCloud client ID available')
    }

    try {
      const response = await fetch(
        `https://api.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`
      )

      if (!response.ok) {
        throw new Error(`SoundCloud API error: ${response.status}`)
      }

      const track: SoundCloudTrack = await response.json()

      return {
        id: track.id.toString(),
        title: track.title,
        artist: track.user.username,
        album: 'SoundCloud Track',
        albumArt: track.artwork_url || track.user.avatar_url || '/placeholder-album.png',
        soundcloudUrl: track.permalink_url,
        popularity: track.playback_count + track.likes_count,
        duration: track.duration,
        previewUrl: track.stream_url ? `${track.stream_url}?client_id=${this.clientId}` : null,
        source: 'soundcloud' as const,
      }
    } catch (error) {
      console.error('Error getting track details:', error)
      throw error
    }
  }
}

export const soundcloudAPI = new SoundCloudAPI() 