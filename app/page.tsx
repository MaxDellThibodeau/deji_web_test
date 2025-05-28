import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function Home() {
  // Check if user is logged in by looking for a session cookie
  const cookieStore = cookies()
  const hasSession = cookieStore.has("session") || cookieStore.has("supabase-auth-token")

  // Redirect based on authentication status
  if (hasSession) {
    redirect("/dashboard")
  } else {
    redirect("/landing")
  }

  // This won't be reached due to redirects, but needed for TypeScript
  return null
}
