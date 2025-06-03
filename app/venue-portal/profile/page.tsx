"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, ArrowLeft, Upload, MapPin, Phone, Mail, Globe, Users, Calendar, Star, Loader2 } from "lucide-react"
import { RoleDashboardLayout } from "@/src/shared/components/layout/role-dashboard-layout"
import { toast } from "@/hooks/use-toast"

export default function VenueProfilePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Mock venue profile data
  const [profile, setProfile] = useState({
    // Basic info
    name: "Skyline Venue",
    email: "info@skylinevenue.com",
    phone: "+1 (555) 123-4567",
    address: "123 Music Street, New York, NY 10001",
    website: "skylinevenue.com",
    description:
      "Premier entertainment venue in the heart of New York City. Featuring state-of-the-art sound and lighting systems, perfect for electronic music events and live performances.",

    // Venue details
    capacity: 500,
    established: 2015,
    venueType: "Nightclub",
    amenities: ["Full Bar", "VIP Section", "Coat Check", "Security", "Parking"],

    // Technical specs
    soundSystem: "Pioneer Pro Audio, L-Acoustics K2",
    lightingSystem: "Martin Professional, Chauvet Professional",
    stage: "20ft x 15ft main stage with DJ booth",

    // Business info
    operatingHours: "Thursday - Saturday: 9 PM - 4 AM",
    pricing: "$15-25 cover charge, varies by event",
    bookingEmail: "bookings@skylinevenue.com",

    // Media
    profileImage: "/vibrant-nightclub.png",
    galleryImages: ["/vibrant-nightclub.png", "/energetic-dj-setup.png", "/vibrant-dj-set.png"],
  })

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile Updated",
        description: "Your venue profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RoleDashboardLayout title="Edit Venue Profile" role="venue">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Venue Profile</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={profile.profileImage || "/placeholder.svg"}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3">{profile.address}</p>
                  <div className="flex items-center justify-center text-yellow-400 text-sm mb-4">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>4.7 (86 reviews)</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Capacity</span>
                      <span>{profile.capacity} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Established</span>
                      <span>{profile.established}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Type</span>
                      <span>{profile.venueType}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-zinc-800">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Venue Details</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Venue Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venueType">Venue Type</Label>
                        <Input
                          id="venueType"
                          value={profile.venueType}
                          onChange={(e) => handleInputChange("venueType", e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="pl-10 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="pl-10 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="pl-10 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                          id="website"
                          value={profile.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          className="pl-10 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={profile.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-[120px] bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Venue Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="capacity"
                            type="number"
                            value={profile.capacity}
                            onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value))}
                            className="pl-10 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="established">Established</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="established"
                            type="number"
                            value={profile.established}
                            onChange={(e) => handleInputChange("established", Number.parseInt(e.target.value))}
                            className="pl-10 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingHours">Operating Hours</Label>
                      <Input
                        id="operatingHours"
                        value={profile.operatingHours}
                        onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricing">Pricing Information</Label>
                      <Input
                        id="pricing"
                        value={profile.pricing}
                        onChange={(e) => handleInputChange("pricing", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bookingEmail">Booking Email</Label>
                      <Input
                        id="bookingEmail"
                        type="email"
                        value={profile.bookingEmail}
                        onChange={(e) => handleInputChange("bookingEmail", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amenities">Amenities (comma separated)</Label>
                      <Input
                        id="amenities"
                        value={profile.amenities.join(", ")}
                        onChange={(e) => handleInputChange("amenities", e.target.value.split(", "))}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="e.g. Full Bar, VIP Section, Coat Check"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="soundSystem">Sound System</Label>
                      <Textarea
                        id="soundSystem"
                        value={profile.soundSystem}
                        onChange={(e) => handleInputChange("soundSystem", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Describe your sound system setup"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lightingSystem">Lighting System</Label>
                      <Textarea
                        id="lightingSystem"
                        value={profile.lightingSystem}
                        onChange={(e) => handleInputChange("lightingSystem", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Describe your lighting setup"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stage">Stage & DJ Booth</Label>
                      <Textarea
                        id="stage"
                        value={profile.stage}
                        onChange={(e) => handleInputChange("stage", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Describe your stage and DJ booth setup"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Media & Gallery</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Profile Image</Label>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden">
                          <Image
                            src={profile.profileImage || "/placeholder.svg"}
                            alt="Profile"
                            width={256}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Button className="w-full mb-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New Image
                          </Button>
                          <p className="text-sm text-zinc-400">Recommended size: 1200x800px. Max file size: 10MB.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Gallery Images</Label>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Add Images
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {profile.galleryImages.map((image, index) => (
                          <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Gallery ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button size="sm" variant="destructive" className="absolute top-2 right-2 h-6 w-6 p-0">
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  )
}
