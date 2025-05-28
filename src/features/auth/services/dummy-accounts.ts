export type UserRole = "attendee" | "dj" | "venue" | "admin"

export interface DummyUser {
  id: string
  name: string
  email: string
  password: string // In a real app, we'd never store plain text passwords
  role: UserRole
  profileImage?: string
  description?: string
  genres?: string[]
  location?: string
  capacity?: number
  established?: number
  verified?: boolean
}

// Generate a simple ID
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 10)}`

// Attendee accounts
export const attendeeAccounts: DummyUser[] = [
  {
    id: generateId("att"),
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "password123",
    role: "attendee",
    profileImage: "/diverse-group-city.png",
    location: "New York, NY",
  },
  {
    id: generateId("att"),
    name: "Jamie Smith",
    email: "jamie@example.com",
    password: "password123",
    role: "attendee",
    profileImage: "/diverse-group-city.png",
    location: "Los Angeles, CA",
  },
  {
    id: generateId("att"),
    name: "Taylor Wilson",
    email: "taylor@example.com",
    password: "password123",
    role: "attendee",
    profileImage: "/diverse-group-city.png",
    location: "Chicago, IL",
  },
  {
    id: generateId("att"),
    name: "Morgan Lee",
    email: "morgan@example.com",
    password: "password123",
    role: "attendee",
    profileImage: "/diverse-group-city.png",
    location: "Miami, FL",
  },
]

// DJ accounts
export const djAccounts: DummyUser[] = [
  {
    id: generateId("dj"),
    name: "DJ Pulse",
    email: "pulse@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/focused-dj.png",
    description: "Specializing in deep house and techno with hypnotic beats",
    genres: ["Deep House", "Techno", "Progressive"],
    location: "Berlin, Germany",
    verified: true,
  },
  {
    id: generateId("dj"),
    name: "DJ Rhythm",
    email: "rhythm@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/vibrant-dj-set.png",
    description: "Hip-hop and R&B specialist with smooth transitions",
    genres: ["Hip-Hop", "R&B", "Trap"],
    location: "Atlanta, GA",
    verified: true,
  },
  {
    id: generateId("dj"),
    name: "DJ Nova",
    email: "nova@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/energetic-dj-groove.png",
    description: "Electronic music innovator pushing boundaries with unique sounds",
    genres: ["Electronic", "Experimental", "Ambient"],
    location: "London, UK",
    verified: true,
  },
  {
    id: generateId("dj"),
    name: "DJ Beats",
    email: "beats@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/energetic-dj-setup.png",
    description: "Drum and bass specialist with high-energy sets",
    genres: ["Drum & Bass", "Jungle", "Breakbeat"],
    location: "Manchester, UK",
    verified: true,
  },
  {
    id: generateId("dj"),
    name: "DJ Groove",
    email: "groove@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/placeholder.svg?height=200&width=200&query=dj+in+club",
    description: "Funk and disco revival with modern twists",
    genres: ["Funk", "Disco", "House"],
    location: "Paris, France",
    verified: true,
  },
  {
    id: generateId("dj"),
    name: "DJ Mix",
    email: "mix@example.com",
    password: "password123",
    role: "dj",
    profileImage: "/placeholder.svg?height=200&width=200&query=dj+mixing",
    description: "Open format DJ specializing in seamless genre transitions",
    genres: ["Pop", "EDM", "Hip-Hop", "Rock"],
    location: "Las Vegas, NV",
    verified: true,
  },
]

// Venue accounts
export const venueAccounts: DummyUser[] = [
  {
    id: generateId("venue"),
    name: "Skyline Venue",
    email: "skyline@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=rooftop+venue",
    description: "Rooftop venue with panoramic city views",
    location: "New York, NY",
    capacity: 500,
    established: 2015,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "The Warehouse",
    email: "warehouse@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=warehouse+party",
    description: "Industrial space converted into a raw, authentic music venue",
    location: "Detroit, MI",
    capacity: 1200,
    established: 1998,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Classic Lounge",
    email: "classic@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=elegant+lounge",
    description: "Upscale lounge with craft cocktails and intimate performances",
    location: "Chicago, IL",
    capacity: 150,
    established: 2010,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Salsa Club",
    email: "salsa@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=salsa+dance+club",
    description: "Authentic Latin music venue with dance floor and live bands",
    location: "Miami, FL",
    capacity: 300,
    established: 2005,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Vintage Lounge",
    email: "vintage@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=retro+lounge",
    description: "Retro-themed venue with vinyl DJs and classic cocktails",
    location: "San Francisco, CA",
    capacity: 200,
    established: 2012,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Mega Arena",
    email: "mega@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=large+concert+arena",
    description: "Massive concert venue hosting world-class DJs and festivals",
    location: "Las Vegas, NV",
    capacity: 15000,
    established: 2000,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Underground Club",
    email: "underground@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=underground+club",
    description: "Hidden basement venue for authentic electronic music",
    location: "Berlin, Germany",
    capacity: 250,
    established: 2008,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Urban Hall",
    email: "urban@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=urban+music+venue",
    description: "Multi-purpose venue for hip-hop and urban music events",
    location: "Atlanta, GA",
    capacity: 800,
    established: 2014,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Blue Note",
    email: "bluenote@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=jazz+club",
    description: "Iconic jazz club with occasional electronic and fusion nights",
    location: "New Orleans, LA",
    capacity: 180,
    established: 1981,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "The Loft",
    email: "loft@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=loft+party",
    description: "Converted loft space with minimalist design and great acoustics",
    location: "Brooklyn, NY",
    capacity: 350,
    established: 2016,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Grand Plaza",
    email: "grand@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=grand+ballroom",
    description: "Elegant ballroom venue for upscale events and performances",
    location: "Los Angeles, CA",
    capacity: 1000,
    established: 1995,
    verified: true,
  },
  {
    id: generateId("venue"),
    name: "Ice Palace",
    email: "ice@example.com",
    password: "password123",
    role: "venue",
    profileImage: "/placeholder.svg?height=200&width=200&query=winter+themed+venue",
    description: "Unique venue with ice-inspired decor and cutting-edge sound system",
    location: "Montreal, Canada",
    capacity: 700,
    established: 2011,
    verified: true,
  },
]

// Admin accounts
export const adminAccounts: DummyUser[] = [
  {
    id: generateId("admin"),
    name: "System Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    profileImage: "/placeholder.svg?height=200&width=200&query=professional+person",
    verified: true,
  },
  {
    id: generateId("admin"),
    name: "Platform Manager",
    email: "manager@example.com",
    password: "admin123",
    role: "admin",
    profileImage: "/placeholder.svg?height=200&width=200&query=business+person",
    verified: true,
  },
]

// Combine all accounts
export const allAccounts: DummyUser[] = [...attendeeAccounts, ...djAccounts, ...venueAccounts, ...adminAccounts]

// Helper function to find a user by email
export function findUserByEmail(email: string): DummyUser | undefined {
  return allAccounts.find((user) => user.email === email)
}

// Helper function to get accounts by role
export function getAccountsByRole(role: UserRole): DummyUser[] {
  return allAccounts.filter((user) => user.role === role)
}
