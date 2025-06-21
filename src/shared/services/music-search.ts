import { SpotifyAPI } from './spotify-api'
// import { soundcloudAPI } from './soundcloud-api' // Disabled temporarily

// Define the unified search result interface
export interface SearchResult {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  popularity: number
  duration: number // in milliseconds
  previewUrl: string | null
  source: 'spotify' | 'soundcloud'
  externalUrl: string // Spotify URL or SoundCloud URL
  // Platform-specific IDs for database storage
  spotifyId?: string
  soundcloudId?: string
}

// For backward compatibility
export type MusicTrack = SearchResult

export interface SearchOptions {
  limit?: number
  sources?: ('spotify' | 'soundcloud')[]
  sortBy?: 'popularity' | 'relevance' | 'duration'
}

export class MusicSearchService {
  private spotifyAPI: SpotifyAPI
  
  constructor() {
    this.spotifyAPI = new SpotifyAPI()
  }

  async searchTracks(query: string, limit: number = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    // Search Spotify (always available)
    try {
      console.log('[MusicSearchService] Searching Spotify for:', query)
      const spotifyResults = await this.spotifyAPI.searchTracks(query, limit)
      results.push(...spotifyResults.map((track): SearchResult => ({
        ...track,
        externalUrl: track.spotifyUrl,
        spotifyId: track.id,
      })))
      console.log('[MusicSearchService] Found', spotifyResults.length, 'Spotify tracks')
    } catch (error) {
      console.error('Spotify search failed:', error)
      // Don't throw here, just log the error and continue
    }

    // SoundCloud is temporarily disabled - add back when API key is available
    // try {
    //   const soundCloudResults = await this.soundCloudAPI.searchTracks(query, Math.max(1, limit - results.length))
    //   results.push(...soundCloudResults)
    // } catch (error) {
    //   console.error('SoundCloud search failed:', error)
    // }

    console.log('[MusicSearchService] Total results found:', results.length)
    return results.slice(0, limit)
  }

  async getTrackById(trackId: string, source: 'spotify'): Promise<SearchResult | null> {
    try {
      if (source === 'spotify') {
        console.log('[MusicSearchService] Getting Spotify track details for:', trackId)
        const track = await this.spotifyAPI.getTrackDetails(trackId)
        return {
          ...track,
          externalUrl: track.spotifyUrl,
          spotifyId: track.id,
        }
      }
      // SoundCloud support can be added here later
      return null
    } catch (error) {
      console.error(`Failed to get track details for ${source}:${trackId}:`, error)
      return null
    }
  }

  // Helper method to validate track data before storing in database
  validateTrackData(track: SearchResult): boolean {
    return !!(
      track.id &&
      track.title &&
      track.artist &&
      track.source &&
      track.externalUrl
    )
  }

  // Helper method to extract platform-specific metadata for database
  extractMetadataForDatabase(track: SearchResult) {
    const baseMetadata = {
      title: track.title,
      artist: track.artist,
      album: track.album,
      album_art_url: track.albumArt,
      duration_ms: track.duration,
      popularity_score: track.popularity,
      preview_url: track.previewUrl,
      external_url: track.externalUrl,
    }

    if (track.source === 'spotify') {
      return {
        ...baseMetadata,
        spotify_id: track.spotifyId || track.id,
        soundcloud_id: null,
      }
    } else if (track.source === 'soundcloud') {
      return {
        ...baseMetadata,
        spotify_id: null,
        soundcloud_id: track.soundcloudId || track.id,
      }
    }

    return baseMetadata
  }

  private sortResults(tracks: MusicTrack[], sortBy: string): MusicTrack[] {
    switch (sortBy) {
      case 'popularity':
        return tracks.sort((a, b) => b.popularity - a.popularity)
      
      case 'duration':
        return tracks.sort((a, b) => a.duration - b.duration)
      
      case 'relevance':
      default:
        // Keep original order (most relevant from each API)
        return tracks
    }
  }

  async getTrackDetails(trackId: string, source: 'spotify' | 'soundcloud'): Promise<MusicTrack | null> {
    try {
      if (source === 'spotify') {
        console.log('[MusicSearchService] Getting Spotify track details for:', trackId)
        const track = await this.spotifyAPI.getTrackDetails(trackId)
        return {
          ...track,
          externalUrl: track.spotifyUrl,
        }
      }
      // SoundCloud disabled
      // else if (source === 'soundcloud') {
      //   const track = await soundcloudAPI.getTrackDetails(trackId)
      //   return {
      //     ...track,
      //     externalUrl: track.soundcloudUrl,
      //   }
      // }
    } catch (error) {
      console.error(`Failed to get track details for ${source}:${trackId}:`, error)
    }
    
    return null
  }

  // Calculate a ranking score for a track based on multiple factors
  calculateRankingScore(track: MusicTrack, userPreferences?: any): number {
    let score = 0

    // Base popularity score (0-100)
    score += track.popularity

    // Duration bonus (prefer tracks between 2-5 minutes)
    const durationMinutes = track.duration / 60000
    if (durationMinutes >= 2 && durationMinutes <= 5) {
      score += 20
    } else if (durationMinutes >= 1.5 && durationMinutes <= 6) {
      score += 10
    }

    // Source preference (Spotify only for now)
    if (track.source === 'spotify') {
      score += 10 // Bonus for Spotify tracks
    }

    // User preference matching (if available)
    if (userPreferences) {
      // Add logic for genre matching, artist preferences, etc.
      // This would be implemented based on user profile data
    }

    return Math.min(score, 100) // Cap at 100
  }
}

export const musicSearchService = new MusicSearchService() 