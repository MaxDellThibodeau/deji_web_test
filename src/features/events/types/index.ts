// Event and event code types
export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  venue_id: string
  dj_id: string
  capacity: number
  ticket_price: number
  status: "upcoming" | "in-progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface EventCode {
  id: string
  event_id: string
  code: string
  status: "active" | "used" | "expired"
  created_at: string
  expires_at: string
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