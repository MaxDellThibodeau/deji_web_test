/**
 * Database Schema Documentation
 *
 * This file documents the database schema used in the application.
 * It's for reference only and doesn't affect the actual database.
 */

export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserTokens {
  id: string
  profile_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface TokenTransaction {
  id: string
  profile_id: string
  amount: number
  transaction_type: "purchase" | "bid" | "refund" | "bonus"
  description: string
  payment_id?: string
  event_id?: string
  song_id?: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  venue: string
  address?: string
  event_date: string
  end_time?: string
  image_url?: string
  status: "upcoming" | "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  profile_id: string
  event_id: string
  ticket_type: string
  ticket_code: string
  purchase_date: string
  payment_id: string
  status: "active" | "used" | "cancelled" | "refunded"
  created_at: string
  updated_at: string
}

export interface SongRequest {
  id: string
  event_id: string
  profile_id: string
  title: string
  artist: string
  album_art?: string
  tokens: number
  created_at: string
  updated_at: string
}

export interface SongBid {
  id: string
  song_request_id: string
  profile_id: string
  tokens: number
  created_at: string
}
