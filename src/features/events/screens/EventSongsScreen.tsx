import { useParams } from 'react-router-dom'
import { EventSongsList } from '@/features/events/components/event-songs-list'

export function EventSongsScreen() {
  const { eventId } = useParams<{ eventId: string }>()

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Event Not Found</h1>
          <p className="text-gray-400 mt-2">Invalid event ID</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Event Song Requests</h1>
        <p className="text-gray-400">Search and bid on songs for this event</p>
      </div>
      <EventSongsList eventId={eventId} showAll={true} />
    </div>
  )
} 