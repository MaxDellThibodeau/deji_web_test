import { UserRole } from './user'

export interface ProfileFieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'phone' | 'number' | 'multiselect' | 'toggle'
  required: boolean
  placeholder?: string
  description?: string
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export interface ProfileSectionConfig {
  id: string
  title: string
  description: string
  icon: string
  fields: ProfileFieldConfig[]
}

export interface ProfileCompletion {
  percentage: number
  completedFields: string[]
  missingFields: string[]
  totalFields: number
  isComplete: boolean
  lastUpdated: string
}

export interface ProfileWizardData {
  // Basic fields
  bio?: string
  phone?: string
  location?: string
  website?: string
  
  // DJ-specific fields
  stage_name?: string
  genres?: string[]
  experience_years?: number
  hourly_rate?: number
  equipment_provided?: boolean
  social_links?: {
    instagram?: string
    soundcloud?: string
    twitter?: string
    website?: string
  }
  
  // Venue-specific fields
  venue_name?: string
  venue_type?: string
  capacity?: number
  address?: string
  booking_email?: string
  description?: string
  amenities?: string[]
  
  // Attendee-specific fields
  favorite_genres?: string[]
  music_discovery_preference?: 'popular' | 'underground' | 'balanced'
  preferred_event_types?: string[]
  typical_budget_range?: 'under_50' | '50_100' | '100_200' | '200_plus'
}

export type ProfileWizardStep = 'basic' | 'role_specific' | 'preferences' | 'social' 