"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { useAuth } from "@/features/auth/hooks/auth-context"
import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { ProfileImageUploader } from "@/shared/components/common/profile-image-uploader"
import { toast } from "@/hooks/use-toast"
import { UserCircle, Mail, Phone, MapPin, Calendar, Music, Settings, Save, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, updateUserProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
  })

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!isLoading && !user) {
      router.push("/login?redirectTo=/profile")
    } else if (!isLoading && user) {
      // Initialize form data with user data
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        website: user.website || "",
      })
    }
  }, [user, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!user) return

      const result = await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
      })

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // If no user and not loading, the useEffect will redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/profile" user={user} />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full mb-4">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-purple-900/30 text-purple-300">
                          <UserCircle className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{user.name || "User"}</h2>
                    <p className="text-zinc-400">{user.role || "Attendee"}</p>

                    <div className="w-full mt-6 space-y-4">
                      <div className="flex items-center text-zinc-300">
                        <Mail className="h-4 w-4 mr-2 text-purple-400" />
                        <span>{user.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center text-zinc-300">
                        <Phone className="h-4 w-4 mr-2 text-purple-400" />
                        <span>{user.phone || "No phone provided"}</span>
                      </div>
                      <div className="flex items-center text-zinc-300">
                        <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                        <span>{user.location || "No location provided"}</span>
                      </div>
                      <div className="flex items-center text-zinc-300">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        <span>Member since {new Date(user.created_at || Date.now()).getFullYear()}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Music Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Music className="h-4 w-4 mr-2 text-purple-400" />
                        <span>Electronic</span>
                      </div>
                      <span className="text-sm text-purple-400">Primary</span>
                    </div>
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-purple-400" />
                      <span>House</span>
                    </div>
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-purple-400" />
                      <span>Techno</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4 border-zinc-700 bg-zinc-800/50">
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <Card className="bg-zinc-900 border-zinc-800">
                <Tabs defaultValue="profile">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="profile" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-zinc-800 border-zinc-700"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="activity" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="bg-zinc-800 p-4 rounded-md">
                        <p className="font-medium">You placed a bid on "Blinding Lights"</p>
                        <p className="text-sm text-zinc-400">Summer Beats Festival • 2 days ago</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-md">
                        <p className="font-medium">You purchased tickets for "Neon Nights"</p>
                        <p className="text-sm text-zinc-400">3 days ago</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-md">
                        <p className="font-medium">You updated your music preferences</p>
                        <p className="text-sm text-zinc-400">1 week ago</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <ProfileImageUploader />

                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader>
                          <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button variant="outline" className="w-full" onClick={() => router.push("/settings")}>
                              Manage Account Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
