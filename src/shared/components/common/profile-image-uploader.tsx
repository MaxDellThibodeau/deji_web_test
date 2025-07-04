"use client"

import { ProfileImageUpload } from "@/features/auth/components/profile-image-upload"
import { useAuthStore } from "@/features/auth/stores/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface ProfileImageUploaderProps {
  className?: string
  showCard?: boolean
  title?: string
  description?: string
}

export function ProfileImageUploader({ 
  className = "",
  showCard = true,
  title = "Profile Image",
  description = "Upload a profile picture to personalize your account."
}: ProfileImageUploaderProps) {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  const content = (
    <ProfileImageUpload
      className={className}
      onUploadSuccess={(url) => {
        console.log('✅ Profile image updated:', url)
      }}
      onUploadError={(error) => {
        console.error('❌ Profile image upload failed:', error)
      }}
    />
  )

  if (!showCard) {
    return content
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
