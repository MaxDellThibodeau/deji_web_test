import { useState, useRef, useCallback } from "react"
import { Upload, X, Camera, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { createClientClient } from "@/shared/services/client"
import { useAuthStore } from "../stores/auth-store"

interface ProfileImageUploadProps {
  onUploadSuccess?: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
  className?: string
  showProgress?: boolean
}

export function ProfileImageUpload({ 
  onUploadSuccess, 
  onUploadError, 
  className = "",
  showProgress = true 
}: ProfileImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, refreshUser } = useAuthStore()

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return 'Please select a JPEG or PNG image'
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return 'Image must be less than 2MB'
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error("Invalid file", { description: error })
      if (onUploadError) onUploadError(error)
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [onUploadError])

  // Upload to Supabase Storage
  const uploadToSupabase = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = createClientClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Replace existing file
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    return urlData.publicUrl
  }

  // Update profile with new avatar URL
  const updateProfile = async (avatarUrl: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = createClientClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('Profile update error:', error)
      throw new Error('Failed to update profile')
    }
  }

  // Handle upload process
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("Please select an image first")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log('🖼️ Starting image upload...')
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Upload to Supabase Storage
      const avatarUrl = await uploadToSupabase(selectedFile)
      console.log('✅ Image uploaded to:', avatarUrl)

      // Update profile
      await updateProfile(avatarUrl)
      console.log('✅ Profile updated with new avatar')

      // Clear progress interval
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Refresh user data in store
      await refreshUser()

      // Reset state
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)

      // Success callbacks
      toast.success("Profile image updated successfully!")
      if (onUploadSuccess) onUploadSuccess(avatarUrl)

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      toast.error("Upload failed", { description: errorMessage })
      if (onUploadError) onUploadError(errorMessage)
      
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // File input handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-purple-400 hover:bg-purple-50/5
          ${isDragging ? 'border-purple-400 bg-purple-50/10' : 'border-zinc-700'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          // Preview State
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-400"
              />
              {!isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSelection()
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <div className="text-sm text-gray-300">
              {selectedFile?.name}
              <div className="text-xs text-gray-500">
                {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        ) : (
          // Upload State
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">
                Drop an image here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                JPEG or PNG, max 2MB
              </p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && showProgress && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
            <div className="text-sm text-white mb-2">Uploading...</div>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-1">{uploadProgress}%</div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Button
            onClick={clearSelection}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        Your profile image will be visible to other users and displayed in events you attend.
      </div>
    </div>
  )
} 