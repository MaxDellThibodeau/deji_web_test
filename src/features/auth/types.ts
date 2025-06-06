export type UserRole = "attendee" | "dj" | "venue" | "admin"

export type UserProfile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: UserRole | null
  token_balance: number
  created_at: string
  updated_at: string
  phone?: string
  location?: string
  bio?: string
  website?: string
} 