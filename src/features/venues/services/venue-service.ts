"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { 
  VenueProfile, 
  VenueGalleryImage, 
  VenueReview, 
  VenueOperatingHours,
  CreateVenueProfileData 
} from "@/src/shared/types/database"

const supabase = createServerComponentClient({ cookies })

// Get venue profile by profile_id
export async function getVenueProfile(profileId: string): Promise<VenueProfile | null> {
  try {
    const { data, error } = await supabase
      .from("venue_profiles")
      .select("*")
      .eq("profile_id", profileId)
      .single()

    if (error) {
      console.error("Error fetching venue profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getVenueProfile:", error)
    return null
  }
}

// Create or update venue profile
export async function upsertVenueProfile(
  profileId: string, 
  data: CreateVenueProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("venue_profiles")
      .upsert({
        profile_id: profileId,
        ...data,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error upserting venue profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in upsertVenueProfile:", error)
    return { success: false, error: "Failed to save venue profile" }
  }
}

// Get all venues (for browsing)
export async function getAllVenues(filters?: {
  venue_type?: string
  capacity_min?: number
  capacity_max?: number
  featured?: boolean
}): Promise<VenueProfile[]> {
  try {
    let query = supabase
      .from("venue_profiles")
      .select("*")
      .eq("active_for_bookings", true)

    if (filters?.venue_type) {
      query = query.eq("venue_type", filters.venue_type)
    }
    if (filters?.capacity_min) {
      query = query.gte("capacity", filters.capacity_min)
    }
    if (filters?.capacity_max) {
      query = query.lte("capacity", filters.capacity_max)
    }
    if (filters?.featured !== undefined) {
      query = query.eq("featured", filters.featured)
    }

    const { data, error } = await query.order("featured", { ascending: false })

    if (error) {
      console.error("Error fetching venues:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllVenues:", error)
    return []
  }
}

// Get venue gallery images
export async function getVenueGalleryImages(venueId: string): Promise<VenueGalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from("venue_gallery_images")
      .select("*")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching venue gallery:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getVenueGalleryImages:", error)
    return []
  }
}

// Add venue gallery image
export async function addVenueGalleryImage(
  venueId: string,
  url: string,
  caption?: string,
  isFeatured = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("venue_gallery_images")
      .insert({
        venue_id: venueId,
        url,
        caption,
        is_featured: isFeatured,
        display_order: 0 // Will be updated based on existing images
      })

    if (error) {
      console.error("Error adding venue gallery image:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in addVenueGalleryImage:", error)
    return { success: false, error: "Failed to add gallery image" }
  }
}

// Get venue reviews
export async function getVenueReviews(venueId: string): Promise<VenueReview[]> {
  try {
    const { data, error } = await supabase
      .from("venue_reviews")
      .select(`
        *,
        reviewer:reviewer_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching venue reviews:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getVenueReviews:", error)
    return []
  }
}

// Add venue review
export async function addVenueReview(
  venueId: string,
  reviewerId: string,
  rating: number,
  comment?: string,
  eventId?: string,
  reviewType = 'general'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("venue_reviews")
      .insert({
        venue_id: venueId,
        reviewer_id: reviewerId,
        event_id: eventId,
        rating,
        comment,
        review_type: reviewType
      })

    if (error) {
      console.error("Error adding venue review:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in addVenueReview:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Get venue operating hours
export async function getVenueOperatingHours(venueId: string): Promise<VenueOperatingHours[]> {
  try {
    const { data, error } = await supabase
      .from("venue_operating_hours")
      .select("*")
      .eq("venue_id", venueId)
      .order("day_of_week", { ascending: true })

    if (error) {
      console.error("Error fetching venue operating hours:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getVenueOperatingHours:", error)
    return []
  }
}

// Update venue operating hours
export async function updateVenueOperatingHours(
  venueId: string,
  hours: Omit<VenueOperatingHours, 'id' | 'venue_id' | 'created_at' | 'updated_at'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete existing hours
    await supabase
      .from("venue_operating_hours")
      .delete()
      .eq("venue_id", venueId)

    // Insert new hours
    const { error } = await supabase
      .from("venue_operating_hours")
      .insert(
        hours.map(hour => ({
          venue_id: venueId,
          ...hour
        }))
      )

    if (error) {
      console.error("Error updating venue operating hours:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateVenueOperatingHours:", error)
    return { success: false, error: "Failed to update operating hours" }
  }
}

// Get venue statistics
export async function getVenueStatistics(venueId: string) {
  try {
    // Get total events hosted
    const { count: eventsHosted } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("venue_id", venueId)

    // Get average rating
    const { data: reviewData } = await supabase
      .from("venue_reviews")
      .select("rating")
      .eq("venue_id", venueId)

    const avgRating = reviewData && reviewData.length > 0 
      ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length
      : 0

    // Get total tickets sold (assuming venue gets this data)
    // First get event IDs for this venue
    const { data: venueEvents } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venueId)

    const eventIds = venueEvents?.map(event => event.id) || []
    
    const { count: ticketsSold } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .in("event_id", eventIds)

    return {
      eventsHosted: eventsHosted || 0,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: reviewData?.length || 0,
      ticketsSold: ticketsSold || 0
    }
  } catch (error) {
    console.error("Error in getVenueStatistics:", error)
    return {
      eventsHosted: 0,
      averageRating: 0,
      totalReviews: 0,
      ticketsSold: 0
    }
  }
} 