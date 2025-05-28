export type WebSocketMessage = {
  type: string
  eventId?: string
  userId?: string
  data: any
}

class WebSocketService {
  private static instance: WebSocketService
  private socket: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()
  private userListeners: Map<string, Set<(data: any) => void>> = new Set()
  private globalListeners: Set<(message: WebSocketMessage) => void> = new Set()
  private isConnecting = false
  private connectionAttempts = 0
  private maxReconnectDelay = 30000 // 30 seconds max
  private userId: string | null = null
  private pendingMessages: WebSocketMessage[] = []
  private wsSupported = false
  private wsEnabled = true

  // Singleton pattern
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  constructor() {
    // Check if WebSockets are supported in this environment
    if (typeof window !== "undefined") {
      this.wsSupported = "WebSocket" in window

      // Check if we're in a development/preview environment
      const isPreview =
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"

      // Disable WebSockets in preview by default (can be enabled manually)
      if (isPreview) {
        console.log("[WebSocketService] Running in preview environment, WebSockets disabled by default")
        this.wsEnabled = false
      }
    }
  }

  // Enable or disable WebSockets
  public setEnabled(enabled: boolean): void {
    this.wsEnabled = enabled
    if (enabled && !this.socket && !this.isConnecting) {
      this.connect(this.userId || undefined)
    } else if (!enabled && this.socket) {
      this.disconnect()
    }
  }

