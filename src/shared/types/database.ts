// Database types for all tables

export interface VenueProfile {
  id: number
  profile_id: string
  venue_name: string
  venue_type?: string
  capacity?: number
  established?: number
  address?: string
  phone?: string
  website?: string
  booking_email?: string
  description?: string
  operating_hours?: string
  pricing_info?: string
  amenities?: string[]
  sound_system?: string
  lighting_system?: string
  stage_info?: string
  featured: boolean
  active_for_bookings: boolean
  notifications_enabled: boolean
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  profile_image?: string
  cover_image?: string
  created_at: string
  updated_at: string
}

export interface VenueGalleryImage {
  id: number
  venue_id: string
  url: string
  caption?: string
  is_featured: boolean
  display_order: number
  created_at: string
}

export interface VenueReview {
  id: number
  venue_id: string
  reviewer_id: string
  event_id?: string
  rating: number
  comment?: string
  review_type: 'general' | 'sound_quality' | 'atmosphere' | 'service'
  created_at: string
  updated_at: string
}

export interface VenueOperatingHours {
  id: number
  venue_id: string
  day_of_week: number // 0-6, 0 = Sunday
  open_time?: string
  close_time?: string
  is_closed: boolean
  special_notes?: string
  created_at: string
  updated_at: string
}

export interface AttendeeProfile {
  id: number
  profile_id: string
  favorite_genres?: string[]
  preferred_venues?: string[]
  music_discovery_preference: 'popular' | 'underground' | 'balanced'
  preferred_event_types?: string[]
  typical_budget_range?: 'under_50' | '50_100' | '100_200' | '200_plus'
  preferred_event_times?: 'early_evening' | 'late_night' | 'all_night'
  allow_song_requests: boolean
  public_bidding_history: boolean
  share_attendance_publicly: boolean
  accept_friend_requests: boolean
  notify_favorite_djs: boolean
  notify_venue_events: boolean
  notify_genre_events: boolean
  notify_friend_activity: boolean
  total_events_attended: number
  total_tokens_spent: number
  total_songs_requested: number
  favorite_dj_id?: string
  favorite_venue_id?: string
  created_at: string
  updated_at: string
}

export interface AttendeeEventHistory {
  id: number
  attendee_id: string
  event_id: string
  attendance_date: string
  tokens_spent: number
  songs_requested: number
  rating?: number
  feedback?: string
  created_at: string
}

export interface AttendeeConnection {
  id: number
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface AttendeeFavoriteDJ {
  id: number
  attendee_id: string
  dj_id: string
  created_at: string
}

export interface AttendeeFavoriteVenue {
  id: number
  attendee_id: string
  venue_id: string
  created_at: string
}

// Updated Event interface with venue relationship
export interface Event {
  id: string
  title: string
  description: string
  venue?: string // Legacy field
  venue_id?: string // New foreign key
  address?: string
  event_date: string
  end_time?: string
  image_url?: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Enhanced event with venue details
export interface EventWithVenue extends Event {
  venue_profile?: VenueProfile
}

// Form types for creating/updating
export interface CreateVenueProfileData {
  venue_name: string
  venue_type?: string
  capacity?: number
  established?: number
  address?: string
  phone?: string
  website?: string
  booking_email?: string
  description?: string
  operating_hours?: string
  pricing_info?: string
  amenities?: string[]
  sound_system?: string
  lighting_system?: string
  stage_info?: string
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  profile_image?: string
  cover_image?: string
}

export interface CreateAttendeeProfileData {
  favorite_genres?: string[]
  preferred_venues?: string[]
  music_discovery_preference?: 'popular' | 'underground' | 'balanced'
  preferred_event_types?: string[]
  typical_budget_range?: 'under_50' | '50_100' | '100_200' | '200_plus'
  preferred_event_times?: 'early_evening' | 'late_night' | 'all_night'
  allow_song_requests?: boolean
  public_bidding_history?: boolean
  share_attendance_publicly?: boolean
  accept_friend_requests?: boolean
  notify_favorite_djs?: boolean
  notify_venue_events?: boolean
  notify_genre_events?: boolean
  notify_friend_activity?: boolean
} 