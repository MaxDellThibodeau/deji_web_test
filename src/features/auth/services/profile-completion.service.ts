import { createClientClient } from "@/shared/services/client"
import { z } from "zod"
import { UserRole } from "../types/user"
import { getValidationSchemaForRole } from "../utils/profile-validation"

export interface ProfileCompletionData {
  // Basic profile fields
  first_name?: string
  last_name?: string
  bio?: string
  phone?: string
  location?: string
  website?: string
  
  // Role-specific fields
  [key: string]: any
}

export interface ProfileCompletionResult {
  success: boolean
  percentage: number
  missingFields: string[]
  isComplete: boolean
  error?: string
}

export class ProfileCompletionService {
  private static client = createClientClient()

  /**
   * Get profile completion status for a user
   */
  static async getProfileCompletion(userId: string): Promise<ProfileCompletionResult> {
    try {
      const client = this.client
      if (!client) {
        return { success: false, percentage: 0, missingFields: [], isComplete: false, error: "Client not available" }
      }

      // Get user profile
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        return { success: false, percentage: 0, missingFields: [], isComplete: false, error: profileError.message }
      }

      // Get role-specific data
      const roleData = await this.getRoleSpecificData(userId, profile.role)
      
      // Calculate completion
      const completion = this.calculateCompletion(profile, roleData)
      
      return {
        success: true,
        ...completion
      }
    } catch (error) {
      return {
        success: false,
        percentage: 0,
        missingFields: [],
        isComplete: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  /**
   * Update profile with atomic operations
   */
  static async updateProfile(
    userId: string,
    profileData: ProfileCompletionData,
    roleData?: Record<string, any>
  ): Promise<ProfileCompletionResult> {
    try {
      const client = this.client
      if (!client) {
        return { success: false, percentage: 0, missingFields: [], isComplete: false, error: "Client not available" }
      }

      // Get current profile to determine role
      const { data: currentProfile, error: profileError } = await client
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError) {
        return { success: false, percentage: 0, missingFields: [], isComplete: false, error: profileError.message }
      }

      // Validate data
      const validationResult = this.validateProfileData(profileData, currentProfile.role, roleData)
      if (!validationResult.success) {
        return { success: false, percentage: 0, missingFields: [], isComplete: false, error: validationResult.error }
      }

      // Use atomic update function
      const result = await this.atomicProfileUpdate(userId, profileData, roleData, currentProfile.role)
      
      return result
    } catch (error) {
      return {
        success: false,
        percentage: 0,
        missingFields: [],
        isComplete: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  /**
   * Atomic profile update with role-specific data
   */
  private static async atomicProfileUpdate(
    userId: string,
    profileData: ProfileCompletionData,
    roleData: Record<string, any> | undefined,
    userRole: UserRole
  ): Promise<ProfileCompletionResult> {
    const client = this.client
    if (!client) {
      throw new Error("Client not available")
    }

    try {
      // Start transaction-like operation
      // Update main profile
      const { error: profileUpdateError } = await client
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileUpdateError) {
        throw new Error(`Profile update failed: ${profileUpdateError.message}`)
      }

      // Update role-specific data if provided
      if (roleData) {
        await this.updateRoleSpecificData(userId, userRole, roleData)
      }

      // Recalculate completion percentage
      const completionResult = await this.getProfileCompletion(userId)
      
      // Update completion percentage in profile
      await client
        .from('profiles')
        .update({
          profile_completion_percentage: completionResult.percentage,
          is_profile_complete: completionResult.isComplete,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      return completionResult
    } catch (error) {
      throw new Error(`Atomic update failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update role-specific data
   */
  private static async updateRoleSpecificData(
    userId: string,
    userRole: UserRole,
    roleData: Record<string, any>
  ): Promise<void> {
    const client = this.client
    if (!client) {
      throw new Error("Client not available")
    }

    const tableMap = {
      'attendee': 'attendee',
      'dj': 'dj',
      'venue': 'venue'
    }

    const tableName = tableMap[userRole]
    if (!tableName) {
      throw new Error(`Invalid role: ${userRole}`)
    }

    const { error } = await client
      .from(tableName)
      .update({
        ...roleData,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', userId)

    if (error) {
      throw new Error(`Role-specific update failed: ${error.message}`)
    }
  }

  /**
   * Get role-specific data
   */
  private static async getRoleSpecificData(userId: string, userRole: UserRole): Promise<Record<string, any> | null> {
    const client = this.client
    if (!client) {
      return null
    }

    const tableMap = {
      'attendee': 'attendee',
      'dj': 'dj',
      'venue': 'venue'
    }

    const tableName = tableMap[userRole]
    if (!tableName) {
      return null
    }

    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('profile_id', userId)
      .single()

    if (error) {
      console.warn(`Failed to get role-specific data: ${error.message}`)
      return null
    }

    return data
  }

  /**
   * Calculate profile completion percentage
   */
  private static calculateCompletion(
    profile: Record<string, any>,
    roleData: Record<string, any> | null
  ): { percentage: number; missingFields: string[]; isComplete: boolean } {
    const userRole = profile.role as UserRole
    
    // Define required fields by role
    const requiredFieldsByRole = {
      'attendee': [
        'bio', 'location', 'favorite_genres', 'music_discovery_preference'
      ],
      'dj': [
        'bio', 'location', 'stage_name', 'genres', 'experience_years', 'equipment_provided'
      ],
      'venue': [
        'bio', 'location', 'venue_name', 'venue_type', 'capacity', 'address', 'booking_email'
      ]
    }

    const requiredFields = requiredFieldsByRole[userRole] || []
    const completedFields: string[] = []
    const missingFields: string[] = []

    requiredFields.forEach(field => {
      let value = profile[field]
      
      // Check role-specific data if not found in profile
      if (!value && roleData) {
        value = roleData[field]
      }

      if (this.isFieldComplete(value)) {
        completedFields.push(field)
      } else {
        missingFields.push(field)
      }
    })

    const percentage = Math.round((completedFields.length / requiredFields.length) * 100)
    const isComplete = percentage === 100

    return {
      percentage,
      missingFields,
      isComplete
    }
  }

  /**
   * Check if a field value is considered complete
   */
  private static isFieldComplete(value: any): boolean {
    if (value === null || value === undefined) return false
    
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    
    if (Array.isArray(value)) {
      return value.length > 0
    }
    
    if (typeof value === 'number') {
      return !isNaN(value) && value >= 0
    }
    
    if (typeof value === 'boolean') {
      return true // Booleans are always complete once set
    }
    
    return false
  }

  /**
   * Validate profile data against role-specific schemas
   */
  private static validateProfileData(
    profileData: ProfileCompletionData,
    userRole: UserRole,
    roleData?: Record<string, any>
  ): { success: boolean; error?: string } {
    try {
      // Validate basic profile data
      const schema = getValidationSchemaForRole(userRole)
      
      // Combine profile and role data for validation
      const combinedData = { ...profileData, ...roleData }
      
      schema.parse(combinedData)
      
      return { success: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return { success: false, error: errorMessages }
      }
      
      return { success: false, error: error instanceof Error ? error.message : "Validation failed" }
    }
  }

  /**
   * Get role-specific field requirements
   */
  static getRequiredFieldsForRole(userRole: UserRole): string[] {
    const requiredFieldsByRole = {
      'attendee': [
        'bio', 'location', 'favorite_genres', 'music_discovery_preference'
      ],
      'dj': [
        'bio', 'location', 'stage_name', 'genres', 'experience_years', 'equipment_provided'
      ],
      'venue': [
        'bio', 'location', 'venue_name', 'venue_type', 'capacity', 'address', 'booking_email'
      ]
    }

    return requiredFieldsByRole[userRole] || []
  }

  /**
   * Initialize profile completion tracking for new users
   */
  static async initializeProfileTracking(userId: string, userRole: UserRole): Promise<void> {
    const client = this.client
    if (!client) {
      throw new Error("Client not available")
    }

    // Get initial completion status
    const completion = await this.getProfileCompletion(userId)
    
    // Update profile with completion data
    await client
      .from('profiles')
      .update({
        profile_completion_percentage: completion.percentage,
        is_profile_complete: completion.isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }
} 