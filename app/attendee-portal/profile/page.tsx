"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Music, MapPin, Calendar, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { Label } from "@/ui/label"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

// Mock user data for demonstration purposes
const mockUsers = [
  {
    email: "test@example.com",
    name: "Test User",
  },
  {
    email: "john.doe@example.com",
    name: "John Doe",
  },
]

// Mock function to find user by email
const findUserByEmail = (email) => {
  return mockUsers.find((user) => user.email === email)
}

export default function AttendeeProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
    favoriteGenres: "",
    phoneNumber: "",
    profileImage: "/diverse-group-city.png",
  })

  useEffect(() => {
    // Get user info from cookies
    const cookieUser = getUserFromCookies()

    if (cookieUser) {
      setUser(cookieUser)
      setFormData({
        name: cookieUser.name || "",
        email: cookieUser.email || "",
        location: "New York, NY",
        bio: "Music lover and frequent event-goer. Always looking for the next great beat!",
        favoriteGenres: "Deep House, Techno, Hip-Hop",
        phoneNumber: "+1 (555) 123-4567",
        profileImage: "/diverse-group-city.png",
      })
    }

    setIsLoading(false)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      // Show success message or redirect
      alert("Profile updated successfully!")
    }, 1000)
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <PublicHeader currentPath="/attendee-portal/profile" user={user} />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <div className="text-center py-12">
            <p className="text-xl text-zinc-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader currentPath="/attendee-portal/profile" user={user} />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700/50"
                        disabled
                      />
                      <p className="text-xs text-zinc-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="bg-zinc-800/50 border-zinc-700/50 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favoriteGenres">Favorite Music Genres</Label>
                    <Input
                      id="favoriteGenres"
                      name="favoriteGenres"
                      value={formData.favoriteGenres}
                      onChange={handleChange}
                      className="bg-zinc-800/50 border-zinc-700/50"
                      placeholder="e.g. House, Techno, Hip-Hop"
                    />
                    <p className="text-xs text-zinc-500">Separate genres with commas</p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-zinc-800/50 border-zinc-700/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                    >
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-purple-500/50">
                  <Image
                    src={formData.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700">Change Picture</Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Member Since</p>
                      <p className="font-medium">April 2025</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Account Type</p>
                      <p className="font-medium">Attendee</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Primary Location</p>
                      <p className="font-medium">{formData.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-900/50 hover:bg-red-900/20 hover:text-red-300"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
