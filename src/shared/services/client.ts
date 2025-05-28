import type { createClient as createClientBase } from "@supabase/supabase-js"
import { getSupabaseClient } from "./singleton"

// Singleton pattern to prevent multiple instances
const supabaseClient: ReturnType<typeof createClientBase> | null = null

export const createClient = () => {
  return getSupabaseClient()
}
