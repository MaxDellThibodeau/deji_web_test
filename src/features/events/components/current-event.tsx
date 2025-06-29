"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Calendar, MapPin, Clock, Music, Users } from "lucide-react"
import { SongQueue } from "@/features/songs/components/song-queue"

interface CurrentEventProps {
  event: any | null
}

export function CurrentEvent({ event }: CurrentEventProps) {
  if (!event) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>No Active Event</CardTitle>
          <CardDescription>There are no active events at the moment</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">Check back later or browse upcoming events.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          <span>Current Event</span>
        </CardTitle>
        <CardDescription>{event.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center text-zinc-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center text-zinc-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>{new Date(event.event_date).toLocaleString()}</span>
            </div>
            <div className="flex items-center text-zinc-400">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.attendees || 0} Attendees</span>
            </div>
            <div className="flex items-center text-zinc-400">
              <Music className="h-4 w-4 mr-2" />
              <span>{event.dj_name || "DJ TBA"}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Event Description</h3>
            <p className="text-sm text-zinc-400">{event.description || "No description available."}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Current Song Queue</h3>
          <SongQueue eventId={event.id} />
        </div>
      </CardContent>
    </Card>
  )
}
