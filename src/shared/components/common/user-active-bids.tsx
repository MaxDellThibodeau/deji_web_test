
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Music, Calendar, MapPin, ArrowUpRight } from "lucide-react"

interface UserActiveBidsProps {
  userId: string
}

export function UserActiveBids({ userId }: UserActiveBidsProps) {
  const navigate = useNavigate()
  const [activeBids, setActiveBids] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveBids() {
      if (!userId) return

      try {
        const { getUserActiveBids } = await import("@/features/payments/actions/token-actions")
        const bids = await getUserActiveBids(userId)
        setActiveBids(bids)

        console.log(`[DATA RETRIEVED] Loaded ${bids.length} active bids for user ${userId}`)
        console.log(`[USER DATA PERSISTENCE] User's bids are preserved across sessions`)
      } catch (error) {
        console.error("Error fetching active bids:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveBids()
  }, [userId])

  // Group bids by event
  const bidsByEvent = activeBids.reduce((acc: any, bid: any) => {
    const eventId = bid.song_request.event.id
    if (!acc[eventId]) {
      acc[eventId] = {
        event: bid.song_request.event,
        bids: [],
      }
    }
    acc[eventId].bids.push(bid)
    return acc
  }, {})

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-500" />
            <span>Your Active Song Bids</span>
          </CardTitle>
          <CardDescription>Songs you've bid on across upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-800/50 rounded-lg p-4">
                <Skeleton className="h-6 w-48 bg-zinc-700/50 mb-2" />
                <Skeleton className="h-4 w-32 bg-zinc-700/50 mb-4" />
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-40 bg-zinc-700/50" />
                      <Skeleton className="h-4 w-16 bg-zinc-700/50" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activeBids.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-500" />
            <span>Your Active Song Bids</span>
          </CardTitle>
          <CardDescription>Songs you've bid on across upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-4">You haven't placed any song bids yet.</p>
            <Button
              onClick={() => navigate("/events")}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              Browse Events
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-500" />
          <span>Your Active Song Bids</span>
        </CardTitle>
        <CardDescription>Songs you've bid on across upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.values(bidsByEvent).map((eventData: any) => (
            <div key={eventData.event.id} className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white">{eventData.event.title}</h3>
                  <div className="flex items-center text-xs text-zinc-400 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="mr-3">{format(new Date(eventData.event.event_date), "MMM d, yyyy")}</span>
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{eventData.event.venue}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-0 h-8 w-8"
                  onClick={() => handleViewEvent(eventData.event.id)}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {eventData.bids.map((bid: any) => (
                  <div key={bid.id} className="flex justify-between items-center bg-zinc-700/30 rounded p-2">
                    <div>
                      <p className="text-sm font-medium">{bid.song_request.title}</p>
                      <p className="text-xs text-zinc-400">{bid.song_request.artist}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                        {bid.tokens} tokens
                      </div>
                      <div className="ml-2 bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                        {bid.song_request.tokens} total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
