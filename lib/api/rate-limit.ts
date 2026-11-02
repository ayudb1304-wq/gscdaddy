const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 50 // agency-tier cap

const hits = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key)
  }
}, 5 * 60_000)

export function rateLimit(key: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS
    hits.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt }
}

/**
 * Rate limit shared across every serverless instance, counted in Postgres
 * (rate_limit_hit RPC, migration 017). Use it for public, unauthenticated
 * endpoints that do expensive or abusable work. Falls back to the in-memory
 * limiter if the database call fails, so the endpoint stays up.
 */
export async function sharedRateLimit(
  key: string,
  { windowSeconds = 60, max = 10 }: { windowSeconds?: number; max?: number } = {}
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_key: key,
      p_window_seconds: windowSeconds,
      p_max: max,
    })
    const row = Array.isArray(data) ? data[0] : data
    if (error || !row) throw error ?? new Error("rate_limit_hit returned no row")
    return { allowed: Boolean(row.allowed), remaining: Number(row.remaining) }
  } catch (err) {
    console.error("Shared rate limit unavailable, using in-memory limit:", err)
    const { allowed, remaining } = rateLimit(key)
    return { allowed, remaining }
  }
}
