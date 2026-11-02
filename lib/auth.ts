import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * The signed-in user with subscriptions. Wrapped in React cache(): the
 * dashboard layout and each page both call it, which made two auth calls and
 * two user queries per navigation.
 */
export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Auth error:", authError?.message || "No user session")
    return null
  }

  const admin = createAdminClient()

  // First try with subscriptions join
  const { data, error } = await admin
    .from("users")
    .select("*, subscriptions(*)")
    .eq("id", user.id)
    .single()

  if (error) {
    // Fallback: try without subscriptions join (table may not be set up yet)
    console.warn("Users query with subscriptions failed, trying without:", error.message)
    const { data: userData, error: userError } = await admin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError) {
      console.error("Users query failed:", userError.message)
      // User exists in auth but not in users table - this can happen if callback didn't complete
      return null
    }

    return { ...userData, subscriptions: [] }
  }

  return data
})

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export type AppUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

/** The user's sites (all columns), oldest first; cached per request like getCurrentUser. */
export const getUserSites = cache(async function getUserSites(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("sites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  return data ?? []
})
