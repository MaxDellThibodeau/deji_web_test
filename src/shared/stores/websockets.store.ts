import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface WebSocketStoreSendMessageOptions {
  skipLog?: boolean
  priority?: 'high' | 'normal' | 'low'
}

interface WebSocketConnection {
  ws: WebSocket | null
  isConnected: boolean
  lastDataSent: any
  lastDataReceived: any
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectInterval: number
  url: string
  onOpen?: (event: Event, send: (data: any, options?: WebSocketStoreSendMessageOptions) => void) => void
  onMessageReceived?: (message: any, event: MessageEvent) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

interface WebSocketsState {
  connections: Record<string, WebSocketConnection>
  globalReconnect: boolean
  
  // Actions
  connect: (params: {
    url: string
    key: string
    onOpen?: (event: Event, send: (data: any, options?: WebSocketStoreSendMessageOptions) => void) => void
    onMessageReceived?: (message: any, event: MessageEvent) => void
    onClose?: (event: CloseEvent) => void
    onError?: (event: Event) => void
    maxReconnectAttempts?: number
    reconnectInterval?: number
  }) => void
  disconnect: (key: string) => void
  disconnectAll: () => void
  send: (key: string, data: any, options?: WebSocketStoreSendMessageOptions) => void
  getBySocketKey: (key: string) => WebSocketConnection & {
    send: (data: any, options?: WebSocketStoreSendMessageOptions) => void
    disconnect: () => void
  }
  setGlobalReconnect: (enabled: boolean) => void
}

const createDefaultConnection = (): WebSocketConnection => ({
  ws: null,
  isConnected: false,
  lastDataSent: null,
  lastDataReceived: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,
  url: '',
})

export const useWebSocketsStore = create<WebSocketsState>()(
  subscribeWithSelector((set, get) => ({
    connections: {},
    globalReconnect: true,

    connect: ({
      url,
      key,
      onOpen,
      onMessageReceived,
      onClose,
      onError,
      maxReconnectAttempts = 5,
      reconnectInterval = 3000,
    }) => {
      const state = get()
      
      // Close existing connection if any
      if (state.connections[key]?.ws) {
        state.connections[key].ws!.close()
      }

      const connectWebSocket = () => {
        try {
          const ws = new WebSocket(url)
          
          // Update connection state
          set((state) => ({
            connections: {
              ...state.connections,
              [key]: {
                ...state.connections[key],
                ws,
                url,
                onOpen,
                onMessageReceived,
                onClose,
                onError,
                maxReconnectAttempts,
                reconnectInterval,
                isConnected: false,
              },
            },
          }))

          const connection = get().connections[key]

          ws.onopen = (event) => {
            console.log(`🔌 WebSocket connected: ${key}`)
            set((state) => ({
              connections: {
                ...state.connections,
                [key]: {
                  ...state.connections[key],
                  isConnected: true,
                  reconnectAttempts: 0,
                },
              },
            }))

            // Create send function for onOpen callback
            const send = (data: any, options?: WebSocketStoreSendMessageOptions) => {
              get().send(key, data, options)
            }

            onOpen?.(event, send)
          }

          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data)
              
              set((state) => ({
                connections: {
                  ...state.connections,
                  [key]: {
                    ...state.connections[key],
                    lastDataReceived: message,
                  },
                },
              }))

              if (!onMessageReceived) {
                console.log(`📨 WebSocket message received (${key}):`, message)
              } else {
                onMessageReceived(message, event)
              }
            } catch (error) {
              console.error(`❌ Failed to parse WebSocket message (${key}):`, error)
              onMessageReceived?.(event.data, event)
            }
          }

          ws.onclose = (event) => {
            console.log(`🔌 WebSocket disconnected: ${key}`, event.code, event.reason)
            
            set((state) => ({
              connections: {
                ...state.connections,
                [key]: {
                  ...state.connections[key],
                  isConnected: false,
                  ws: null,
                },
              },
            }))

            onClose?.(event)

            // Auto-reconnect logic
            const currentConnection = get().connections[key]
            if (
              get().globalReconnect &&
              currentConnection &&
              currentConnection.reconnectAttempts < currentConnection.maxReconnectAttempts &&
              event.code !== 1000 // Don't reconnect on normal closure
            ) {
              const attempts = currentConnection.reconnectAttempts + 1
              console.log(`🔄 Attempting to reconnect WebSocket (${key}) - Attempt ${attempts}/${currentConnection.maxReconnectAttempts}`)
              
              set((state) => ({
                connections: {
                  ...state.connections,
                  [key]: {
                    ...state.connections[key],
                    reconnectAttempts: attempts,
                  },
                },
              }))

              setTimeout(() => {
                if (get().connections[key]) {
                  connectWebSocket()
                }
              }, currentConnection.reconnectInterval)
            }
          }

          ws.onerror = (event) => {
            console.error(`❌ WebSocket error (${key}):`, event)
            onError?.(event)
          }

        } catch (error) {
          console.error(`❌ Failed to create WebSocket connection (${key}):`, error)
        }
      }

      // Initialize connection object
      set((state) => ({
        connections: {
          ...state.connections,
          [key]: createDefaultConnection(),
        },
      }))

      connectWebSocket()
    },

    disconnect: (key) => {
      const connection = get().connections[key]
      if (connection?.ws) {
        console.log(`🔌 Manually disconnecting WebSocket: ${key}`)
        connection.ws.close(1000, 'Manual disconnect')
      }
      
      set((state) => {
        const { [key]: _, ...rest } = state.connections
        return { connections: rest }
      })
    },

    disconnectAll: () => {
      const connections = get().connections
      Object.keys(connections).forEach((key) => {
        get().disconnect(key)
      })
    },

    send: (key, data, options = {}) => {
      const connection = get().connections[key]
      
      if (!connection?.ws || connection.ws.readyState !== WebSocket.OPEN) {
        console.warn(`⚠️ Cannot send message to WebSocket (${key}): Not connected`)
        return
      }

      try {
        const message = JSON.stringify(data)
        connection.ws.send(message)
        
        set((state) => ({
          connections: {
            ...state.connections,
            [key]: {
              ...state.connections[key],
              lastDataSent: data,
            },
          },
        }))

        if (!options.skipLog) {
          console.log(`📤 WebSocket message sent (${key}):`, data)
        }
      } catch (error) {
        console.error(`❌ Failed to send WebSocket message (${key}):`, error)
      }
    },

    getBySocketKey: (key) => {
      const connection = get().connections[key] || createDefaultConnection()
      
      return {
        ...connection,
        send: (data: any, options?: WebSocketStoreSendMessageOptions) => {
          get().send(key, data, options)
        },
        disconnect: () => {
          get().disconnect(key)
        },
      }
    },

    setGlobalReconnect: (enabled) => {
      set({ globalReconnect: enabled })
    },
  }))
)

export default useWebSocketsStore 