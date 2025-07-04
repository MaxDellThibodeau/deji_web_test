import { createClientClient } from "@/shared/services/client"

/**
 * Setup script to configure Supabase Storage for profile images
 * Run this once to set up the required storage bucket and policies
 */
export async function setupSupabaseStorage() {
  const supabase = createClientClient()
  
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return false
  }

  try {
    console.log('🚀 Setting up Supabase Storage...')

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError)
      return false
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars')

    if (!avatarsBucket) {
      console.log('📦 Creating avatars bucket...')
      
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        fileSizeLimit: 2097152, // 2MB
      })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
        return false
      }

      console.log('✅ Avatars bucket created successfully')
    } else {
      console.log('✅ Avatars bucket already exists')
    }

    // Test upload permissions (this will fail gracefully if policies aren't set)
    try {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const { error: testError } = await supabase.storage
        .from('avatars')
        .upload('test/test.txt', testFile)

      if (testError && testError.message.includes('policy')) {
        console.log('⚠️  Storage policies need to be configured in Supabase Dashboard')
        console.log('📋 Required policies:')
        console.log('   1. Allow authenticated users to INSERT in avatars bucket')
        console.log('   2. Allow authenticated users to UPDATE their own files')
        console.log('   3. Allow public READ access to avatars bucket')
        console.log('')
        console.log('🔗 Configure at: https://supabase.com/dashboard/project/YOUR_PROJECT/storage/policies')
      } else if (!testError) {
        // Clean up test file
        await supabase.storage.from('avatars').remove(['test/test.txt'])
        console.log('✅ Storage permissions configured correctly')
      }
    } catch (error) {
      console.log('⚠️  Could not test storage permissions')
    }

    return true

  } catch (error) {
    console.error('❌ Error setting up storage:', error)
    return false
  }
}

/**
 * Example Supabase Storage Policies (to be added in Supabase Dashboard)
 * 
 * 1. Allow authenticated users to upload avatars:
 *    Policy name: "Users can upload their own avatar"
 *    Allowed operation: INSERT
 *    Target roles: authenticated
 *    USING expression: auth.uid()::text = (storage.foldername(name))[1]
 * 
 * 2. Allow authenticated users to update their own avatars:
 *    Policy name: "Users can update their own avatar"
 *    Allowed operation: UPDATE
 *    Target roles: authenticated
 *    USING expression: auth.uid()::text = (storage.foldername(name))[1]
 * 
 * 3. Allow public read access to avatars:
 *    Policy name: "Public avatar access"
 *    Allowed operation: SELECT
 *    Target roles: public
 *    USING expression: true
 * 
 * 4. Allow users to delete their own avatars:
 *    Policy name: "Users can delete their own avatar"
 *    Allowed operation: DELETE
 *    Target roles: authenticated
 *    USING expression: auth.uid()::text = (storage.foldername(name))[1]
 */

// If running this file directly
if (typeof window !== 'undefined') {
  setupSupabaseStorage().then(success => {
    if (success) {
      console.log('🎉 Storage setup completed!')
    } else {
      console.log('❌ Storage setup failed. Check the console for details.')
    }
  })
} 