import { createClientClient } from '@/shared/services/client'
import { DemoAccountsService } from '@/features/auth/services/demo-accounts.service'

interface DemoUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'dj' | 'venue' | 'attendee'
  profileData: any
}

const DEMO_USERS: DemoUserData[] = [
  {
    email: 'dj@djei.demo',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Rivera',
    role: 'dj',
    profileData: {
      stage_name: 'DJ Alex Rivera',
      bio: 'Professional DJ with 8+ years of experience specializing in electronic and hip-hop music.',
      experience_years: 8,
      primary_genre: 'Electronic',
      secondary_genres: ['Hip-Hop', 'House', 'Techno'],
      hourly_rate: 15000, // $150 in cents
      equipment_provided: true,
      available_for_booking: true,
      location: 'San Francisco, CA',
      phone: '+1-555-0123',
      instagram: '@alexrivera_dj',
      soundcloud: 'alexrivera-dj'
    }
  },
  {
    email: 'alex@djei.demo',
    password: 'password123',
    firstName: 'Sam',
    lastName: 'Chen',
    role: 'attendee',
    profileData: {
      favorite_genres: ['Electronic', 'Hip-Hop', 'Pop'],
      music_discovery_preference: 'balanced',
      preferred_event_types: ['club', 'festival', 'private_party'],
      typical_budget_range: '50_100',
      preferred_event_times: 'late_night',
      allow_song_requests: true,
      public_bidding_history: false,
      share_attendance_publicly: true,
      accept_friend_requests: true,
      notify_favorite_djs: true,
      notify_venue_events: true,
      notify_genre_events: true,
      notify_friend_activity: false
    }
  },
  {
    email: 'venue@djei.demo',
    password: 'password123',
    firstName: 'Marina',
    lastName: 'Rodriguez',
    role: 'venue',
    profileData: {
      venue_name: 'The Electric Lounge',
      venue_type: 'nightclub',
      capacity: 350,
      established: 2018,
      address: '123 Music Street, San Francisco, CA 94102',
      phone: '+1-555-0456',
      website: 'https://electriclounge.demo',
      booking_email: 'bookings@electriclounge.demo',
      description: 'Premier nightclub featuring the best electronic music and DJ performances in the city.',
      operating_hours: 'Thu-Sat: 9PM-2AM',
      pricing_info: 'Base rate: $2000/night, Premium nights: $3500/night',
      amenities: ['full_bar', 'vip_section', 'outdoor_patio', 'parking'],
      sound_system: 'Funktion-One Resolution 5 System',
      lighting_system: 'Full LED with intelligent moving lights',
      stage_info: 'Elevated DJ booth with 360° access',
      featured: true,
      active_for_bookings: true,
      notifications_enabled: true,
      instagram: '@electriclounge_sf',
      facebook: 'ElectricLoungeSF'
    }
  }
]

export async function setupDemoAccounts() {
  console.log('🚀 Setting up demo accounts...')
  
  const supabase = createClientClient()
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const demoUser of DEMO_USERS) {
    try {
      console.log(`📝 Creating demo account: ${demoUser.email}`)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: demoUser.email,
        password: demoUser.password,
        options: {
          data: {
            first_name: demoUser.firstName,
            last_name: demoUser.lastName,
            role: demoUser.role
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`ℹ️  User ${demoUser.email} already exists, updating profile...`)
          
          // Try to sign in to get the user ID
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: demoUser.email,
            password: demoUser.password
          })

          if (signInError) {
            console.error(`❌ Could not sign in as ${demoUser.email}:`, signInError.message)
            errorCount++
            continue
          }

          // Update existing profile
          await updateExistingProfile(supabase, signInData.user!.id, demoUser)
          successCount++
          continue
        } else {
          console.error(`❌ Auth error for ${demoUser.email}:`, authError.message)
          errorCount++
          continue
        }
      }

      if (!authData.user) {
        console.error(`❌ No user data returned for ${demoUser.email}`)
        errorCount++
        continue
      }

      // Step 2: Create/update profile
      await createUserProfile(supabase, authData.user.id, demoUser)
      
      // Step 3: Initialize tokens
      await initializeTokens(supabase, authData.user.id)

      console.log(`✅ Successfully created demo account: ${demoUser.email}`)
      successCount++

    } catch (error) {
      console.error(`❌ Failed to create demo account ${demoUser.email}:`, error)
      errorCount++
    }
  }

  console.log(`\n🎉 Demo account setup complete!`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  
  if (successCount > 0) {
    console.log(`\n🔑 Demo Account Credentials:`)
    DEMO_USERS.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`)
    })
  }
}

async function createUserProfile(supabase: any, userId: string, demoUser: DemoUserData) {
  // Create main profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: demoUser.email,
      first_name: demoUser.firstName,
      last_name: demoUser.lastName,
      role: demoUser.role,
      bio: demoUser.role === 'dj' ? demoUser.profileData.bio : 
           demoUser.role === 'venue' ? demoUser.profileData.description : 
           'Demo account for testing and exploration',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    throw new Error(`Profile creation error: ${profileError.message}`)
  }

  // Create role-specific profile
  if (demoUser.role === 'dj') {
    const { error } = await supabase
      .from('dj_profiles')
      .upsert({
        profile_id: userId,
        ...demoUser.profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw new Error(`DJ profile error: ${error.message}`)
    
  } else if (demoUser.role === 'venue') {
    const { error } = await supabase
      .from('venue_profiles')
      .upsert({
        profile_id: userId,
        ...demoUser.profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw new Error(`Venue profile error: ${error.message}`)
    
  } else if (demoUser.role === 'attendee') {
    const { error } = await supabase
      .from('attendee_profiles')
      .upsert({
        profile_id: userId,
        ...demoUser.profileData,
        total_events_attended: 0,
        total_tokens_spent: 0,
        total_songs_requested: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw new Error(`Attendee profile error: ${error.message}`)
  }
}

async function updateExistingProfile(supabase: any, userId: string, demoUser: DemoUserData) {
  // Update main profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: demoUser.firstName,
      last_name: demoUser.lastName,
      role: demoUser.role,
      bio: demoUser.role === 'dj' ? demoUser.profileData.bio : 
           demoUser.role === 'venue' ? demoUser.profileData.description : 
           'Demo account for testing and exploration',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    console.warn(`Profile update warning: ${profileError.message}`)
  }

  // Update role-specific profile
  const tableName = `${demoUser.role}_profiles`
  const { error } = await supabase
    .from(tableName)
    .upsert({
      profile_id: userId,
      ...demoUser.profileData,
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.warn(`${demoUser.role} profile update warning: ${error.message}`)
  }
}

async function initializeTokens(supabase: any, userId: string) {
  const { error } = await supabase
    .from('user_tokens')
    .upsert({
      profile_id: userId,
      balance: 100, // Give demo users 100 tokens to start
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.warn(`Token initialization warning: ${error.message}`)
  }
}

// Auto-run if this script is imported in browser console
if (typeof window !== 'undefined') {
  console.log('Demo Account Setup Script Loaded!')
  console.log('Run setupDemoAccounts() to create demo accounts.')
  // @ts-ignore
  window.setupDemoAccounts = setupDemoAccounts
} 