  // Initialize WebSocket connection
  public connect(userId?: string): void {
    if (typeof window === "undefined") return // Only run on client

    // Skip if WebSockets aren't supported or enabled
    if (!this.wsSupported || !this.wsEnabled) {
      console.log("[WebSocketService] WebSockets are not supported or disabled")
      return
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("[WebSocketService] Already connected")
      return
    }

    if (this.isConnecting) {
      console.log("[WebSocketService] Connection already in progress")
      return
    }

    this.isConnecting = true

    if (userId) {
      this.userId = userId
    }

    try {
      // Use secure WebSocket in production
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = window.location.host
      const wsUrl = `${protocol}//${host}/api/websocket`

      console.log(`[WebSocketService] Connecting to ${wsUrl}`)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      this.socket.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("[WebSocketService] Connection error:", error)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private handleOpen(event: Event): void {
    console.log("[WebSocketService] Connection established")
    this.isConnecting = false
    this.connectionAttempts = 0

    // Send authentication if we have a userId
    if (this.userId) {
      this.sendMessage({
        type: "auth",
        userId: this.userId,
        data: { userId: this.userId },
      })
    }

    // Send any pending messages
    if (this.pendingMessages.length > 0) {
      console.log(`[WebSocketService] Sending ${this.pendingMessages.length} pending messages`)
      this.pendingMessages.forEach((msg) => this.sendMessage(msg))
      this.pendingMessages = []
    }

    // Notify listeners of connection
    this.notifyGlobalListeners({
      type: "connection_status",
      data: { connected: true },
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage
      console.log("[WebSocketService] Message received:", message)

      // Notify global listeners
      this.notifyGlobalListeners(message)

      // Notify event-specific listeners
      if (message.eventId) {
        const eventListeners = this.eventListeners.get(message.eventId)
        if (eventListeners) {
          eventListeners.forEach((callback) => {
            try {
              callback(message.data)
            } catch (error) {
              console.error(`[WebSocketService] Error in event listener for ${message.eventId}:`, error)
            }
          })
        }
      }

      // Notify user-specific listeners
      if (message.userId) {
        const userListeners = this.userListeners.get(message.userId)
        if (userListeners) {
          userListeners.forEach((callback) => {
            try {
              callback(message.data)
            } catch (error) {
              console.error(`[WebSocketService] Error in user listener for ${message.userId}:`, error)
            }
          })
        }
      }
    } catch (error) {
      console.error("[WebSocketService] Error parsing message:", error)
    }
  }

  private notifyGlobalListeners(message: WebSocketMessage): void {
    this.globalListeners.forEach((callback) => {
      try {
        callback(message)
      } catch (error) {
        console.error("[WebSocketService] Error in global listener:", error)
      }
    })
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocketService] Connection closed: ${event.code} ${event.reason}`)
    this.socket = null
    this.isConnecting = false

    // Notify listeners of disconnection
    this.notifyGlobalListeners({
      type: "connection_status",
      data: { connected: false, code: event.code, reason: event.reason },
    })

    // Only reconnect if WebSockets are still enabled
    if (this.wsEnabled) {
      this.scheduleReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error("[WebSocketService] WebSocket error:", event)
    this.isConnecting = false

    // Notify listeners of error
    this.notifyGlobalListeners({
      type: "connection_error",
      data: { error: event },
    })

    // The onclose handler will be called after this
    // If we're in preview mode, disable WebSockets after a few attempts
    if (this.connectionAttempts >= 2) {
      console.log("[WebSocketService] Multiple connection failures, disabling WebSockets")
      this.wsEnabled = false
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    // Don't reconnect if WebSockets are disabled
    if (!this.wsEnabled) {
      console.log("[WebSocketService] WebSockets disabled, not reconnecting")
      return
    }

    // Exponential backoff with jitter
    this.connectionAttempts++
    const baseDelay = Math.min(1000 * Math.pow(2, this.connectionAttempts), this.maxReconnectDelay)
    const jitter = Math.random() * 0.3 * baseDelay // Add up to 30% jitter
    const delay = baseDelay + jitter

    console.log(
      `[WebSocketService] Reconnecting in ${Math.round(delay / 1000)} seconds (attempt ${this.connectionAttempts})`,
    )

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userId || undefined)
    }, delay)
  }

  // Subscribe to event-specific updates
  public subscribeToEvent(eventId: string, callback: (data: any) => void): () => void {
    console.log(`[WebSocketService] Subscribing to event ${eventId}`)

    if (!this.eventListeners.has(eventId)) {
      this.eventListeners.set(eventId, new Set())
    }

    this.eventListeners.get(eventId)!.add(callback)

    // If we're connected, send a subscription message
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: "subscribe",
        eventId,
        data: { eventId },
      })
    }

    // Return unsubscribe function
    return () => {
      console.log(`[WebSocketService] Unsubscribing from event ${eventId}`)
      this.eventListeners.get(eventId)?.delete(callback)

      // Clean up if no more subscribers
      if (this.eventListeners.get(eventId)?.size === 0) {
        this.eventListeners.delete(eventId)

        // If we're connected, send an unsubscribe message
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.sendMessage({
            type: "unsubscribe",
            eventId,
            data: { eventId },
          })
        }
      }
    }
  }

  // Subscribe to user-specific updates
  public subscribeToUser(userId: string, callback: (data: any) => void): () => void {
    console.log(`[WebSocketService] Subscribing to user ${userId}`)

    if (!this.userListeners.has(userId)) {
      this.userListeners.set(userId, new Set())
    }

    this.userListeners.get(userId)!.add(callback)

    // Return unsubscribe function
    return () => {
      console.log(`[WebSocketService] Unsubscribing from user ${userId}`)
      this.userListeners.get(userId)?.delete(callback)

      // Clean up if no more subscribers
      if (this.userListeners.get(userId)?.size === 0) {
        this.userListeners.delete(userId)
      }
    }
  }

  // Subscribe to all messages
  public subscribeToAll(callback: (message: WebSocketMessage) => void): () => void {
    console.log(`[WebSocketService] Adding global listener`)
    this.globalListeners.add(callback)

    // Return unsubscribe function
    return () => {
      console.log(`[WebSocketService] Removing global listener`)
      this.globalListeners.delete(callback)
    }
  }

  // Send a message to the server
  public sendMessage(message: WebSocketMessage): void {
    // If WebSockets are disabled, log and return
    if (!this.wsEnabled) {
      console.log("[WebSocketService] WebSockets disabled, not sending message:", message)
      return
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.log("[WebSocketService] Socket not open, queueing message:", message)
      this.pendingMessages.push(message)

      // Try to connect if not already connecting
      if (!this.isConnecting && !this.socket) {
        this.connect(this.userId || undefined)
      }
    }
  }

  // Disconnect WebSocket
  public disconnect(): void {
    console.log("[WebSocketService] Disconnecting")

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.onclose = null // Prevent reconnect on intentional close
      this.socket.close()
      this.socket = null
    }

    this.isConnecting = false

    // Notify listeners of disconnection
    this.notifyGlobalListeners({
      type: "connection_status",
      data: { connected: false, reason: "manual_disconnect" },
    })
  }

  // Check if connected
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  // Check if WebSockets are supported and enabled
  public isAvailable(): boolean {
    return this.wsSupported && this.wsEnabled
  }

  // Simulate a message (for testing)
  public simulateMessage(message: WebSocketMessage): void {
    console.log(`[WebSocketService] Simulating message:`, message)
    this.handleMessage({ data: JSON.stringify(message) } as MessageEvent)
  }
}

// Export a singleton instance
export const websocketService = WebSocketService.getInstance()
