import { useAuthStore } from '../stores/auth-store'
import { 
  getCompletionStatusMessage, 
  getNextRecommendedAction, 
  getPrioritizedMissingFields 
} from '../utils/profile-completion-tracker'

/**
 * Hook for profile completion functionality
 * Provides easy access to completion status, prompts, and actions
 */
export const useProfileCompletion = () => {
  const store = useAuthStore()
  
  // Basic state
  const profileCompletion = store.profileCompletion
  const user = store.user
  const roleSpecificData = store.roleSpecificData
  
  // Computed values
  const percentage = store.getCompletionPercentage()
  const isComplete = store.isProfileComplete()
  const shouldShowPrompt = store.shouldShowCompletionPrompt()
  const missingFields = store.getMissingFields()
  
  // Enhanced computed values
  const statusMessage = profileCompletion 
    ? getCompletionStatusMessage(profileCompletion)
    : "Complete your profile to get started"
    
  const nextAction = profileCompletion && user
    ? getNextRecommendedAction(profileCompletion, user.role)
    : "Set up your profile"
    
  const prioritizedMissingFields = user
    ? getPrioritizedMissingFields(missingFields, user.role)
    : missingFields
  
  // Actions
  const updateCompletion = store.updateProfileCompletion
  const loadRoleData = store.loadRoleSpecificData
  const setRoleData = store.setRoleSpecificData
  
  // Utility functions
  const refresh = () => {
    updateCompletion(roleSpecificData)
  }
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'green'
    if (percentage >= 80) return 'yellow'
    if (percentage >= 50) return 'orange'
    return 'red'
  }
  
  const getProgressVariant = () => {
    if (percentage >= 100) return 'complete'
    if (percentage >= 80) return 'high'
    if (percentage >= 50) return 'medium'
    return 'low'
  }
  
  return {
    // State
    profileCompletion,
    roleSpecificData,
    user,
    
    // Computed values
    percentage,
    isComplete,
    shouldShowPrompt,
    missingFields,
    prioritizedMissingFields,
    statusMessage,
    nextAction,
    
    // Actions
    updateCompletion,
    loadRoleData,
    setRoleData,
    refresh,
    
    // Utilities
    getProgressColor,
    getProgressVariant,
  }
} 