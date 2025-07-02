import { apiService } from '@api'
import type { Event, EventFilters, EventCode } from '../types'

export interface CreateEventPayload {
  title: string
  description: string
  date: string
  time: string
  venue: string
  location: string
  price: number
  genre: string
  capacity: number
  featuredDj: string
  amenities: string[]
  ageRestriction: string
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  id: number
}

export interface EventBidPayload {
  eventId: number
  songId: number
  bidAmount: number
}

// Events API service
export const eventsService = {
  // Get all events with optional filters
  getEvents: async (filters?: EventFilters): Promise<Event[]> => {
    const params = new URLSearchParams()
    
    if (filters?.genre && filters.genre !== 'All') {
      params.append('genre', filters.genre)
    }
    if (filters?.location) {
      params.append('location', filters.location)
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate)
    }
    if (filters?.minPrice !== undefined) {
      params.append('minPrice', filters.minPrice.toString())
    }
    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString())
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = queryString ? `/events?${queryString}` : '/events'
    
    return apiService.get<Event[]>(url)
  },

  // Get single event by ID
  getEvent: async (id: number): Promise<Event> => {
    return apiService.get<Event>(`/events/${id}`)
  },

  // Create new event
  createEvent: async (payload: CreateEventPayload): Promise<Event> => {
    return apiService.post<Event>('/events', payload)
  },

  // Update existing event
  updateEvent: async (payload: UpdateEventPayload): Promise<Event> => {
    const { id, ...data } = payload
    return apiService.put<Event>(`/events/${id}`, data)
  },

  // Delete event
  deleteEvent: async (id: number): Promise<void> => {
    return apiService.delete(`/events/${id}`)
  },

  // Get event leaderboard/songs
  getEventSongs: async (eventId: number): Promise<any[]> => {
    return apiService.get<any[]>(`/events/${eventId}/songs`)
  },

  // Place bid on song
  placeBid: async (payload: EventBidPayload): Promise<any> => {
    return apiService.post(`/events/${payload.eventId}/bids`, {
      songId: payload.songId,
      bidAmount: payload.bidAmount,
    })
  },

  // Get user's bids for event
  getUserBids: async (eventId: number): Promise<any[]> => {
    return apiService.get<any[]>(`/events/${eventId}/my-bids`)
  },

  // Join event (purchase ticket)
  joinEvent: async (eventId: number): Promise<any> => {
    return apiService.post(`/events/${eventId}/join`)
  },

  // Leave event
  leaveEvent: async (eventId: number): Promise<void> => {
    return apiService.post(`/events/${eventId}/leave`)
  },

  // Get event code for attendees
  generateEventCode: async (eventId: number): Promise<EventCode> => {
    return apiService.post<EventCode>(`/events/${eventId}/generate-code`)
  },

  // Validate event code
  validateEventCode: async (code: string): Promise<{ valid: boolean; event?: Event }> => {
    return apiService.post<{ valid: boolean; event?: Event }>('/events/validate-code', { code })
  },

  // Get event analytics (for event organizers)
  getEventAnalytics: async (eventId: number): Promise<any> => {
    return apiService.get(`/events/${eventId}/analytics`)
  },

  // Upload event image
  uploadEventImage: async (eventId: number, file: File): Promise<{ imageUrl: string }> => {
    return apiService.upload<{ imageUrl: string }>(`/events/${eventId}/upload-image`, file)
  },
}

export default eventsService 