"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { 
  AttendeeProfile, 
  AttendeeEventHistory, 
  AttendeeConnection,
  AttendeeFavoriteDJ,
  AttendeeFavoriteVenue,
  CreateAttendeeProfileData 
} from "@/src/shared/types/database"

const supabase = createServerComponentClient({ cookies })

// Get attendee profile by profile_id
export async function getAttendeeProfile(profileId: string): Promise<AttendeeProfile | null> {
  try {
    const { data, error } = await supabase
      .from("attendee_profiles")
      .select("*")
      .eq("profile_id", profileId)
      .single()

    if (error) {
      console.error("Error fetching attendee profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getAttendeeProfile:", error)
    return null
  }
}

// Create or update attendee profile
export async function upsertAttendeeProfile(
  profileId: string, 
  data: CreateAttendeeProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendee_profiles")
      .upsert({
        profile_id: profileId,
        ...data,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error upserting attendee profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in upsertAttendeeProfile:", error)
    return { success: false, error: "Failed to save attendee profile" }
  }
}

// Get attendee event history
export async function getAttendeeEventHistory(attendeeId: string): Promise<AttendeeEventHistory[]> {
  try {
    const { data, error } = await supabase
      .from("attendee_event_history")
      .select(`
        *,
        event:event_id (
          title,
          description,
          event_date,
          venue,
          image_url
        )
      `)
      .eq("attendee_id", attendeeId)
      .order("attendance_date", { ascending: false })

    if (error) {
      console.error("Error fetching attendee event history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAttendeeEventHistory:", error)
    return []
  }
}

// Add event to attendee history
export async function addAttendeeEventHistory(
  attendeeId: string,
  eventId: string,
  tokensSpent = 0,
  songsRequested = 0,
  rating?: number,
  feedback?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendee_event_history")
      .insert({
        attendee_id: attendeeId,
        event_id: eventId,
        attendance_date: new Date().toISOString(),
        tokens_spent: tokensSpent,
        songs_requested: songsRequested,
        rating,
        feedback
      })

    if (error) {
      console.error("Error adding attendee event history:", error)
      return { success: false, error: error.message }
    }

    // Update attendee statistics
    await updateAttendeeStatistics(attendeeId, tokensSpent, songsRequested)

    return { success: true }
  } catch (error) {
    console.error("Error in addAttendeeEventHistory:", error)
    return { success: false, error: "Failed to add event history" }
  }
}

// Update attendee statistics
async function updateAttendeeStatistics(
  attendeeId: string, 
  tokensSpent: number, 
  songsRequested: number
): Promise<void> {
  try {
    const { data: currentProfile } = await supabase
      .from("attendee_profiles")
      .select("total_events_attended, total_tokens_spent, total_songs_requested")
      .eq("profile_id", attendeeId)
      .single()

    if (currentProfile) {
      await supabase
        .from("attendee_profiles")
        .update({
          total_events_attended: currentProfile.total_events_attended + 1,
          total_tokens_spent: currentProfile.total_tokens_spent + tokensSpent,
          total_songs_requested: currentProfile.total_songs_requested + songsRequested,
          updated_at: new Date().toISOString()
        })
        .eq("profile_id", attendeeId)
    }
  } catch (error) {
    console.error("Error updating attendee statistics:", error)
  }
}

// Get attendee connections/friends
export async function getAttendeeConnections(
  attendeeId: string, 
  status?: 'pending' | 'accepted' | 'blocked'
): Promise<AttendeeConnection[]> {
  try {
    let query = supabase
      .from("attendee_connections")
      .select(`
        *,
        requester:requester_id (
          first_name,
          last_name,
          avatar_url
        ),
        receiver:receiver_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`requester_id.eq.${attendeeId},receiver_id.eq.${attendeeId}`)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching attendee connections:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAttendeeConnections:", error)
    return []
  }
}

// Send friend request
export async function sendFriendRequest(
  requesterId: string,
  receiverId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendee_connections")
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending'
      })

    if (error) {
      console.error("Error sending friend request:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in sendFriendRequest:", error)
    return { success: false, error: "Failed to send friend request" }
  }
}

// Accept/reject friend request
export async function updateFriendRequestStatus(
  connectionId: number,
  status: 'accepted' | 'blocked'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendee_connections")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", connectionId)

    if (error) {
      console.error("Error updating friend request status:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateFriendRequestStatus:", error)
    return { success: false, error: "Failed to update friend request" }
  }
}

// Get favorite DJs
export async function getAttendeeFavoriteDJs(attendeeId: string): Promise<AttendeeFavoriteDJ[]> {
  try {
    const { data, error } = await supabase
      .from("attendee_favorite_djs")
      .select(`
        *,
        dj:dj_id (
          first_name,
          last_name,
          avatar_url
        ),
        dj_profile:dj_id (
          dj_profiles (
            stage_name,
            primary_genre,
            cover_image
          )
        )
      `)
      .eq("attendee_id", attendeeId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorite DJs:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAttendeeFavoriteDJs:", error)
    return []
  }
}

// Add/remove favorite DJ
export async function toggleFavoriteDJ(
  attendeeId: string,
  djId: string
): Promise<{ success: boolean; added: boolean; error?: string }> {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from("attendee_favorite_djs")
      .select("id")
      .eq("attendee_id", attendeeId)
      .eq("dj_id", djId)
      .single()

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from("attendee_favorite_djs")
        .delete()
        .eq("id", existing.id)

      if (error) {
        return { success: false, added: false, error: error.message }
      }

      return { success: true, added: false }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("attendee_favorite_djs")
        .insert({
          attendee_id: attendeeId,
          dj_id: djId
        })

      if (error) {
        return { success: false, added: false, error: error.message }
      }

      return { success: true, added: true }
    }
  } catch (error) {
    console.error("Error in toggleFavoriteDJ:", error)
    return { success: false, added: false, error: "Failed to update favorite DJ" }
  }
}

// Get favorite venues
export async function getAttendeeFavoriteVenues(attendeeId: string): Promise<AttendeeFavoriteVenue[]> {
  try {
    const { data, error } = await supabase
      .from("attendee_favorite_venues")
      .select(`
        *,
        venue:venue_id (
          first_name,
          last_name,
          avatar_url
        ),
        venue_profile:venue_id (
          venue_profiles (
            venue_name,
            venue_type,
            capacity,
            profile_image
          )
        )
      `)
      .eq("attendee_id", attendeeId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorite venues:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAttendeeFavoriteVenues:", error)
    return []
  }
}

// Add/remove favorite venue
export async function toggleFavoriteVenue(
  attendeeId: string,
  venueId: string
): Promise<{ success: boolean; added: boolean; error?: string }> {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from("attendee_favorite_venues")
      .select("id")
      .eq("attendee_id", attendeeId)
      .eq("venue_id", venueId)
      .single()

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from("attendee_favorite_venues")
        .delete()
        .eq("id", existing.id)

      if (error) {
        return { success: false, added: false, error: error.message }
      }

      return { success: true, added: false }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("attendee_favorite_venues")
        .insert({
          attendee_id: attendeeId,
          venue_id: venueId
        })

      if (error) {
        return { success: false, added: false, error: error.message }
      }

      return { success: true, added: true }
    }
  } catch (error) {
    console.error("Error in toggleFavoriteVenue:", error)
    return { success: false, added: false, error: "Failed to update favorite venue" }
  }
}

// Get attendee dashboard statistics
export async function getAttendeeDashboardStats(attendeeId: string) {
  try {
    const profile = await getAttendeeProfile(attendeeId)
    const eventHistory = await getAttendeeEventHistory(attendeeId)
    const connections = await getAttendeeConnections(attendeeId, 'accepted')
    const favoriteDJs = await getAttendeeFavoriteDJs(attendeeId)
    const favoriteVenues = await getAttendeeFavoriteVenues(attendeeId)

    return {
      totalEventsAttended: profile?.total_events_attended || 0,
      totalTokensSpent: profile?.total_tokens_spent || 0,
      totalSongsRequested: profile?.total_songs_requested || 0,
      totalFriends: connections.length,
      favoriteDJsCount: favoriteDJs.length,
      favoriteVenuesCount: favoriteVenues.length,
      recentEvents: eventHistory.slice(0, 5),
      upcomingEvents: [] // This would need to be calculated based on ticket purchases
    }
  } catch (error) {
    console.error("Error in getAttendeeDashboardStats:", error)
    return {
      totalEventsAttended: 0,
      totalTokensSpent: 0,
      totalSongsRequested: 0,
      totalFriends: 0,
      favoriteDJsCount: 0,
      favoriteVenuesCount: 0,
      recentEvents: [],
      upcomingEvents: []
    }
  }
} 