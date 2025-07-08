import { UserRole } from "../types/user"

export interface DemoAccount {
  id: string
  role: UserRole
  email: string
  password: string
  name: string
  description: string
  features: string[]
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "demo-dj-001",
    role: "dj",
    email: "dj@djei.demo", 
    password: "password123",
    name: "Alex Rivera",
    description: "Experience the DJ portal with playlist management and event booking",
    features: ["Create playlists", "Book events", "Track earnings", "Upload music"]
  },
  {
    id: "demo-attendee-001",
    role: "attendee", 
    email: "attendee@djei.demo",
    password: "password123",
    name: "Sam Chen",
    description: "Explore event discovery and music request features",
    features: ["Discover events", "Request songs", "Build preferences", "Connect with DJs"]
  },
  {
    id: "demo-venue-001",
    role: "venue",
    email: "venue@djei.demo",
    password: "password123",
    name: "Marina Rodriguez", 
    description: "Manage venue bookings and event hosting capabilities",
    features: ["List availability", "Manage bookings", "Set pricing", "Review applications"]
  }
]

export class DemoAccountsService {
  static getDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS
  }

  static getDemoAccountByRole(role: UserRole): DemoAccount | undefined {
    return DEMO_ACCOUNTS.find(account => account.role === role)
  }

  static getDemoAccountByEmail(email: string): DemoAccount | undefined {
    return DEMO_ACCOUNTS.find(account => account.email === email)
  }

  static isDemoAccount(email: string): boolean {
    return email.endsWith('@djei.demo')
  }

  static validateDemoCredentials(email: string, password: string): DemoAccount | null {
    const account = this.getDemoAccountByEmail(email)
    if (!account || account.password !== password) return null
    return account
  }
} 