import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}
