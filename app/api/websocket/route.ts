import { NextResponse } from "next/server"

// This is a simplified mock WebSocket endpoint for preview environments
// In production, you would use the Edge runtime with proper WebSocket support

export async function GET(request) {
  // Return a 501 Not Implemented response with a helpful message
  return new NextResponse(
    JSON.stringify({
      error: "WebSockets are not available in this environment",
      message: "The application will fall back to regular HTTP polling",
    }),
    {
      status: 501,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
