"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/ui/button"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { EventSongsList } from "@/features/events/components/event-songs-list"
import { EventCodeValidator } from "@/features/events/components/event-code-validator"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

// Import the mock events data to ensure consistency
import { EVENTS } from "@/shared/utils/mock-data"

export default function EventSongsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCodeValidated, setIsCodeValidated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Get user from cookies
  useEffect(() => {
    const cookieUser = getUserFromCookies()
    setUser(cookieUser)

    // Check if event code has been validated
    if (cookieUser) {
      const eventId = Array.isArray(id) ? id[0] : id
      const validatedKey = `event_code_validated_${eventId}`
      const isValidated = localStorage.getItem(validatedKey) === "true"
      setIsCodeValidated(isValidated)
    }
  }, [id])

  // Find the event by ID
  useEffect(() => {
    console.log(`[EventSongsPage] Looking for event with ID: ${id}`)

    // First check if we have the event in our mock data
    const eventId = Array.isArray(id) ? id[0] : id
    const foundEvent = EVENTS.find((e) => e.id === eventId)

    if (foundEvent) {
      console.log(`[EventSongsPage] Found event in mock data: ${foundEvent.name}`)
      setEvent(foundEvent)
    } else {
      console.log(`[EventSongsPage] Event not found in mock data: ${eventId}`)
      // If not found in mock data, try to fetch from API (for future implementation)
    }

    setIsLoading(false)
  }, [id])

  // Handle code validation
  const handleCodeValidated = () => {
    setIsCodeValidated(true)

    // Store validation status in localStorage
    const eventId = Array.isArray(id) ? id[0] : id
    const validatedKey = `event_code_validated_${eventId}`
    localStorage.setItem(validatedKey, "true")
  }

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (!event) {
    console.log(`[EventSongsPage] Redirecting to not-found for event ID: ${id}`)
    router.push("/events/not-found")
    return null
  }

  const eventIdString = Array.isArray(id) ? id[0] : id

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath={`/events/${eventIdString}/songs`} user={user} />

      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/events/${eventIdString}`}
          className="inline-flex items-center text-zinc-400 hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name} - Song Requests</h1>
        <p className="text-zinc-400 mb-8">
          Bid on songs you want to hear at this event. The highest-ranked songs are most likely to be played.
        </p>

        {user ? (
          isCodeValidated ? (
            // User is logged in and has validated event code
            <EventSongsList eventId={eventIdString} searchQuery={searchQuery} user={user} isCodeValidated={true} />
          ) : (
            // User is logged in but needs to validate event code
            <div className="max-w-md mx-auto">
              <p className="text-center mb-6">Please enter an event code to access song requests</p>
              <EventCodeValidator eventId={eventIdString} onValidated={handleCodeValidated} />
            </div>
          )
        ) : (
          // User is not logged in
          <div className="max-w-md mx-auto text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Please sign in to request songs</h2>
            <p className="text-zinc-400 mb-6">
              You need to be signed in to request songs and place bids at this event.
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                window.location.href = `/login?redirectTo=${encodeURIComponent(`/events/${eventIdString}/songs`)}`
              }}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
