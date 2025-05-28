import { type NextRequest, NextResponse } from "next/server"

// Map to store active connections (this would be shared with the WebSocket handler)
// In a production environment, you'd use Redis or another shared storage
const connections = new Map<string, WebSocket>()
const eventSubscriptions = new Map<string, Set<WebSocket>>()
const userConnections = new Map<string, WebSocket>()

export async function POST(request: NextRequest) {
  try {
    const message = await request.json()

    // Validate the message
    if (!message.type) {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
    }

    // Broadcast the message based on its type
    if (message.type === "event_update" && message.eventId) {
      broadcastToEvent(message.eventId, message)
    } else if (message.type === "user_update" && message.userId) {
      sendToUser(message.userId, message)
    } else {
      broadcastToAll(message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error broadcasting WebSocket message:", error)
    return NextResponse.json({ error: "Failed to broadcast message" }, { status: 500 })
  }
}

// Helper function to broadcast to all subscribers of an event
function broadcastToEvent(eventId: string, message: any) {
  const subscribers = eventSubscriptions.get(eventId)
  if (!subscribers) return

  const messageStr = JSON.stringify(message)

  subscribers.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr)
    }
  })
}

// Helper function to send a message to a specific user
function sendToUser(userId: string, message: any) {
  const socket = userConnections.get(userId)
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

// Helper function to broadcast to all connections
function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message)

  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr)
    }
  })
}
