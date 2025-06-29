import { cookies } from "next/headers"

export async function auth() {
  const cookieStore = cookies()
  const hasSession = cookieStore.has("session") || cookieStore.has("supabase-auth-token")

  return { user: hasSession }
}
