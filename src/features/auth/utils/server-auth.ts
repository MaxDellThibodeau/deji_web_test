import { cookies } from 'next/headers'
import type { UserProfile, UserRole } from '../types'

export async function getServerSideUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies()
    
    const userId = cookieStore.get('user_id')?.value
    const userName = cookieStore.get('user_name')?.value
    const userRole = cookieStore.get('user_role')?.value as UserRole | undefined
    const userEmail = cookieStore.get('user_email')?.value
    const tokenBalance = Number(cookieStore.get('token_balance')?.value || '0')
    const phone = cookieStore.get('user_phone')?.value
    const location = cookieStore.get('user_location')?.value
    const bio = cookieStore.get('user_bio')?.value
    const website = cookieStore.get('user_website')?.value

    if (!userId) return null

    return {
      id: userId,
      name: userName || 'User',
      role: userRole || 'attendee',
      email: userEmail || '',
      avatar_url: null,
      token_balance: tokenBalance,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: phone || '',
      location: location || '',
      bio: bio || '',
      website: website || ''
    } as UserProfile
  } catch (error) {
    // If cookies() fails (e.g. during static generation), return null
    return null
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getServerSideUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
} 