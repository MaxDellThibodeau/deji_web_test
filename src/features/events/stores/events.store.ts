import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Event, EventFilters, Song, EventBid } from '../types'
import type { User } from '@/features/auth/types'

interface EventsState {
  // State
  events: Event[]
  currentEvent: Event | null
  loading: boolean
  error: string | null
  filters: EventFilters
  connectedUsers: User[]
  userBids: EventBid[]
  
  // WebSocket state
  isConnected: boolean
  lastMessage: any
  
  // Actions
  setEvents: (events: Event[]) => void
  setCurrentEvent: (event: Event | null) => void
  updateEvent: (eventId: number, updates: Partial<Event>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: EventFilters) => void
  addUserBid: (bid: EventBid) => void
  updateUserBid: (bidId: number, updates: Partial<EventBid>) => void
  
  // WebSocket actions
  setConnected: (connected: boolean) => void
  onEventMessageReceived: (message: any) => void
  joinEvent: (eventId: number, user: User) => void
  leaveEvent: (eventId: number, user: User) => void
  updateEventData: (eventId: number, data: any) => void
  updateSongLeaderboard: (eventId: number, songs: Song[]) => void
  
  // API integration actions (these will call the services)
  fetchEvents: (filters?: EventFilters) => Promise<void>
  fetchEvent: (eventId: number) => Promise<void>
  placeBid: (eventId: number, songId: number, bidAmount: number) => Promise<void>
  joinEventAPI: (eventId: number) => Promise<void>
}

export const useEventsStore = create<EventsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    events: [],
    currentEvent: null,
    loading: false,
    error: null,
    filters: {},
    connectedUsers: [],
    userBids: [],
    isConnected: false,
    lastMessage: null,

    // Basic setters
    setEvents: (events) => set({ events }),
    setCurrentEvent: (event) => set({ currentEvent: event }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set({ filters }),

    // Update specific event
    updateEvent: (eventId, updates) => {
      set((state) => ({
        events: state.events.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        ),
        currentEvent: state.currentEvent?.id === eventId 
          ? { ...state.currentEvent, ...updates }
          : state.currentEvent,
      }))
    },

    // Bid management
    addUserBid: (bid) => {
      set((state) => ({
        userBids: [...state.userBids, bid],
      }))
    },

    updateUserBid: (bidId, updates) => {
      set((state) => ({
        userBids: state.userBids.map((bid) =>
          bid.id === bidId ? { ...bid, ...updates } : bid
        ),
      }))
    },

    // WebSocket actions
    setConnected: (connected) => set({ isConnected: connected }),

    onEventMessageReceived: (message) => {
      set({ lastMessage: message })
      
      // Handle different message types
      switch (message.type) {
        case 'bidUpdate':
          if (message.bid) {
            get().updateUserBid(message.bid.id, message.bid)
          }
          break
          
        case 'eventStatusChange':
          if (message.eventId && message.status) {
            get().updateEvent(message.eventId, { status: message.status })
          }
          break
          
        default:
          console.log('Unhandled event message:', message)
      }
    },

    joinEvent: (eventId, user) => {
      set((state) => ({
        connectedUsers: [...state.connectedUsers.filter(u => u.id !== user.id), user],
      }))
    },

    leaveEvent: (eventId, user) => {
      set((state) => ({
        connectedUsers: state.connectedUsers.filter(u => u.id !== user.id),
      }))
    },

    updateEventData: (eventId, data) => {
      get().updateEvent(eventId, data)
    },

    updateSongLeaderboard: (eventId, songs) => {
      get().updateEvent(eventId, { songs, allSongs: songs })
    },

    // API integration actions
    fetchEvents: async (filters) => {
      try {
        set({ loading: true, error: null })
        
        // Import the service dynamically to avoid circular dependencies
        const { eventsService } = await import('../services/events.service')
        const events = await eventsService.getEvents(filters)
        
        set({ events, loading: false })
      } catch (error) {
        console.error('Failed to fetch events:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch events',
          loading: false 
        })
      }
    },

    fetchEvent: async (eventId) => {
      try {
        set({ loading: true, error: null })
        
        const { eventsService } = await import('../services/events.service')
        const event = await eventsService.getEvent(eventId)
        
        set({ currentEvent: event, loading: false })
        
        // Also update in events list if it exists
        get().updateEvent(eventId, event)
      } catch (error) {
        console.error('Failed to fetch event:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch event',
          loading: false 
        })
      }
    },

    placeBid: async (eventId, songId, bidAmount) => {
      try {
        const { eventsService } = await import('../services/events.service')
        const result = await eventsService.placeBid({ eventId, songId, bidAmount })
        
        // Add optimistic update
        const newBid: EventBid = {
          id: Date.now(), // Temporary ID
          userId: 'current-user', // This should come from auth store
          eventId,
          songId,
          bidAmount,
          timestamp: new Date().toISOString(),
          status: 'active',
        }
        
        get().addUserBid(newBid)
        
        // The real update will come via WebSocket
        console.log('Bid placed successfully:', result)
      } catch (error) {
        console.error('Failed to place bid:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to place bid'
        })
      }
    },

    joinEventAPI: async (eventId) => {
      try {
        const { eventsService } = await import('../services/events.service')
        await eventsService.joinEvent(eventId)
        
        // Update event to show user has joined
        get().updateEvent(eventId, { userHasJoined: true })
      } catch (error) {
        console.error('Failed to join event:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to join event'
        })
      }
    },
  }))
)

// Selectors for common use cases
export const eventsSelectors = {
  // Get events by genre
  getEventsByGenre: (genre: string) => (state: EventsState) =>
    state.events.filter(event => genre === 'All' || event.genre === genre),
    
  // Get user's active bids
  getActiveBids: (state: EventsState) =>
    state.userBids.filter(bid => bid.status === 'active'),
    
  // Get events user has joined
  getJoinedEvents: (state: EventsState) =>
    state.events.filter(event => (event as any).userHasJoined),
    
  // Check if user is connected to event
  isConnectedToEvent: (eventId: number) => (state: EventsState) =>
    state.isConnected && state.currentEvent?.id === eventId,
}

export default useEventsStore 