
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { getUserActiveBids } from "@/features/payments/actions/token-actions"
import { formatDistanceToNow } from "date-fns"
import { Music, Calendar, MapPin } from "lucide-react"

interface UserBidsListProps {
  userId: string
}

export function UserBidsList({ userId }: UserBidsListProps) {
  const [bids, setBids] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBids() {
      try {
        const userBids = await getUserActiveBids(userId)
        setBids(userBids)

        // Log for debugging
        console.log(`[USER DATA] Loaded all bids for user ${userId}:`, userBids)
      } catch (error) {
        console.error("Error fetching user bids:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBids()
  }, [userId])

  if (isLoading) {
    return <div className="text-center py-10">Loading your bids...</div>
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-900 rounded-lg">
        <Music className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
        <h3 className="text-xl font-medium">No song bids yet</h3>
        <p className="text-zinc-400 mt-1">You haven't bid on any songs yet.</p>
        <Link to="/events">
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Browse Events</Button>
        </Link>
      </div>
    )
  }

  // Group bids by event
  const bidsByEvent: Record<string, any[]> = {}

  bids.forEach((bid) => {
    const eventId = bid.song_request.event.id
    if (!bidsByEvent[eventId]) {
      bidsByEvent[eventId] = []
    }
    bidsByEvent[eventId].push(bid)
  })

  return (
    <div className="space-y-8">
      {Object.entries(bidsByEvent).map(([eventId, eventBids]) => (
        <div key={eventId} className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <Link to={`/events/${eventId}`}>
              <h2 className="text-xl font-bold hover:text-purple-400 transition-colors">
                {eventBids[0].song_request.event.title}
              </h2>
            </Link>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-purple-400" />
                <span>
                  {new Date(eventBids[0].song_request.event.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-purple-400" />
                <span>{eventBids[0].song_request.event.venue}</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {eventBids.map((bid) => (
              <div key={bid.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{bid.song_request.title}</h3>
                    <p className="text-sm text-zinc-400">{bid.song_request.artist}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Bid placed {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded text-sm">{bid.tokens} tokens</div>
                </div>
                <div className="mt-2 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Total song bids: {bid.song_request.tokens} tokens</span>
                    <Link to={`/events/${eventId}/songs`}>
                      <span className="text-purple-400 hover:text-purple-300">View all bids</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
