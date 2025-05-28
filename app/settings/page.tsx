"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Textarea } from "@/ui/textarea"
import { Switch } from "@/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, isLoading, updateUserProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    notificationEmail: true,
    notificationPush: true,
    theme: "dark",
    language: "en",
    privacyProfilePublic: true,
    privacyShowActivity: true,
  })

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        website: user.website || "",
      })
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirectTo=/settings")
    }
  }, [user, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSettingChange = (name: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // In a real app, you would upload the image to a storage service
      // and get back a URL to save in the user profile

      // For demo purposes, we'll just update the profile data
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
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // In a real app, you would save the settings to the database

      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Settings updated",
          description: "Your settings have been updated successfully.",
        })
        setIsSaving(false)
      }, 1000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Get initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
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
                      placeholder="Your email address"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>

                  <Button type="button" onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
                <CardDescription>Upload a profile picture to personalize your account.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profileImagePreview || user.avatar_url || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="w-full">
                  <Label htmlFor="profile-image" className="mb-2 block">
                    Upload new image
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("profile-image")?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recommended: Square image, at least 400x400 pixels.
                  </p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving || !profileImage} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and account security settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Password</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Change your password to keep your account secure.
                    </p>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-2 text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-2 text-lg font-medium">Connected Accounts</h3>
                    <p className="mb-4 text-sm text-muted-foreground">Connect your social accounts for easier login.</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Connect GitHub
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                        Connect Twitter
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                        Connect Facebook
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>Manage your account settings and data.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Account Type</h3>
                    <p className="text-sm">
                      Current role: <span className="font-medium capitalize">{user.role}</span>
                    </p>
                    {user.role === "attendee" && (
                      <div className="mt-4">
                        <Button variant="outline">Upgrade to DJ Account</Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-2 text-lg font-medium">Data & Privacy</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Download My Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Privacy Settings
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-2 text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your experience on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notification-email" className="text-base">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your account activity.
                        </p>
                      </div>
                      <Switch
                        id="notification-email"
                        checked={settings.notificationEmail}
                        onCheckedChange={(checked) => handleSettingChange("notificationEmail", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notification-push" className="text-base">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications for important updates.
                        </p>
                      </div>
                      <Switch
                        id="notification-push"
                        checked={settings.notificationPush}
                        onCheckedChange={(checked) => handleSettingChange("notificationPush", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Appearance</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`cursor-pointer rounded-lg border p-4 ${
                          settings.theme === "dark" ? "border-primary bg-secondary" : "border-muted"
                        }`}
                        onClick={() => handleSettingChange("theme", "dark")}
                      >
                        <div className="mb-2 h-16 rounded bg-black"></div>
                        <p className="font-medium">Dark Theme</p>
                      </div>

                      <div
                        className={`cursor-pointer rounded-lg border p-4 ${
                          settings.theme === "light" ? "border-primary bg-secondary" : "border-muted"
                        }`}
                        onClick={() => handleSettingChange("theme", "light")}
                      >
                        <div className="mb-2 h-16 rounded bg-white"></div>
                        <p className="font-medium">Light Theme</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="privacy-profile" className="text-base">
                          Public Profile
                        </Label>
                        <p className="text-sm text-muted-foreground">Allow others to view your profile information.</p>
                      </div>
                      <Switch
                        id="privacy-profile"
                        checked={settings.privacyProfilePublic}
                        onCheckedChange={(checked) => handleSettingChange("privacyProfilePublic", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="privacy-activity" className="text-base">
                          Activity Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">Show your activity to other users.</p>
                      </div>
                      <Switch
                        id="privacy-activity"
                        checked={settings.privacyShowActivity}
                        onCheckedChange={(checked) => handleSettingChange("privacyShowActivity", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
