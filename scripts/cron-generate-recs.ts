import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { generateRecommendations } from "../lib/ai/generate-recommendations"
import { fetchAllRows } from "../lib/supabase/fetch-all"
import { checkAccess, sitesWithinPlan, type AccessUser } from "../lib/billing/access"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CONCURRENCY = 2

type UserEmbed = AccessUser & { id: string }
type SiteRow = {
  id: string
  site_url: string
  user_id: string
  sync_status: string | null
  created_at: string | null
  // PostgREST returns the embedded user as an object; untyped clients infer an array.
  users: UserEmbed | UserEmbed[]
}
const embeddedUser = (s: SiteRow): UserEmbed => (Array.isArray(s.users) ? s.users[0] : s.users)

async function main() {
  console.log("Starting recommendation generation cron...")

  // Paged (PostgREST caps responses at 1,000 rows).
  const sites = await fetchAllRows<SiteRow>((from, to) =>
    admin
      .from("sites")
      .select("id, site_url, user_id, sync_status, created_at, users!inner(id, trial_ends_at, subscriptions(status, plan, updated_at))")
      .order("id")
      .range(from, to)
  )

  // Group per user so plan limits apply: only the oldest N sites a plan covers.
  const byUser = new Map<string, SiteRow[]>()
  for (const s of sites) {
    const list = byUser.get(s.user_id) ?? []
    list.push(s)
    byUser.set(s.user_id, list)
  }
  const activeSites: SiteRow[] = []
  for (const list of byUser.values()) {
    const user = embeddedUser(list[0])
    if (!checkAccess(user).hasAccess) continue
    activeSites.push(...sitesWithinPlan(user, list).filter((s) => s.sync_status === "completed"))
  }

  if (!activeSites.length) {
    console.log("No active sites to process")
    return
  }

  // Self-healing filter: only generate for sites without fresh recs. One paged
  // read of all fresh rec site ids (an .in() list of every site id breaks the
  // URL length limit at a few hundred sites).
  let freshRecs: { site_id: string }[]
  try {
    freshRecs = await fetchAllRows<{ site_id: string }>((from, to) =>
      admin
        .from("recommendations")
        .select("site_id")
        .gt("expires_at", new Date().toISOString())
        .order("id")
        .range(from, to)
    )
  } catch (recsError) {
    console.error("Failed to check existing recommendations:", recsError)
    process.exit(1)
  }

  const sitesWithFreshRecs = new Set(freshRecs.map((r) => r.site_id))
  const sitesNeedingRecs = activeSites.filter((s) => !sitesWithFreshRecs.has(s.id))

  if (!sitesNeedingRecs.length) {
    console.log(`All ${activeSites.length} active sites already have fresh recommendations`)
    return
  }

  console.log(`Found ${sitesNeedingRecs.length}/${activeSites.length} active sites needing recommendations`)

  let succeeded = 0
  let failed = 0
  const queue = [...sitesNeedingRecs]

  async function worker() {
    for (let site = queue.shift(); site; site = queue.shift()) {
      try {
        const startedAt = new Date().toISOString()
        const recs = await generateRecommendations(site.id, { source: "auto" })
        // Clear the expired, never-completed recs this batch replaces, so the
        // list doesn't grow every week. Completed recs keep their impact history.
        if (recs && recs.length > 0) {
          await admin
            .from("recommendations")
            .delete()
            .eq("site_id", site.id)
            .eq("is_completed", false)
            .lt("expires_at", startedAt)
        }
        console.log(`  ✓ ${site.site_url} — ${recs?.length || 0} recommendations`)
        succeeded++
      } catch (e) {
        console.error(`  ✗ ${site.site_url} — ${e instanceof Error ? e.message : "Unknown error"}`)
        failed++
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`Done: ${succeeded} succeeded, ${failed} failed`)
  // Only exit 1 if *everything* failed — partial failures are normal (new sites,
  // transient Anthropic errors) and shouldn't mark the whole workflow as red.
  if (succeeded === 0 && failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error("Recommendations cron crashed:", e)
  process.exit(1)
})
