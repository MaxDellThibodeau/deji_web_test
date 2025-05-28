"use server"

import { revalidatePath } from "next/cache"
import { EventCodeService, type EventCodeCreateParams } from "@/features/events/services/event-code-service"
import { createClient } from "@/shared/services/server"

/**
 * Create new event codes
 */
export async function createEventCodes(formData: FormData) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.user.id
    const eventId = formData.get("eventId") as string
    const quantity = Number.parseInt(formData.get("quantity") as string) || 1
    const maxUses = Number.parseInt(formData.get("maxUses") as string) || 1

    // Parse expiration date if provided
    let expiresAt: Date | undefined
    const expirationDate = formData.get("expirationDate") as string
    if (expirationDate) {
      expiresAt = new Date(expirationDate)
    }

    // Validate inputs
    if (!eventId) {
      return { success: false, error: "Event ID is required" }
    }

    if (quantity < 1 || quantity > 100) {
      return { success: false, error: "Quantity must be between 1 and 100" }
    }

    if (maxUses < 1) {
      return { success: false, error: "Max uses must be at least 1" }
    }

    // Create the event codes
    const params: EventCodeCreateParams = {
      eventId,
      quantity,
      maxUses,
      expiresAt,
    }

    const codes = await EventCodeService.createEventCodes(params, userId)

    // Revalidate the event codes page
    revalidatePath(`/events/${eventId}/codes`)

    return { success: true, codes }
  } catch (error) {
    console.error("Error creating event codes:", error)
    return { success: false, error: "Failed to create event codes" }
  }
}

/**
 * Validate an event code
 */
export async function validateEventCode(eventId: string, code: string) {
  try {
    const isValid = await EventCodeService.validateEventCode(eventId, code)

    return { success: true, isValid }
  } catch (error) {
    console.error("Error validating event code:", error)
    return { success: false, error: "Failed to validate event code" }
  }
}

/**
 * Get all event codes for an event
 */
export async function getEventCodes(eventId: string) {
  try {
    const codes = await EventCodeService.getEventCodes(eventId)

    return { success: true, codes }
  } catch (error) {
    console.error("Error fetching event codes:", error)
    return { success: false, error: "Failed to fetch event codes" }
  }
}

/**
 * Deactivate an event code
 */
export async function deactivateEventCode(codeId: string, eventId: string) {
  try {
    const success = await EventCodeService.deactivateEventCode(codeId)

    // Revalidate the event codes page
    revalidatePath(`/events/${eventId}/codes`)

    return { success }
  } catch (error) {
    console.error("Error deactivating event code:", error)
    return { success: false, error: "Failed to deactivate event code" }
  }
}
