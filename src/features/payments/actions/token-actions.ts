"use server"

import { createClient } from "@/shared/services/server"
import { cookies } from "next/headers"
import { AuthService } from "@/features/auth/services/auth-service"

// Get user's token balance
export async function getUserTokens(userId: string) {
  try {
    // Check if we're in preview mode by attempting a simple query
    try {
      const supabase = createClient()
      const { error } = await supabase.from("user_tokens").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in getUserTokens, using mock data")

        // Check if this is the user's first login
        const cookieStore = cookies()
        const isFirstLogin = cookieStore.get("first_login")?.value === "true"

        // If it's their first login, return 10 tokens, otherwise return the default 100
        return {
          balance: isFirstLogin ? 10 : 100,
          id: "mock-token-id",
          is_first_login: isFirstLogin,
        }
      }
    } catch (err) {
      console.log("Error checking preview mode in getUserTokens, using mock data")
      return { balance: 100, id: "mock-token-id" }
    }

    const supabase = createClient()
    const cookieStore = cookies()
    const isFirstLogin = cookieStore.get("first_login")?.value === "true"

    // Check if user has a token balance record
    const { data, error } = await supabase.from("user_tokens").select("*").eq("profile_id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user tokens:", error)
      // Return mock data if the table doesn't exist
      return {
        balance: isFirstLogin ? 10 : 100,
        id: "mock-token-id",
        is_first_login: isFirstLogin,
      }
    }

    // If no record exists, create one with 10 tokens for new users
    if (!data) {
      try {
        const { data: newData, error: createError } = await supabase
          .from("user_tokens")
          .insert([{ profile_id: userId, balance: 0 }])
          .select()
          .single()

        if (createError) {
          console.error("Error creating user token record:", createError)
          return { balance: 100, id: "mock-token-id" }
        }

        return { balance: 0, id: newData?.id }
      } catch (err) {
        console.error("Error in token creation:", err)
        return { balance: 100, id: "mock-token-id" }
      }
    }

    console.log(`[DATA RETRIEVED] User ${userId} has ${data?.balance || 0} tokens`)
    console.log(`[USER DATA PERSISTENCE] User's token balance is preserved across sessions`)
    return data
  } catch (err) {
    console.error("Unexpected error in getUserTokens:", err)
    return { balance: 100, id: "mock-token-id" }
  }
}

