import { z } from 'zod'
import { UserRole } from '../types/user'

// Base validation schemas
const phoneSchema = z.string()
  .optional()
  .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
    message: "Invalid phone number format"
  })

const urlSchema = z.string()
  .optional()
  .refine((val) => !val || val.startsWith('http'), {
    message: "URL must start with http:// or https://"
  })

const socialHandleSchema = z.string()
  .optional()
  .refine((val) => !val || val.length <= 50, {
    message: "Social handle must be 50 characters or less"
  })

// Basic profile schema (common to all roles)
export const basicProfileSchema = z.object({
  bio: z.string()
    .min(20, "Bio must be at least 20 characters")
    .max(500, "Bio must be less than 500 characters"),
  phone: phoneSchema,
  location: z.string()
    .min(2, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  website: urlSchema
})

// DJ-specific schemas
export const djProfessionalSchema = z.object({
  stage_name: z.string()
    .min(2, "Stage name is required")
    .max(50, "Stage name must be less than 50 characters"),
  genres: z.array(z.string())
    .min(1, "Select at least one genre")
    .max(5, "Select up to 5 genres"),
  experience_years: z.number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high"),
  hourly_rate: z.number()
    .min(0, "Rate cannot be negative")
    .max(10000, "Rate seems too high")
    .optional(),
  equipment_provided: z.boolean()
})

export const djSocialSchema = z.object({
  social_links: z.object({
    instagram: socialHandleSchema,
    soundcloud: urlSchema,
    twitter: socialHandleSchema,
    website: urlSchema
  }).optional()
})

// Venue-specific schemas
export const venueDetailsSchema = z.object({
  venue_name: z.string()
    .min(2, "Venue name is required")
    .max(100, "Venue name must be less than 100 characters"),
  venue_type: z.string()
    .min(1, "Venue type is required"),
  capacity: z.number()
    .min(1, "Capacity must be at least 1")
    .max(50000, "Capacity seems too high"),
  address: z.string()
    .min(10, "Complete address is required")
    .max(200, "Address must be less than 200 characters"),
  booking_email: z.string()
    .email("Invalid email address")
})

export const venueAmenitiesSchema = z.object({
  amenities: z.array(z.string())
    .min(1, "Select at least one amenity"),
  description: z.string()
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description must be less than 1000 characters")
})

// Attendee-specific schemas
export const attendeePreferencesSchema = z.object({
  favorite_genres: z.array(z.string())
    .min(1, "Select at least one favorite genre"),
  music_discovery_preference: z.enum(['popular', 'underground', 'balanced']),
  preferred_event_types: z.array(z.string()).optional(),
  typical_budget_range: z.enum(['under_50', '50_100', '100_200', '200_plus']).optional()
})

// Combined schemas by role
export const getValidationSchemaForRole = (role: UserRole) => {
  const baseSchema = basicProfileSchema

  switch (role) {
    case 'dj':
      return z.object({
        ...baseSchema.shape,
        ...djProfessionalSchema.shape,
        ...djSocialSchema.shape
      })

    case 'venue':
      return z.object({
        ...baseSchema.shape,
        ...venueDetailsSchema.shape,
        ...venueAmenitiesSchema.shape
      })

    case 'attendee':
      return z.object({
        ...baseSchema.shape,
        ...attendeePreferencesSchema.shape
      })

    default:
      return baseSchema
  }
}

// Section-specific validation
export const getSectionValidationSchema = (role: UserRole, sectionId: string) => {
  switch (sectionId) {
    case 'basic':
      return basicProfileSchema

    case 'professional':
      if (role === 'dj') return djProfessionalSchema
      break

    case 'social':
      if (role === 'dj') return djSocialSchema
      break

    case 'venue_details':
      if (role === 'venue') return venueDetailsSchema
      break

    case 'amenities':
      if (role === 'venue') return venueAmenitiesSchema
      break

    case 'preferences':
      if (role === 'attendee') return attendeePreferencesSchema
      break

    default:
      return z.object({})
  }

  return z.object({})
}

// Field-level validation helpers
export const validateField = (fieldKey: string, value: any, role: UserRole): string | null => {
  try {
    const schema = getValidationSchemaForRole(role)
    const fieldSchema = schema.shape[fieldKey as keyof typeof schema.shape]
    
    if (fieldSchema) {
      fieldSchema.parse(value)
    }
    
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value'
    }
    return 'Validation error'
  }
}

// Utility to check if a field value is considered "complete"
export const isFieldComplete = (fieldKey: string, value: any): boolean => {
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
    return true // Booleans are always "complete" once set
  }
  
  return false
} 