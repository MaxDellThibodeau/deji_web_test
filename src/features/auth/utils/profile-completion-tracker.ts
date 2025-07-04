import { User, UserProfile } from '../types/user'
import { ProfileCompletion } from '../types/profile-completion'
import { getRequiredFieldsForRole, getAllFieldsForRole } from './profile-field-configs'
import { isFieldComplete } from './profile-validation'

// Calculate profile completion for a user
export const calculateProfileCompletion = (user: UserProfile | null): ProfileCompletion => {
  if (!user) {
    return {
      percentage: 0,
      completedFields: [],
      missingFields: [],
      totalFields: 0,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    }
  }

  const requiredFields = getRequiredFieldsForRole(user.role)
  const allFields = getAllFieldsForRole(user.role)
  
  // Map user data to field values
  const userFieldValues: Record<string, any> = {
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    website: user.website,
    // Note: Role-specific fields would need to be loaded separately
    // from their respective tables (dj_profiles, venue_profiles, attendee_profiles)
  }

  // Check which required fields are complete
  const completedRequiredFields = requiredFields.filter(field => {
    const value = userFieldValues[field]
    return isFieldComplete(field, value)
  })

  // Check which fields are missing
  const missingFields = requiredFields.filter(field => {
    const value = userFieldValues[field]
    return !isFieldComplete(field, value)
  })

  // Calculate percentage based on required fields only
  const percentage = requiredFields.length > 0 
    ? (completedRequiredFields.length / requiredFields.length) * 100 
    : 100

  return {
    percentage: Math.round(percentage),
    completedFields: completedRequiredFields,
    missingFields,
    totalFields: requiredFields.length,
    isComplete: missingFields.length === 0,
    lastUpdated: user.updated_at || new Date().toISOString()
  }
}

// Calculate completion with role-specific data
export const calculateProfileCompletionWithRoleData = (
  user: UserProfile | null, 
  roleSpecificData?: any
): ProfileCompletion => {
  if (!user) {
    return calculateProfileCompletion(null)
  }

  const requiredFields = getRequiredFieldsForRole(user.role)
  
  // Combine user data with role-specific data
  const combinedData: Record<string, any> = {
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    website: user.website,
    ...roleSpecificData
  }

  // Check which required fields are complete
  const completedRequiredFields = requiredFields.filter(field => {
    const value = getNestedValue(combinedData, field)
    return isFieldComplete(field, value)
  })

  // Check which fields are missing
  const missingFields = requiredFields.filter(field => {
    const value = getNestedValue(combinedData, field)
    return !isFieldComplete(field, value)
  })

  const percentage = requiredFields.length > 0 
    ? (completedRequiredFields.length / requiredFields.length) * 100 
    : 100

  return {
    percentage: Math.round(percentage),
    completedFields: completedRequiredFields,
    missingFields,
    totalFields: requiredFields.length,
    isComplete: missingFields.length === 0,
    lastUpdated: user.updated_at || new Date().toISOString()
  }
}

// Helper function to get nested values (e.g., 'social_links.instagram')
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

// Check if profile completion should trigger a prompt
export const shouldShowCompletionPrompt = (completion: ProfileCompletion): boolean => {
  // Show prompt if profile is less than 80% complete
  return completion.percentage < 80
}

// Get completion status message
export const getCompletionStatusMessage = (completion: ProfileCompletion): string => {
  if (completion.isComplete) {
    return "Your profile is complete!"
  }
  
  if (completion.percentage >= 80) {
    return "Almost done! Just a few more fields to go."
  }
  
  if (completion.percentage >= 50) {
    return "You're halfway there! Keep going."
  }
  
  return "Let's complete your profile to get started."
}

// Get next recommended action
export const getNextRecommendedAction = (completion: ProfileCompletion, userRole: string): string => {
  if (completion.isComplete) {
    return "Explore the platform!"
  }

  // Role-specific recommendations
  const missingFields = completion.missingFields
  
  if (missingFields.includes('bio')) {
    return "Add a bio to help others get to know you"
  }
  
  if (userRole === 'dj' && missingFields.includes('genres')) {
    return "Select your music genres to attract the right audience"
  }
  
  if (userRole === 'venue' && missingFields.includes('venue_name')) {
    return "Add your venue name and details"
  }
  
  if (userRole === 'attendee' && missingFields.includes('favorite_genres')) {
    return "Choose your favorite music genres for better recommendations"
  }
  
  return "Complete the remaining profile fields"
}

// Priority order for missing fields (most important first)
export const getPrioritizedMissingFields = (missingFields: string[], userRole: string): string[] => {
  const priorityMap: Record<string, number> = {
    // High priority (core fields)
    bio: 10,
    location: 9,
    
    // Role-specific high priority
    stage_name: userRole === 'dj' ? 8 : 0,
    genres: userRole === 'dj' ? 8 : 0,
    venue_name: userRole === 'venue' ? 8 : 0,
    favorite_genres: userRole === 'attendee' ? 8 : 0,
    
    // Medium priority
    phone: 6,
    website: 5,
    
    // Lower priority (nice to have)
    'social_links.instagram': 3,
    'social_links.soundcloud': 3,
    hourly_rate: 2,
  }

  return missingFields.sort((a, b) => {
    const priorityA = priorityMap[a] || 1
    const priorityB = priorityMap[b] || 1
    return priorityB - priorityA
  })
} 