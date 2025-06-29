import { createClient } from "@/shared/services/server"

export interface EventCode {
  id: string
  eventId: string
  code: string
  isActive: boolean
  maxUses: number | null
  currentUses: number
  createdBy: string
  createdAt: string
  expiresAt: string | null
}

export interface EventCodeCreateParams {
  eventId: string
  maxUses?: number
  expiresAt?: Date
  quantity?: number
}

export class EventCodeService {
  /**
   * Generate a random alphanumeric code
   * @param length Length of the code (default: 6)
   * @returns Random alphanumeric code
   */
  private static generateRandomCode(length = 6): string {
    // Use characters that are less likely to be confused with each other
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      code += characters.charAt(randomIndex)
    }

    return code
  }

  /**
   * Create new event codes
   * @param params Parameters for creating event codes
   * @param userId ID of the user creating the codes
   * @returns Array of created event codes
   */
  static async createEventCodes(params: EventCodeCreateParams, userId: string): Promise<EventCode[]> {
    const { eventId, maxUses = 1, expiresAt = null, quantity = 1 } = params
    const supabase = createClient()
    const codes: EventCode[] = []

    // Generate the specified quantity of codes
    for (let i = 0; i < quantity; i++) {
      // Generate a unique code
      let code: string
      let isUnique = false

      // Keep generating codes until we find a unique one
      while (!isUnique) {
        code = this.generateRandomCode()

        // Check if code already exists for this event
        const { data, error } = await supabase
          .from("event_codes")
          .select("code")
          .eq("event_id", eventId)
          .eq("code", code)
          .maybeSingle()

        if (error) {
          console.error("Error checking code uniqueness:", error)
          throw new Error("Failed to create event code")
        }

        isUnique = !data
      }

      // Insert the new code
      const { data, error } = await supabase
        .from("event_codes")
        .insert({
          event_id: eventId,
          code,
          max_uses: maxUses,
          current_uses: 0,
          created_by: userId,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        })
        .select("*")
        .single()

      if (error) {
        console.error("Error creating event code:", error)
        throw new Error("Failed to create event code")
      }

      codes.push({
        id: data.id,
        eventId: data.event_id,
        code: data.code,
        isActive: data.is_active,
        maxUses: data.max_uses,
        currentUses: data.current_uses,
        createdBy: data.created_by,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      })
    }

    return codes
  }

  /**
   * Validate an event code
   * @param eventId ID of the event
   * @param code Code to validate
   * @returns Whether the code is valid
   */
  static async validateEventCode(eventId: string, code: string): Promise<boolean> {
    const supabase = createClient()

    // Call the database function to validate the code
    const { data, error } = await supabase.rpc("validate_event_code", {
      p_event_id: eventId,
      p_code: code,
    })

    if (error) {
      console.error("Error validating event code:", error)
      return false
    }

    return !!data
  }

  /**
   * Get all event codes for an event
   * @param eventId ID of the event
   * @returns Array of event codes
   */
  static async getEventCodes(eventId: string): Promise<EventCode[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("event_codes")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching event codes:", error)
      return []
    }

    return data.map((code) => ({
      id: code.id,
      eventId: code.event_id,
      code: code.code,
      isActive: code.is_active,
      maxUses: code.max_uses,
      currentUses: code.current_uses,
      createdBy: code.created_by,
      createdAt: code.created_at,
      expiresAt: code.expires_at,
    }))
  }

  /**
   * Deactivate an event code
   * @param codeId ID of the code to deactivate
   * @returns Whether the deactivation was successful
   */
  static async deactivateEventCode(codeId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase.from("event_codes").update({ is_active: false }).eq("id", codeId)

    return !error
  }
}
