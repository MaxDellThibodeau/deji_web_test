"use client"

import { useState, useEffect, useCallback } from "react"
import { websocketService, type WebSocketMessage } from "@/shared/services/websocket-service"

interface UseWebSocketOptions {
  eventId?: string
  userId?: string
  onMessage?: (data: any) => void
  onGlobalMessage?: (message: WebSocketMessage) => void
  autoConnect?: boolean
  enableWebSockets?: boolean
}

export function useWebSocket({
  eventId,
  userId,
  onMessage,
  onGlobalMessage,
  autoConnect = true,
  enableWebSockets = true,
}: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  // Enable or disable WebSockets
  useEffect(() => {
    websocketService.setEnabled(enableWebSockets)
    setIsAvailable(websocketService.isAvailable())
  }, [enableWebSockets])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (websocketService.isAvailable()) {
      websocketService.connect(userId)
    }
  }, [userId])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect()
  }, [])

  // Send a message
  const sendMessage = useCallback((message: WebSocketMessage) => {
    websocketService.sendMessage(message)
  }, [])

  // Effect to handle connection and event subscription
  useEffect(() => {
    // Set up global listener for connection status
    const unsubscribeGlobal = websocketService.subscribeToAll((message) => {
      // Check for connection status messages
      if (message.type === "connection_status") {
        setIsConnected(message.data.connected)
      } else if (message.type === "auth_success") {
        setIsConnected(true)
      }

      // Update last message
      setLastMessage(message)

      // Call onGlobalMessage if provided
      if (onGlobalMessage) {
        onGlobalMessage(message)
      }
    })

    // Update initial connection status
    setIsConnected(websocketService.isConnected())
    setIsAvailable(websocketService.isAvailable())

    // Connect if autoConnect is true and WebSockets are available
    if (autoConnect && websocketService.isAvailable()) {
      connect()
    }

    // Clean up on unmount
    return () => {
      unsubscribeGlobal()
    }
  }, [connect, autoConnect, onGlobalMessage])

  // Effect to handle event subscription
  useEffect(() => {
    if (!eventId) return

    // Subscribe to event updates
    const unsubscribe = websocketService.subscribeToEvent(eventId, (data) => {
      // Call onMessage if provided
      if (onMessage) {
        onMessage(data)
      }
    })

    // Clean up on unmount or when eventId changes
    return () => {
      unsubscribe()
    }
  }, [eventId, onMessage])

  // Effect to handle user subscription
  useEffect(() => {
    if (!userId) return

    // Subscribe to user updates
    const unsubscribe = websocketService.subscribeToUser(userId, (data) => {
      // Call onMessage if provided
      if (onMessage) {
        onMessage(data)
      }
    })

    // Clean up on unmount or when userId changes
    return () => {
      unsubscribe()
    }
  }, [userId, onMessage])

  return {
    isConnected,
    isAvailable,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  }
}
