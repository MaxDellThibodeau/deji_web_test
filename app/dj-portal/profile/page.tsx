"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Card, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Textarea } from "@/ui/textarea"
import { User, Mail, Phone, Globe, Music, DollarSign, ImageIcon, LinkIcon } from "lucide-react"

export default function DJProfilePage() {
  const { user, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)

  // Mock profile data
  const [profile, setProfile] = useState({
    // Basic info
    name: "DJ Pulse",
    email: "pulse@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Electronic music producer and DJ with over 10 years of experience playing at clubs and festivals worldwide. Specializing in deep house, techno, and progressive house.",
    location: "Los Angeles, CA",
    website: "djpulse.com",

    // Professional info
    genres: ["Deep House", "Techno", "Progressive"],
    experience: "10+ years",
    hourlyRate: 200,
    bookingFee: 500,
    equipment: "Pioneer CDJ-3000, DJM-900NXS2, Custom lighting rig",

    // Social media
    instagram: "djpulse",
    soundcloud: "djpulse",
    spotify: "djpulse",
    facebook: "djpulseofficial",
    twitter: "djpulse",

    // Media
    profileImage: "/placeholder.svg?key=1bcxs",
    coverImage: "/vibrant-dj-set.png",
    audioSamples: [
      { title: "Summer Mix 2023", url: "#", duration: "58:24" },
      { title: "Club Essentials Vol. 2", url: "#", duration: "1:12:45" },
    ],
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
    alert("Profile updated successfully!")
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">Edit DJ Profile</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="social">Social & Links</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">DJ Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.name}
                      onChange={(e) => handleInputChange("basic", "name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.email}
                      onChange={(e) => handleInputChange("basic", "email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.phone}
                      onChange={(e) => handleInputChange("basic", "phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    className="border-gray-800 bg-black"
                    value={profile.location}
                    onChange={(e) => handleInputChange("basic", "location", e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="website"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.website}
                      onChange={(e) => handleInputChange("basic", "website", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="min-h-32 border-gray-800 bg-black"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("basic", "bio", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="genres">Music Genres</Label>
                  <div className="relative">
                    <Music className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="genres"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.genres.join(", ")}
                      onChange={(e) => handleInputChange("professional", "genres", e.target.value.split(", "))}
                      placeholder="e.g. House, Techno, EDM (comma separated)"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    className="border-gray-800 bg-black"
                    value={profile.experience}
                    onChange={(e) => handleInputChange("professional", "experience", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-3">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        className="border-gray-800 bg-black pl-10"
                        value={profile.hourlyRate}
                        onChange={(e) =>
                          handleInputChange("professional", "hourlyRate", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="bookingFee">Booking Fee ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="bookingFee"
                        type="number"
                        className="border-gray-800 bg-black pl-10"
                        value={profile.bookingFee}
                        onChange={(e) =>
                          handleInputChange("professional", "bookingFee", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Textarea
                    id="equipment"
                    className="min-h-32 border-gray-800 bg-black"
                    value={profile.equipment}
                    onChange={(e) => handleInputChange("professional", "equipment", e.target.value)}
                    placeholder="List the equipment you typically use or require"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="grid gap-8">
                <div>
                  <Label className="mb-3 block">Profile Image</Label>
                  <div className="flex flex-col items-center gap-4 md:flex-row">
                    <div className="h-40 w-40 overflow-hidden rounded-full">
                      <ImageIcon
                        src={profile.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Button className="mb-2 w-full">Upload New Image</Button>
                      <p className="text-sm text-gray-400">Recommended size: 500x500px. Max file size: 5MB.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Cover Image</Label>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="h-40 w-full overflow-hidden rounded-lg md:w-64">
                      <ImageIcon
                        src={profile.coverImage || "/placeholder.svg"}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Button className="mb-2 w-full">Upload New Cover</Button>
                      <p className="text-sm text-gray-400">Recommended size: 1600x900px. Max file size: 10MB.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Label>Audio Samples</Label>
                    <Button size="sm" variant="outline">
                      Add Sample
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {profile.audioSamples.map((sample, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-800 bg-black p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/50">
                            <Music className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium">{sample.title}</p>
                            <p className="text-sm text-gray-400">{sample.duration}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="instagram"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.instagram}
                      onChange={(e) => handleInputChange("social", "instagram", e.target.value)}
                      placeholder="Username only"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="soundcloud">SoundCloud</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="soundcloud"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.soundcloud}
                      onChange={(e) => handleInputChange("social", "soundcloud", e.target.value)}
                      placeholder="Username only"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="spotify">Spotify</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="spotify"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.spotify}
                      onChange={(e) => handleInputChange("social", "spotify", e.target.value)}
                      placeholder="Username or artist ID"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="facebook"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.facebook}
                      onChange={(e) => handleInputChange("social", "facebook", e.target.value)}
                      placeholder="Username or page name"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="twitter">Twitter</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="twitter"
                      className="border-gray-800 bg-black pl-10"
                      value={profile.twitter}
                      onChange={(e) => handleInputChange("social", "twitter", e.target.value)}
                      placeholder="Username without @"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-32">
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
