// Re-export database types
export type { Database, Json } from './supabase'

// Common types used across features
export interface Profile {
  id: string
  user_id: string
  name: string
  email: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

export interface UserTokens {
  user_id: string
  balance: number
  last_updated: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: "purchase" | "bid" | "refund" | "bonus"
  created_at: string
  reference_id?: string
}

export interface SongRequest {
  id: string
  event_id: string
  user_id: string
  song_name: string
  artist: string
  status: "pending" | "approved" | "rejected" | "played"
  created_at: string
  played_at?: string
}

export interface SongBid {
  id: string
  request_id: string
  user_id: string
  amount: number
  created_at: string
  status: "active" | "won" | "lost"
}

// Websocket types
export interface WebSocketMessage {
  type: string
  payload?: any
}

export interface WebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
}
