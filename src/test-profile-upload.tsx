import React from 'react'
import { ProfileImageUpload } from '@/features/auth/components/profile-image-upload'
import { UserProfileDisplay } from '@/shared/components/common/user-profile-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

/**
 * Test component to validate profile image upload functionality
 * 
 * To test:
 * 1. Import this component in your main App.tsx
 * 2. Render it when user is authenticated
 * 3. Test upload functionality
 */
export function TestProfileUpload() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-white">Profile Image Upload Test</h1>
      
      {/* Current User Display */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileDisplay size="lg" showRole={true} />
        </CardContent>
      </Card>

      {/* Upload Component */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Upload New Profile Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileImageUpload
            onUploadSuccess={(url) => {
              console.log('✅ Upload successful:', url)
              alert('Profile image uploaded successfully!')
            }}
            onUploadError={(error) => {
              console.error('❌ Upload failed:', error)
              alert(`Upload failed: ${error}`)
            }}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong>To test:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure you're logged in with a valid user account</li>
              <li>Try dragging and dropping a JPEG/PNG image (≤ 2MB)</li>
              <li>Or click to select a file</li>
              <li>Watch the upload progress</li>
              <li>Check that the avatar updates in the "Current User" section</li>
            </ul>
            <p className="mt-4"><strong>Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase Storage bucket 'avatars' must exist</li>
              <li>Storage policies must be configured (see PROFILE_IMAGE_SETUP.md)</li>
              <li>User must be authenticated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 