import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID

    if (!clientId) {
      return NextResponse.json(
        { error: 'SoundCloud client ID not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientId,
    })
  } catch (error) {
    console.error('Error getting SoundCloud client ID:', error)
    return NextResponse.json(
      { error: 'Failed to get SoundCloud client ID' },
      { status: 500 }
    )
  }
} 