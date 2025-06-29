// Mock Supabase client for development
// This can be replaced with actual Supabase client when needed

interface MockSupabaseClient {
  auth: {
    onAuthStateChange: (callback: () => void) => {
      data: {
        subscription: {
          unsubscribe: () => void
        }
      }
    }
  }
}

export function createClientClient(): MockSupabaseClient | null {
  // Return a mock client with the necessary interface
  return {
    auth: {
      onAuthStateChange: (callback: () => void) => {
        // Mock implementation - doesn't actually listen to auth changes
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                // Mock unsubscribe
              }
            }
          }
        }
      }
    }
  }
} 