"use client"

import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/auth-context"
import { ProfileImageUpload } from "@/shared/components/common/profile-image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"

export function ProfileImageUploader() {
  const { user, refreshUser } = useAuth()
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    setIsUploading(true)
    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", user.id)

      // Send to server
      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Refresh user data to get the new image URL
        await refreshUser()
        return { success: true, url: result.url }
      } else {
        return { success: false, error: result.error || "Upload failed" }
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
        <CardDescription>Upload a profile picture to personalize your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileImageUpload currentImageUrl={user.avatar_url} userName={user.name} onImageUpload={handleImageUpload} />
      </CardContent>
    </Card>
  )
}
