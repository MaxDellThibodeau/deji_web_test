import type { Image, SocialLinks, Timestamps } from '@/shared/types'

export type UserRole = 'attendee' | 'dj' | 'venue'

export interface User {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  role: UserRole
  is_admin?: boolean  // Admin privileges flag
  token_balance: number
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  bio?: string
  phone?: string
  location?: string
  preferences?: UserPreferences
  social_links?: SocialLinks
  profile_image?: Image
}

export interface UserPreferences {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
}

export interface UserStats {
  total_events_attended: number
  total_song_requests: number
  total_tokens_spent: number
  favorite_genres: string[]
  recent_events: string[]
} 