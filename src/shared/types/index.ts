// Database types
export type { Database, Json } from './supabase'

// API types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ValidationError,
  ApiValidationError,
  PaginationParams,
  SortParams,
  SearchParams,
} from './api'

// Common types
export type {
  PartialBy,
  RequiredBy,
  Nullable,
  Timestamps,
  SoftDelete,
  Status,
  Currency,
  Image,
  Address,
  SocialLinks,
  Metadata,
  UUID,
  Email,
  PhoneNumber,
  FormField,
} from './common'

// WebSocket types
export type {
  WebSocketEventType,
  WebSocketMessage,
  WebSocketOptions,
  SongRequestEvent,
  SongBidEvent,
  SongPlayedEvent,
  EventUpdateEvent,
  TokenUpdateEvent,
  ChatMessage,
} from './websocket'

// Profile types
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

// Token types
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

// Song types
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
