// DJ profile and related types
export interface DJProfile {
  id: string
  user_id: string
  name: string
  bio: string | null
  genres: string[]
  experience_years: number
  hourly_rate: number
  avatar_url: string | null
  social_links: {
    instagram?: string
    twitter?: string
    soundcloud?: string
    website?: string
  }
  rating: number
  total_events: number
  created_at: string
  updated_at: string
}

export interface DJProfileUpdate {
  name?: string
  bio?: string
  genres?: string[]
  experience_years?: number
  hourly_rate?: number
  avatar_url?: string
  social_links?: {
    instagram?: string
    twitter?: string
    soundcloud?: string
    website?: string
  }
}

export interface DJEvent extends Event {
  venue: {
    id: string
    name: string
    location: string
  }
  earnings: number
  song_requests: number
  attendees: number
}

export interface DJAnalytics {
  total_events: number
  total_earnings: number
  average_rating: number
  total_song_requests: number
  popular_genres: Array<{ genre: string; count: number }>
  monthly_stats: Array<{
    month: string
    events: number
    earnings: number
    song_requests: number
  }>
} 