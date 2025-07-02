import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useWebSocket from '@/shared/hooks/use-websocket'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useEventsStore } from '../stores/events.store'

const { VITE_SOCKET_BASEURL } = import.meta.env

interface EventsProviderProps {
  children: React.ReactNode
}

export default function EventsProvider({ children }: EventsProviderProps) {
  const { eventId } = useParams<{ eventId: string }>()
  const { user } = useAuthStore()
  const {
    onEventMessageReceived,
    joinEvent,
    leaveEvent,
    updateEventData,
    updateSongLeaderboard,
  } = useEventsStore()

  const { sendMessage, isConnected } = useWebSocket({
    url: `ws://${VITE_SOCKET_BASEURL || 'localhost:3001'}/events`,
    key: 'events',
    disconnectOnUnmount: false,
    onOpen: ({ send }) => {
      console.log('🎉 Events WebSocket connected')
      
      // Join event room if we have an eventId
      if (eventId && user) {
        send({
          type: 'joinEvent',
          eventId: parseInt(eventId),
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        })
        
        // Update store with current event
        joinEvent(parseInt(eventId), user)
      }

      // Send heartbeat to maintain connection
      const heartbeat = setInterval(() => {
        if (isConnected) {
          send({ type: 'ping' }, { skipLog: true })
        }
      }, 30000)

      // Cleanup heartbeat on disconnect
      return () => clearInterval(heartbeat)
    },
    onMessageReceived: (message) => {
      console.log('📨 Event WebSocket message:', message)
      
      switch (message.type) {
        case 'eventUpdate':
          updateEventData(message.eventId, message.data)
          break
          
        case 'songLeaderboardUpdate':
          updateSongLeaderboard(message.eventId, message.songs)
          break
          
        case 'bidPlaced':
          // Handle bid placement updates
          if (message.eventId === parseInt(eventId || '0')) {
            updateSongLeaderboard(message.eventId, message.leaderboard)
          }
          break
          
        case 'userJoined':
          console.log(`👤 User joined event: ${message.user.name}`)
          break
          
        case 'userLeft':
          console.log(`👤 User left event: ${message.user.name}`)
          break
          
        case 'eventStarted':
          console.log(`🎵 Event started: ${message.eventId}`)
          updateEventData(message.eventId, { status: 'live' })
          break
          
        case 'eventEnded':
          console.log(`🏁 Event ended: ${message.eventId}`)
          updateEventData(message.eventId, { status: 'ended' })
          break
          
        default:
          // Pass to store's message handler for custom logic
          onEventMessageReceived(message)
      }
    },
    onClose: () => {
      console.log('🔌 Events WebSocket disconnected')
    },
    onError: (error) => {
      console.error('❌ Events WebSocket error:', error)
    },
  })

  // Handle navigation away from event
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventId && user) {
        sendMessage({
          type: 'leaveEvent',
          eventId: parseInt(eventId),
          user: {
            id: user.id,
            name: user.name,
          },
          reason: 'page_unload',
        })
      }
    }

    const handlePopState = () => {
      if (eventId && user) {
        sendMessage({
          type: 'leaveEvent',
          eventId: parseInt(eventId),
          user: {
            id: user.id,
            name: user.name,
          },
          reason: 'navigation',
        })
        
        // Update store
        leaveEvent(parseInt(eventId), user)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [eventId, user, sendMessage, leaveEvent])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventId && user) {
        leaveEvent(parseInt(eventId), user)
      }
    }
  }, [])

  return <>{children}</>
}

// Helper function to send event messages
export const useEventWebSocket = () => {
  const { sendMessage, isConnected } = useWebSocket({
    key: 'events',
    disconnectOnUnmount: false,
  })

  return {
    sendMessage,
    isConnected,
    // Specific event actions
    placeBid: (eventId: number, songId: number, bidAmount: number) => {
      sendMessage({
        type: 'placeBid',
        eventId,
        songId,
        bidAmount,
        timestamp: new Date().toISOString(),
      })
    },
    requestSong: (eventId: number, songTitle: string, artist: string) => {
      sendMessage({
        type: 'requestSong',
        eventId,
        song: { title: songTitle, artist },
        timestamp: new Date().toISOString(),
      })
    },
    sendChat: (eventId: number, message: string) => {
      sendMessage({
        type: 'chat',
        eventId,
        message,
        timestamp: new Date().toISOString(),
      })
    },
  }
} 