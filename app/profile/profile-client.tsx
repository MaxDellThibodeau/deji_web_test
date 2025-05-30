"use client"

import type { UserProfile } from "@/features/auth/types"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { ProfileImageUploader } from "@/shared/components/common/profile-image-uploader"

interface ProfileClientProps {
  initialUser: UserProfile
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const { user } = useAuth()
  const currentUser = (user as UserProfile) || initialUser

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="grid gap-6">
          <ProfileImageUploader />
        </div>
      </div>
    </div>
  )
} 