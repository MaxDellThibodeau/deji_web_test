/**
 * WebSocket types for real-time features
 */

// WebSocket message types
export type WebSocketEventType = 
  | 'CONNECT'
  | 'DISCONNECT'
  | 'SONG_REQUEST'
  | 'SONG_BID'
  | 'SONG_PLAYED'
  | 'EVENT_UPDATE'
  | 'TOKEN_UPDATE'
  | 'CHAT_MESSAGE'

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType
  payload?: T
  timestamp: string
  sender?: string
}

export interface WebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

// Song-related WebSocket events
export interface SongRequestEvent {
  eventId: string
  songName: string
  artist: string
  userId: string
  requestId: string
}

export interface SongBidEvent {
  requestId: string
  userId: string
  amount: number
  bidId: string
}

export interface SongPlayedEvent {
  requestId: string
  eventId: string
  playedAt: string
}

// Event-related WebSocket events
export interface EventUpdateEvent {
  eventId: string
  status: 'started' | 'ended' | 'paused'
  currentSong?: string
  queueLength?: number
}

// Token-related WebSocket events
export interface TokenUpdateEvent {
  userId: string
  newBalance: number
  transactionId: string
}

// Chat-related WebSocket events
export interface ChatMessage {
  id: string
  userId: string
  eventId: string
  content: string
  timestamp: string
  type: 'text' | 'emoji' | 'reaction'
} 