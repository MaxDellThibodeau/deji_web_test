"use client"

import type React from "react"

import { useState } from "react"
import { AppLayout } from "@/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Textarea } from "@/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { CalendarIcon, Clock, Upload, Sparkles, Save, RefreshCw } from "lucide-react"
import { Calendar } from "@/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { cn } from "@/shared/utils/utils"
import { format } from "date-fns"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/shared/hooks/use-toast"
import { generateEventDescription, uploadEventImage } from "@/shared/actions/ai-actions"

const EVENT_TYPES = [
  { value: "electronic", label: "Electronic" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "latin", label: "Latin" },
  { value: "jazz", label: "Jazz" },
  { value: "mixed", label: "Mixed" },
]

export default function CreateEventPage() {
  const { user, loading: userLoading } = useUser()
  const [eventName, setEventName] = useState("")
  const [eventType, setEventType] = useState("")
  const [venue, setVenue] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [description, setDescription] = useState("")
  const [capacity, setCapacity] = useState("")
  const [djName, setDjName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleGenerateDescription = async () => {
    if (!eventName || !eventType || !djName) {
      toast({
        title: "Missing Information",
        description: "Please provide event name, type, and DJ name to generate a description.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingDescription(true)
    try {
      const generatedDescription = await generateEventDescription(eventName, eventType, djName)
      setDescription(generatedDescription)
      toast({
        title: "Description Generated",
        description: "AI has created a description for your event.",
      })
    } catch (error) {
      console.error("Error generating description:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate description. Please try again or write your own.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Not Authorized",
        description: "You must be logged in as a DJ to create events.",
        variant: "destructive",
      })
      return
    }

    if (!eventName || !eventType || !venue || !date || !time || !description || !capacity || !djName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, we would upload the image and save the event to the database
      // For now, we'll just simulate a delay

      let imageUrl = null
      if (image) {
        // Upload image to Vercel Blob
        imageUrl = await uploadEventImage(image)
      }

      // Simulate saving to database
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      })

      // Reset form
      setEventName("")
      setEventType("")
      setVenue("")
      setDate(undefined)
      setTime("")
      setDescription("")
      setCapacity("")
      setDjName("")
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Provide the basic information about your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter event name"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Enter venue name"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700",
                              !date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription || !eventName || !eventType || !djName}
                        className="bg-zinc-800 border-zinc-700"
                      >
                        {isGeneratingDescription ? (
                          <>
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-3 w-3 text-purple-500" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your event"
                      className="min-h-[120px] bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="Maximum number of attendees"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dj-name">DJ Name</Label>
                      <Input
                        id="dj-name"
                        value={djName}
                        onChange={(e) => setDjName(e.target.value)}
                        placeholder="Enter DJ name"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Event Image</CardTitle>
                  <CardDescription>Upload an image for your event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-full h-48 bg-zinc-800 border border-dashed border-zinc-700 rounded-md flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="h-10 w-10 text-zinc-500 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">Upload event image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image" className="sr-only">
                        Choose image
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <p className="text-xs text-zinc-500">Recommended size: 1200x630 pixels. Max file size: 5MB.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="token-bidding">Enable Token Bidding</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:bg-purple-600">
                        <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform data-[state=checked]:translate-x-6"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="public-event">Public Event</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:bg-purple-600">
                        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-approval">Require Song Approval</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:bg-purple-600">
                        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
