import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { syncSite, isSyncInProgress, SyncAlreadyRunningError } from "../lib/sync/gsc-sync"
import { GoogleAuthError } from "../lib/google/search-console"
import { checkAccess, sitesWithinPlan, type AccessUser } from "../lib/billing/access"
import { fetchAllRows } from "../lib/supabase/fetch-all"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** Sites synced at the same time (each sync already fetches a few days in parallel). */
const SITE_CONCURRENCY = 3
/** Per-site time budget; a longer backfill resumes on the next run. */
const SITE_TIME_BUDGET_MS = 8 * 60_000

type UserRow = AccessUser & { id: string }
type SiteRow = {
  id: string
  site_url: string
  user_id: string
  sync_status: string | null
  sync_started_at?: string | null
  last_synced_at: string | null
  created_at: string | null
}

async function main() {
  console.log("Starting GSC sync cron...")

  // Paged: PostgREST caps every response at 1,000 rows, so users and sites past
  // that were silently never synced.
  const [users, allSites] = await Promise.all([
    fetchAllRows<UserRow>((from, to) =>
      admin.from("users").select("id, trial_ends_at, subscriptions(status, plan, updated_at)").order("id").range(from, to)
    ),
    fetchAllRows<SiteRow>((from, to) =>
      admin.from("sites").select("*").order("id").range(from, to)
    ),
  ])

  // Only users with access (unexpired trial, active or grace-period subscription),
  // and only the sites their plan covers (oldest first): a downgrade used to
  // keep every previously added site syncing.
  const sitesByUser = new Map<string, SiteRow[]>()
  for (const s of allSites) {
    const list = sitesByUser.get(s.user_id) ?? []
    list.push(s)
    sitesByUser.set(s.user_id, list)
  }

  const eligible: SiteRow[] = []
  let activeUsers = 0
  for (const user of users) {
    if (!checkAccess(user).hasAccess) continue
    activeUsers++
    eligible.push(...sitesWithinPlan(user, sitesByUser.get(user.id) ?? []))
  }

  // Skip sites genuinely mid-sync (a stale "syncing" is retried), and sync the
  // least recently synced first so no site is starved by the job's time limit.
  const sites = eligible
    .filter((s) => !isSyncInProgress(s.sync_status, s.sync_started_at))
    .sort((a, b) => new Date(a.last_synced_at ?? 0).getTime() - new Date(b.last_synced_at ?? 0).getTime())

  console.log(`${activeUsers} of ${users.length} users have access; ${sites.length} sites to sync`)
  if (sites.length === 0) return

  let succeeded = 0
  let failed = 0
  let needsReauth = 0
  let skipped = 0

  const queue = [...sites]
  async function worker() {
    for (let site = queue.shift(); site; site = queue.shift()) {
      try {
        const { rowCount, complete, syncedThrough } = await syncSite(site.id, {
          refreshView: false, // refreshed once below for all sites
          timeBudgetMs: SITE_TIME_BUDGET_MS,
        })
        console.log(
          `  ✓ ${site.site_url} — ${rowCount} rows${complete ? "" : ` (partial, through ${syncedThrough}; continues next run)`}`
        )
        succeeded++
      } catch (e) {
        if (e instanceof SyncAlreadyRunningError) {
          console.log(`  · ${site.site_url} — already syncing, skipped`)
          skipped++
        } else if (e instanceof GoogleAuthError) {
          // The user has to reconnect Google; the app shows them a banner.
          console.warn(`  ! ${site.site_url} — Google access revoked or expired (user must reconnect)`)
          needsReauth++
        } else {
          console.error(`  ✗ ${site.site_url} — ${e instanceof Error ? e.message : "Unknown error"}`)
          failed++
        }
      }
    }
  }
  await Promise.all(Array.from({ length: SITE_CONCURRENCY }, worker))

  // Refresh the striking-distance view once so the 05:00 recommendations job
  // reads fresh data.
  if (succeeded > 0) {
    const { error: refreshError } = await admin.rpc("refresh_striking_distance")
    if (refreshError) console.error("Post-sync view refresh failed:", refreshError.message)
    else console.log("Striking-distance view refreshed")
  }

  console.log(`Done: ${succeeded} succeeded, ${failed} failed, ${needsReauth} need Google reconnect, ${skipped} skipped`)
  // Fail the job only on a systemic problem. One user's revoked access used to
  // turn it red every day, hiding real failures.
  const attempted = succeeded + failed
  if (failed > 0 && (succeeded === 0 || failed / attempted >= 0.5)) process.exit(1)
}

main().catch((e) => {
  console.error("Sync cron crashed:", e)
  process.exit(1)
})
