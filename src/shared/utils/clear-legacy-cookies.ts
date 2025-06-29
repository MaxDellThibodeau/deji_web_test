// Utility to clear legacy admin cookies and reset them
export function clearLegacyCookies() {
  if (typeof window === 'undefined') return;

  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    
    // If we find user_role=admin, clear it and set to attendee with admin flag
    if (name === 'user_role' && value === 'admin') {
      console.log('🧹 Clearing legacy admin cookie');
      
      // Clear old cookies
      document.cookie = `user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      // Reload the page to reset auth state
      window.location.reload();
      return;
    }
  }
}

// Auto-run on import
if (typeof window !== 'undefined') {
  clearLegacyCookies();
} 