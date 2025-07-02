"use client"

import { useEffect } from 'react'
import useWebSocketsStore, {
  WebSocketStoreSendMessageOptions,
} from '@/shared/stores/websockets.store'

interface UseWebSocketProps {
  url?: string
  key?: string
  onMessageReceived?: (message?: any, event?: MessageEvent) => any
  onOpen?: (event: Event, send: (data: any, options?: WebSocketStoreSendMessageOptions) => void) => any
  onClose?: (event: CloseEvent) => any
  onError?: (event: Event) => any
  disconnectOnUnmount?: boolean
  onUnMount?: () => any
  maxReconnectAttempts?: number
  reconnectInterval?: number
}

export interface UseWebSocketReturn {
  sendMessage: (data: any, options?: WebSocketStoreSendMessageOptions) => void
  isConnected: boolean
  lastDataSent: any
  lastDataReceived: any
  disconnect: () => void
  readyState: number
  reconnectAttempts: number
}

export default function useWebSocket({
  url,
  key = 'websocket',
  onMessageReceived = () => {},
  onOpen = () => {},
  onClose = () => {},
  onError = () => {},
  disconnectOnUnmount = true,
  onUnMount = () => {},
  maxReconnectAttempts = 5,
  reconnectInterval = 3000,
}: UseWebSocketProps): UseWebSocketReturn {
  const { getBySocketKey, connect } = useWebSocketsStore()
  const { 
    ws, 
    isConnected, 
    lastDataSent, 
    lastDataReceived,
    reconnectAttempts,
    send, 
    disconnect, 
    ...socketData 
  } = getBySocketKey(key)

  // Default URL construction
  if (!url) {
    const { VITE_SOCKET_BASEURL } = import.meta.env
    url = `ws://${VITE_SOCKET_BASEURL || 'localhost:3001'}/${key}`
  }

  useEffect(() => {
    if (!url) {
      console.warn(`⚠️ No WebSocket URL provided for key: ${key}`)
      return
    }

    connect({
      url,
      key,
      onOpen,
      onMessageReceived,
      onClose,
      onError,
      maxReconnectAttempts,
      reconnectInterval,
    })

    return () => {
      if (disconnectOnUnmount) {
        disconnect()
      }
      onUnMount?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key, disconnectOnUnmount])

  return {
    sendMessage: send,
    isConnected,
    lastDataSent,
    lastDataReceived,
    disconnect,
    readyState: ws?.readyState || WebSocket.CLOSED,
    reconnectAttempts,
    ...socketData,
  }
}

export { useWebSocket }
