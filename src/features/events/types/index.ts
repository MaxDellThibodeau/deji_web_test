// Event and event code types
export interface Event {
  id: number
  title: string
  date: string
  time: string
  venue: string
  location: string
  description: string
  price: number
  image: string
  genre: string
  capacity: number
  ticketsLeft: number
  featuredDj: string
  songs: Song[]
  allSongs?: Song[]
  longDescription?: string
  amenities?: string[]
  ageRestriction?: string
  dateValue?: string
}

export interface Song {
  id: number
  title: string
  artist: string
  bidAmount: number
  position: number
  duration?: string
  genre?: string
}

export interface EventCode {
  id: string
  code: string
  eventId: number
  expiresAt: string
  isActive: boolean
}

export interface EventFilters {
  genre?: string
  location?: string
  startDate?: string
  endDate?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

export interface EventBid {
  id: number
  userId: string
  eventId: number
  songId: number
  bidAmount: number
  timestamp: string
  status: 'active' | 'outbid' | 'won'
}

export interface EventAttendee {
  id: string
  userId: string
  eventId: number
  ticketType: string
  purchaseDate: string
  checkInTime?: string
}

export interface EventCodeCreateParams {
  event_id: string
  expires_at?: string
}

export interface Ticket {
  id: string
  event_id: string
  user_id: string
  ticket_type: string
  purchase_date: string
  status: "active" | "used" | "refunded" | "expired"
  code?: string
} 