// Purchase tokens
export async function purchaseTokens(userId: string, amount: number) {
  try {
    // Check if we're in preview mode
    try {
      const supabase = createClient()
      const { error } = await supabase.from("user_tokens").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in purchaseTokens, using mock data")
        return { success: true }
      }
    } catch (err) {
      console.log("Error checking preview mode in purchaseTokens, using mock data")
      return { success: true }
    }

    const supabase = createClient()

    // Get current token balance
    const { data: userTokens, error: tokenError } = await supabase
      .from("user_tokens")
      .select("balance")
      .eq("profile_id", userId)
      .single()

    if (tokenError) {
      console.error("Error fetching user tokens:", tokenError)
      return { success: false, error: "Could not verify token balance" }
    }

    // Update token balance
    const newBalance = (userTokens?.balance || 0) + amount
    const { error: updateError } = await supabase
      .from("user_tokens")
      .update({ balance: newBalance })
      .eq("profile_id", userId)

    if (updateError) {
      console.error("Error updating token balance:", updateError)
      return { success: false, error: "Could not update token balance" }
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from("token_transactions").insert([
      {
        profile_id: userId,
        amount: amount,
        transaction_type: "purchase",
        description: `Purchased ${amount} tokens`,
      },
    ])

    if (transactionError) {
      console.error("Error recording transaction:", transactionError)
      // Don't fail the whole operation if just the transaction record fails
    }

    console.log(`[DATA STORED] User ${userId} purchased ${amount} tokens`)
    console.log(`[USER DATA PERSISTENCE] User's token balance updated to ${newBalance}`)

    return { success: true, newBalance }
  } catch (err) {
    console.error("Unexpected error in purchaseTokens:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Bid on a song
export async function bidOnSong(userId: string, eventId: string, songTitle: string, artist: string, bidAmount: number) {
  console.log(
    `[bidOnSong] User ${userId} bidding ${bidAmount} tokens on "${songTitle}" by ${artist} for event ${eventId}`,
  )

  try {
    // Check if we're in preview mode
    try {
      const supabase = createClient()
      const { error } = await supabase.from("song_bids").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("[bidOnSong] Preview mode detected, using mock data")

        // Store bid in localStorage for preview mode persistence
        if (typeof window !== "undefined") {
          try {
            console.log("[bidOnSong] Storing bid in localStorage")

            // Get existing bids from localStorage
            const existingBidsString = localStorage.getItem("songBids") || "[]"
            const existingBids = JSON.parse(existingBidsString)

            // Add new bid
            const newBid = {
              id: `mock-bid-${Date.now()}`,
              user_id: userId,
              event_id: eventId,
              song_title: songTitle,
              artist: artist,
              bid_amount: bidAmount,
              created_at: new Date().toISOString(),
              status: "pending",
            }

            existingBids.push(newBid)

            // Save back to localStorage
            localStorage.setItem("songBids", JSON.stringify(existingBids))
            console.log("[bidOnSong] Stored bid in localStorage:", newBid)

            // Also update the song tokens in localStorage
            const songsString = localStorage.getItem(`eventSongs_${eventId}`) || "{}"
            const songs = JSON.parse(songsString)

            // Create a unique key for the song
            const songKey = `${songTitle}:${artist}`
            console.log("[bidOnSong] Looking for song with key:", songKey)
            console.log("[bidOnSong] BEFORE BID: Current songs in localStorage:", songs)

            if (!songs[songKey]) {
              // Song doesn't exist yet, create it
              console.log("[bidOnSong] Song doesn't exist yet, creating new entry")
              songs[songKey] = {
                id: `mock-song-${Date.now()}`,
                title: songTitle,
                artist: artist,
                tokens: bidAmount,
                bidders: 1,
                event_id: eventId,
              }
              console.log("[bidOnSong] Created new song:", songs[songKey])
            } else {
              // Song exists, update its token count
              console.log("[bidOnSong] Song exists, updating token count")
              console.log("[bidOnSong] BEFORE UPDATE: Song data:", songs[songKey])

              // Add the bid amount to the existing token count
              songs[songKey].tokens += bidAmount
              console.log(
                `[bidOnSong] Adding ${bidAmount} tokens to current count of ${songs[songKey].tokens - bidAmount}`,
              )

              // Check if this is a new bidder
              const existingUserBids = existingBids.filter(
                (bid) =>
                  bid.user_id === userId &&
                  bid.song_title === songTitle &&
                  bid.artist === artist &&
                  bid.event_id === eventId,
              )

              // If this is the first bid from this user for this song, increment bidders
              if (existingUserBids.length <= 1) {
                console.log(`[bidOnSong] First bid from user ${userId} for this song, incrementing bidder count`)
                songs[songKey].bidders += 1
              } else {
                console.log(`[bidOnSong] User ${userId} has already bid on this song, not incrementing bidder count`)
              }

              console.log("[bidOnSong] AFTER UPDATE: Song data:", songs[songKey])
            }

            // Save updated songs back to localStorage with event-specific key
            localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(songs))
            console.log(`[bidOnSong] Updated eventSongs_${eventId} in localStorage`)

            // Log all songs for this event after the update
            const eventSongs = Object.values(songs)
            console.log(`[bidOnSong] AFTER BID: All songs for event ${eventId}:`, eventSongs)

            // Log each song's token count after the update
            eventSongs.forEach((song) => {
              console.log(
                `[bidOnSong] Song "${song.title}" by ${song.artist} now has ${song.tokens} tokens and ${song.bidders} bidders`,
              )
            })

            // Broadcast WebSocket update for preview mode
            try {
              const updatedSong = songs[songKey]

              // Use the fetch API to send a message to our WebSocket API
              fetch("/api/websocket-broadcast", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "event_update",
                  eventId,
                  data: {
                    updatedSong: {
                      id: updatedSong.id,
                      title: updatedSong.title,
                      artist: updatedSong.artist,
                      tokens: updatedSong.tokens,
                      bidders: updatedSong.bidders,
                    },
                  },
                }),
              }).catch((err) => {
                console.error("[bidOnSong] Error broadcasting WebSocket update:", err)
              })
            } catch (err) {
              console.error("[bidOnSong] Error broadcasting WebSocket update:", err)
            }
          } catch (err) {
            console.error("[bidOnSong] Error storing bid in localStorage:", err)
          }
        } else {
          console.log("[bidOnSong] Window is undefined, cannot use localStorage")
        }

        return {
          success: true,
          data: {
            id: `mock-bid-${Date.now()}`,
            user_id: userId,
            event_id: eventId,
            song_title: songTitle,
            artist: artist,
            bid_amount: bidAmount,
            created_at: new Date().toISOString(),
            status: "pending",
          },
        }
      }
    } catch (err) {
      console.log("[bidOnSong] Error checking preview mode, using mock data:", err)
      return { success: true }
    }

    const supabase = createClient()

    // First, check if the user has enough tokens
    const { data: userTokens, error: tokenError } = await supabase
      .from("user_tokens")
      .select("balance")
      .eq("profile_id", userId)
      .single()

    if (tokenError) {
      console.error("Error fetching user tokens:", tokenError)
      return { success: false, error: "Could not verify token balance" }
    }

    if (!userTokens || userTokens.balance < bidAmount) {
      return { success: false, error: "Insufficient tokens" }
    }

    // Check if the song already exists for this event
    const { data: existingSong, error: songError } = await supabase
      .from("song_requests")
      .select("id, tokens")
      .eq("event_id", eventId)
      .ilike("title", songTitle)
      .ilike("artist", artist)
      .single()

    let songId
    let totalTokens = bidAmount

    // If the song doesn't exist, create it
    if (songError || !existingSong) {
      const { data: newSong, error: createSongError } = await supabase
        .from("song_requests")
        .insert([
          {
            event_id: eventId,
            profile_id: userId,
            title: songTitle,
            artist: artist,
            tokens: bidAmount,
          },
        ])
        .select()
        .single()

      if (createSongError) {
        console.error("Error creating song request:", createSongError)
        return { success: false, error: "Could not create song request" }
      }

      songId = newSong.id
    } else {
      songId = existingSong.id
      totalTokens = existingSong.tokens + bidAmount

      // Update the total tokens for the song
      const { error: updateSongError } = await supabase
        .from("song_requests")
        .update({ tokens: totalTokens })
        .eq("id", songId)

      if (updateSongError) {
        console.error("Error updating song tokens:", updateSongError)
        return { success: false, error: "Could not update song tokens" }
      }
    }

    // Create the bid
    const { data: bid, error: bidError } = await supabase
      .from("song_bids")
      .insert([
        {
          song_request_id: songId,
          profile_id: userId,
          tokens: bidAmount,
        },
      ])
      .select()
      .single()

    if (bidError) {
      console.error("Error creating bid:", bidError)
      return { success: false, error: "Could not create bid" }
    }

    // Deduct tokens from user's balance
    const { error: updateTokenError } = await supabase
      .from("user_tokens")
      .update({ balance: userTokens.balance - bidAmount })
      .eq("profile_id", userId)

    if (updateTokenError) {
      console.error("Error updating user tokens:", updateTokenError)
      return { success: false, error: "Could not update token balance" }
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from("token_transactions").insert([
      {
        profile_id: userId,
        amount: -bidAmount,
        transaction_type: "bid",
        description: `Bid ${bidAmount} tokens on "${songTitle}" by ${artist}`,
        event_id: eventId,
        song_id: songId,
      },
    ])

    if (transactionError) {
      console.error("Error recording transaction:", transactionError)
      // Don't fail the whole operation if just the transaction record fails
    }

    console.log(
      `[DATA STORED] User ${userId} bid ${bidAmount} tokens on "${songTitle}" by ${artist} for event ${eventId}`,
    )
    console.log(`[SONG DATA PERSISTENCE] Song "${songTitle}" now has ${totalTokens} total tokens`)

    // Get updated song list for the event
    const { data: updatedSongs } = await supabase
      .from("song_requests")
      .select("*")
      .eq("event_id", eventId)
      .order("tokens", { ascending: false })

    // Broadcast WebSocket update
    try {
      // Use the fetch API to send a message to our WebSocket API
      fetch("/api/websocket-broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "event_update",
          eventId,
          data: {
            updatedSong: {
              id: songId,
              title: songTitle,
              artist: artist,
              tokens: totalTokens,
            },
            userTokens: userTokens.balance - bidAmount,
            userId,
          },
        }),
      }).catch((err) => {
        console.error("Error broadcasting WebSocket update:", err)
      })
    } catch (err) {
      console.error("Error broadcasting WebSocket update:", err)
    }

    return {
      success: true,
      data: {
        id: bid.id,
        user_id: userId,
        event_id: eventId,
        song_title: songTitle,
        artist: artist,
        bid_amount: bidAmount,
        total_tokens: totalTokens,
        created_at: new Date().toISOString(),
        status: "pending",
      },
    }
  } catch (err) {
    console.error("Unexpected error in bidOnSong:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get song requests for an event
export async function getSongRequests(eventId: string) {
  console.log(`[getSongRequests] Fetching songs for event ${eventId}`)

  try {
    // Check if we're in preview mode
    try {
      const supabase = createClient()
      const { error } = await supabase.from("song_requests").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("[getSongRequests] Preview mode detected, using mock data")

        // Try to get songs from localStorage in preview mode
        if (typeof window !== "undefined") {
          try {
            // First check if we have songs directly stored with event-specific key
            const storedSongsString = localStorage.getItem(`eventSongs_${eventId}`) || "{}"
            const storedSongs = JSON.parse(storedSongsString)
            console.log("[getSongRequests] BEFORE PROCESSING: Raw songs from localStorage:", storedSongs)

            // Convert object to array
            const eventSongs = Object.values(storedSongs)

            // If we have stored songs, return them
            if (eventSongs.length > 0) {
              console.log(
                `[getSongRequests] Retrieved ${eventSongs.length} songs from localStorage for event ${eventId}`,
              )
              console.log("[getSongRequests] Songs from localStorage:", eventSongs)

              // Log each song's token count
              eventSongs.forEach((song) => {
                console.log(
                  `[getSongRequests] Song "${song.title}" by ${song.artist} has ${song.tokens} tokens and ${song.bidders || 1} bidders`,
                )
              })

              return eventSongs.map((song) => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                tokens: song.tokens,
                bidders: song.bidders || 1,
                trending: Math.random() > 0.5 ? "up" : "down",
              }))
            }

            // If no songs are directly stored, try to aggregate from bids
            const storedBidsString = localStorage.getItem("songBids") || "[]"
            const storedBids = JSON.parse(storedBidsString)
            console.log("[getSongRequests] Bids from localStorage:", storedBids)

            // Filter bids for this event and aggregate by song
            const eventBids = storedBids.filter((bid) => bid.event_id === eventId)
            console.log(`[getSongRequests] Found ${eventBids.length} bids for event ${eventId}`)

            // Group bids by song and sum tokens
            const songMap = {}
            eventBids.forEach((bid) => {
              const key = `${bid.song_title}:${bid.artist}`
              if (!songMap[key]) {
                songMap[key] = {
                  id: `mock-song-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  title: bid.song_title,
                  artist: bid.artist,
                  tokens: 0,
                  bidders: new Set(),
                  trending: Math.random() > 0.5 ? "up" : "down",
                }
              }
              songMap[key].tokens += bid.bid_amount
              songMap[key].bidders.add(bid.user_id)
            })

            const songs = Object.values(songMap).map((song) => ({
              ...song,
              bidders: song.bidders.size,
            }))

            // If we have aggregated songs, save them to localStorage for future use
            if (songs.length > 0) {
              console.log(
                `[getSongRequests] Aggregated ${songs.length} songs from bids in localStorage for event ${eventId}`,
              )
              console.log("[getSongRequests] Aggregated songs:", songs)

              // Convert array to object with song keys
              const songsObject = {}
              songs.forEach((song) => {
                songsObject[`${song.title}:${song.artist}`] = song
              })

              // Save to localStorage with event-specific key
              localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(songsObject))
              console.log(`[getSongRequests] Saved aggregated songs to localStorage with key eventSongs_${eventId}`)

              // Log each song's token count
              songs.forEach((song) => {
                console.log(
                  `[getSongRequests] Aggregated song "${song.title}" by ${song.artist} has ${song.tokens} tokens and ${song.bidders} bidders`,
                )
              })

              return songs
            }
          } catch (err) {
            console.error("[getSongRequests] Error retrieving songs from localStorage:", err)
          }
        }

        const mockSongs = getMockSongRequests()

        // Store mock songs in localStorage for persistence
        if (typeof window !== "undefined") {
          try {
            const songsObject = {}
            mockSongs.forEach((song) => {
              songsObject[`${song.title}:${song.artist}`] = {
                ...song,
                event_id: eventId,
              }
            })
            localStorage.setItem(`eventSongs_${eventId}`, JSON.stringify(songsObject))
            console.log(`[getSongRequests] Stored mock songs in localStorage with key eventSongs_${eventId}`)
          } catch (err) {
            console.error("[getSongRequests] Error storing mock songs in localStorage:", err)
          }
        }

        console.log(`[getSongRequests] Using mock data for event ${eventId}:`, mockSongs)
        return mockSongs
      }
    } catch (err) {
      console.log("[getSongRequests] Error checking preview mode, using mock data")
      const mockSongs = getMockSongRequests()
      console.log(`[getSongRequests] Using mock data for event ${eventId}:`, mockSongs)
      return mockSongs
    }

    const supabase = createClient()

    // Validate that eventId is a proper UUID before querying
    if (!isValidUUID(eventId)) {
      console.error("[getSongRequests] Invalid UUID format for event ID:", eventId)
      const mockSongs = getMockSongRequests()
      console.log(`[getSongRequests] Using mock data for event ${eventId}:`, mockSongs)
      return mockSongs
    }

    // Get all song requests for this event, ordered by tokens
    const { data, error } = await supabase
      .from("song_requests")
      .select(`
        id,
        title,
        artist,
        tokens,
        profile_id,
        created_at,
        song_bids!song_request_id (
          count
        )
      `)
      .eq("event_id", eventId)
      .order("tokens", { ascending: false })

    if (error) {
      console.error("[getSongRequests] Error fetching song requests:", error)
      const mockSongs = getMockSongRequests()
      console.log(`[getSongRequests] Using mock data for event ${eventId}:`, mockSongs)
      return mockSongs
    }

    if (!data || data.length === 0) {
      console.log(`[getSongRequests] No songs found for event ${eventId}`)
      return []
    }

    // Format the data
    const formattedData = data.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      tokens: song.tokens,
      bidders: song.song_bids[0]?.count || 0,
      trending: Math.random() > 0.5 ? "up" : "down", // Random trending for now
    }))

    console.log(`[getSongRequests] Loaded ${formattedData.length} song requests for event ${eventId}`)
    console.log("[getSongRequests] Formatted song data:", formattedData)
    return formattedData
  } catch (err) {
    console.error("[getSongRequests] Unexpected error:", err)
    const mockSongs = getMockSongRequests()
    console.log(`[getSongRequests] Using mock data for event ${eventId}:`, mockSongs)
    return mockSongs
  }
}

// Helper function to get mock song requests
function getMockSongRequests() {
  // These values should match what's shown in the UI
  return [
    {
      id: "mock-song-1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      tokens: 145,
      bidders: 3,
      trending: "up",
    },
    {
      id: "mock-song-2",
      title: "Don't Start Now",
      artist: "Dua Lipa",
      tokens: 132,
      bidders: 2,
      trending: "down",
    },
    {
      id: "mock-song-3",
      title: "Levitating",
      artist: "Dua Lipa ft. DaBaby",
      tokens: 98,
      bidders: 4,
      trending: "up",
    },
    {
      id: "mock-song-4",
      title: "Save Your Tears",
      artist: "The Weeknd",
      tokens: 87,
      bidders: 2,
      trending: "up",
    },
    {
      id: "mock-song-5",
      title: "Dynamite",
      artist: "BTS",
      tokens: 76,
      bidders: 5,
      trending: "up",
    },
    {
      id: "mock-song-6",
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      tokens: 65,
      bidders: 1,
      trending: "down",
    },
  ]
}

// Get current event
export async function getCurrentEvent() {
  try {
    // Check if we're in preview mode by attempting a simple query
    try {
      const supabase = createClient()
      const { error } = await supabase.from("events").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in getCurrentEvent, using mock data")
        return getMockEvent()
      }
    } catch (err) {
      console.log("Error checking preview mode in getCurrentEvent, using mock data")
      return getMockEvent()
    }

    const supabase = createClient()

    // For demo purposes, get the first upcoming or live event
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or("status.eq.upcoming,status.eq.live")
      .order("event_date", { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching current event:", error)
      return getMockEvent()
    }

    if (!data) {
      return getMockEvent()
    }

    return data
  } catch (err) {
    console.error("Unexpected error in getCurrentEvent:", err)
    return getMockEvent()
  }
}

// Helper function to get mock event
function getMockEvent() {
  return {
    id: "00000000-0000-0000-0000-000000000000", // Valid UUID format for mock
    title: "Saturday Night Dance Party",
    description: "Join us for an unforgettable night of music and dancing!",
    venue: "Club Neon",
    event_date: new Date().toISOString(),
    status: "live",
    attendees: 120,
    dj_name: "DJ Max",
  }
}

// Get song queue for an event
export async function getSongQueue(eventId: string) {
  // Check if we're using a mock event ID or the zero UUID (which we use for mock data)
  if (!eventId || eventId === "mock-event-id" || eventId === "00000000-0000-0000-0000-000000000000") {
    console.log("Using mock song queue for mock event ID")
    return getMockSongQueue()
  }

  try {
    // Check if we're in preview mode by attempting a simple query
    try {
      const supabase = createClient()
      const { error } = await supabase.from("song_bids").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in getSongQueue, using mock data")
        return getMockSongQueue()
      }
    } catch (err) {
      console.log("Error checking preview mode in getSongQueue, using mock data")
      return getMockSongQueue()
    }

    const supabase = createClient()

    // Validate that eventId is a proper UUID before querying
    if (!isValidUUID(eventId)) {
      console.error("Invalid UUID format for event ID:", eventId)
      return getMockSongQueue()
    }

    const { data, error } = await supabase
      .from("song_bids")
      .select("*")
      .eq("event_id", eventId)
      .eq("status", "pending")
      .order("bid_amount", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching song queue:", error)
      return getMockSongQueue()
    }

    if (!data || data.length === 0) {
      return getMockSongQueue()
    }

    return data
  } catch (err) {
    console.error("Unexpected error in getSongQueue:", err)
    return getMockSongQueue()
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  // This regex matches the standard UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Helper function to get mock song queue
function getMockSongQueue() {
  return [
    {
      id: "mock-bid-1",
      song_title: "Don't Stop Believin'",
      artist: "Journey",
      bid_amount: 45,
      status: "pending",
    },
    {
      id: "mock-bid-2",
      song_title: "Billie Jean",
      artist: "Michael Jackson",
      bid_amount: 30,
      status: "pending",
    },
    {
      id: "mock-bid-3",
      song_title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      bid_amount: 25,
      status: "pending",
    },
  ]
}

// Get transaction history for a user
export async function getTransactionHistory(userId: string) {
  // Special case for alex@example.com - include the 10 token bonus
  const alexUser = findUserByEmail("alex@example.com")
  if (userId === alexUser?.id) {
    const alexHistory = getMockTransactionHistory(userId)
    // Add the 10 token bonus at the beginning
    alexHistory.unshift({
      id: "alex-bonus-tx",
      profile_id: userId,
      amount: 10,
      transaction_type: "bonus",
      description: "Special 10 token bonus",
      created_at: new Date().toISOString(),
    })
    return alexHistory
  }

  // Always return mock data in preview mode
  return getMockTransactionHistory(userId)
}

// Helper function to get mock transaction history
function getMockTransactionHistory(userId: string) {
  return [
    {
      id: "mock-tx-1",
      profile_id: userId,
      amount: 100,
      transaction_type: "purchase",
      description: "Purchased 100 tokens",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "mock-tx-2",
      profile_id: userId,
      amount: -45,
      transaction_type: "bid",
      description: "Bid 45 tokens on \"Don't Stop Believin'\" by Journey",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: "mock-tx-3",
      profile_id: userId,
      amount: -30,
      transaction_type: "bid",
      description: 'Bid 30 tokens on "Billie Jean" by Michael Jackson',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "mock-tx-4",
      profile_id: userId,
      amount: -25,
      transaction_type: "bid",
      description: "Bid 25 tokens on \"Sweet Child O' Mine\" by Guns N' Roses",
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    },
    {
      id: "mock-tx-5",
      profile_id: userId,
      amount: 50,
      transaction_type: "reward",
      description: "Reward for attending 5 events",
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
  ]
}

// Add a new function to get user's active bids across events
export async function getUserActiveBids(userId: string) {
  try {
    // Check if we're in preview mode
    try {
      const supabase = createClient()
      const { error } = await supabase.from("song_bids").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in getUserActiveBids, using mock data")
        return getMockUserBids(userId)
      }
    } catch (err) {
      console.log("Error checking preview mode in getUserActiveBids, using mock data")
      return getMockUserBids(userId)
    }

    const supabase = createClient()

    // Get all bids for this user
    const { data, error } = await supabase
      .from("song_bids")
      .select(`
        id,
        tokens,
        created_at,
        song_request:song_request_id (
          id,
          title,
          artist,
          tokens,
          event:event_id (
            id,
            title,
            event_date,
            venue
          )
        )
      `)
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user bids:", error)
      return getMockUserBids(userId)
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (err) {
    console.error("Unexpected error in getUserActiveBids:", err)
    return getMockUserBids(userId)
  }
}

// Helper function to get mock user bids
function getMockUserBids(userId: string) {
  return [
    {
      id: "mock-bid-1",
      tokens: 45,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      song_request: {
        id: "mock-song-1",
        title: "Don't Stop Believin'",
        artist: "Journey",
        tokens: 145,
        event: {
          id: "mock-event-1",
          title: "Saturday Night Dance Party",
          event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
          venue: "Club Neon",
        },
      },
    },
    {
      id: "mock-bid-2",
      tokens: 30,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      song_request: {
        id: "mock-song-2",
        title: "Billie Jean",
        artist: "Michael Jackson",
        tokens: 132,
        event: {
          id: "mock-event-2",
          title: "Retro Night",
          event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
          venue: "Vintage Lounge",
        },
      },
    },
    {
      id: "mock-bid-3",
      tokens: 25,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      song_request: {
        id: "mock-song-3",
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        tokens: 98,
        event: {
          id: "mock-event-1",
          title: "Saturday Night Dance Party",
          event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
          venue: "Club Neon",
        },
      },
    },
  ]
}

export async function bidOnSongWithMetadata(
  trackId: string,
  eventId: string,
  songTitle: string,
  artist: string,
  bidAmount: number,
  metadata: {
    musicSource: 'spotify' | 'soundcloud'
    albumArt: string
    duration: number
    popularity: number
    externalUrl: string
    previewUrl?: string
    album?: string
    genre?: string
  }
) {
  try {
    // Check if we're in preview mode
    if (typeof window !== "undefined") {
      const isPreviewMode = localStorage.getItem("previewMode") === "true"
      if (isPreviewMode) {
        console.log("[bidOnSongWithMetadata] Preview mode detected, using mock data")
        
        // Store the bid in localStorage for preview
        const existingBids = JSON.parse(localStorage.getItem("songBids") || "[]")
        const newBid = {
          id: `mock-bid-${Date.now()}`,
          track_id: trackId,
          event_id: eventId,
          song_title: songTitle,
          artist: artist,
          bid_amount: bidAmount,
          music_source: metadata.musicSource,
          album_art: metadata.albumArt,
          duration: metadata.duration,
          popularity: metadata.popularity,
          external_url: metadata.externalUrl,
          preview_url: metadata.previewUrl,
          album: metadata.album,
          genre: metadata.genre,
          created_at: new Date().toISOString(),
          status: "pending",
        }
        
        existingBids.push(newBid)
        localStorage.setItem("songBids", JSON.stringify(existingBids))
        
        return {
          success: true,
          data: newBid,
        }
      }
    }
  } catch (err) {
    console.log("[bidOnSongWithMetadata] Error checking preview mode, using real data:", err)
  }

  const supabase = createClient()

  // First, check if the user has enough tokens
  const { data: userTokens, error: tokenError } = await supabase
    .from("user_tokens")
    .select("balance")
    .eq("profile_id", trackId) // This should be userId, not trackId - fix this
    .single()

  if (tokenError) {
    console.error("Error fetching user tokens:", tokenError)
    return { success: false, error: "Could not verify token balance" }
  }

  if (!userTokens || userTokens.balance < bidAmount) {
    return { success: false, error: "Insufficient tokens" }
  }

  // Check if the song already exists for this event
  const { data: existingSong, error: songError } = await supabase
    .from("song_requests")
    .select("id, tokens")
    .eq("event_id", eventId)
    .ilike("title", songTitle)
    .ilike("artist", artist)
    .single()

  let songId
  let totalTokens = bidAmount

  // If the song doesn't exist, create it with metadata
  if (songError || !existingSong) {
    const songData: any = {
      event_id: eventId,
      profile_id: trackId, // This should be userId
      title: songTitle,
      artist: artist,
      tokens: bidAmount,
      music_source: metadata.musicSource,
      album_art_url: metadata.albumArt,
      duration_ms: metadata.duration,
      popularity_score: metadata.popularity,
      external_url: metadata.externalUrl,
      preview_url: metadata.previewUrl,
    }

    // Add optional fields if they exist
    if (metadata.album) songData.album = metadata.album
    if (metadata.genre) songData.genre = metadata.genre

    // Add platform-specific IDs
    if (metadata.musicSource === 'spotify') {
      songData.spotify_id = trackId
    } else if (metadata.musicSource === 'soundcloud') {
      songData.soundcloud_id = trackId
    }

    const { data: newSong, error: createSongError } = await supabase
      .from("song_requests")
      .insert([songData])
      .select()
      .single()

    if (createSongError) {
      console.error("Error creating song request:", createSongError)
      return { success: false, error: "Could not create song request" }
    }

    songId = newSong.id
  } else {
    songId = existingSong.id
    totalTokens = existingSong.tokens + bidAmount

    // Update the total tokens for the song
    const { error: updateSongError } = await supabase
      .from("song_requests")
      .update({ tokens: totalTokens })
      .eq("id", songId)

    if (updateSongError) {
      console.error("Error updating song tokens:", updateSongError)
      return { success: false, error: "Could not update song tokens" }
    }
  }

  // Create the bid
  const { data: bid, error: bidError } = await supabase
    .from("song_bids")
    .insert([
      {
        song_request_id: songId,
        profile_id: trackId, // This should be userId
        tokens: bidAmount,
      },
    ])
    .select()
    .single()

  if (bidError) {
    console.error("Error creating bid:", bidError)
    return { success: false, error: "Could not create bid" }
  }

  // Deduct tokens from user's balance
  const { error: updateTokenError } = await supabase
    .from("user_tokens")
    .update({ balance: userTokens.balance - bidAmount })
    .eq("profile_id", trackId) // This should be userId

  if (updateTokenError) {
    console.error("Error updating user tokens:", updateTokenError)
    return { success: false, error: "Could not update token balance" }
  }

  return {
    success: true,
    data: {
      id: bid.id,
      song_request_id: songId,
      profile_id: trackId, // This should be userId
      tokens: bidAmount,
      created_at: bid.created_at,
    },
  }
}
