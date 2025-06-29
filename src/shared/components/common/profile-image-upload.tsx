"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  userName?: string | null
  onImageUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
}

export function ProfileImageUpload({ currentImageUrl, userName, onImageUpload }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Get initials for avatar fallback
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await onImageUpload(selectedFile)

      if (result.success) {
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated successfully.",
        })
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={previewUrl || currentImageUrl || undefined} alt={userName || "User"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="w-full">
        <Label htmlFor="profile-image-upload" className="mb-2 block">
          Upload new image
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("profile-image-upload")?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Image
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Recommended: Square image, at least 400x400 pixels. Max size: 5MB.
        </p>
      </div>

      <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
    </div>
  )
}
