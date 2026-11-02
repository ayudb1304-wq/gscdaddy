import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { syncSite, isSyncInProgress } from "../lib/sync/gsc-sync"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log("Starting GSC sync cron...")

  // Only sync users who still have access: an unexpired trial or an active
  // subscription. Expired trials and churned users were being synced forever,
  // spending GSC quota and failing daily on revoked tokens.
  const { data: users, error: usersError } = await admin
    .from("users")
    .select("id, trial_ends_at, subscriptions(status)")
    .range(0, 9999)

  if (usersError) {
    console.error("Failed to fetch users:", usersError)
    process.exit(1)
  }

  const now = Date.now()
  const activeUserIds = (users ?? [])
    .filter((u) => {
      const trialActive = u.trial_ends_at && new Date(u.trial_ends_at).getTime() > now
      const paid = ((u.subscriptions as { status: string }[] | null) ?? []).some((s) => s.status === "active")
      return trialActive || paid
    })
    .map((u) => u.id)

  console.log(`${activeUserIds.length} of ${users?.length ?? 0} users have active access`)
  if (activeUserIds.length === 0) {
    console.log("No active users to sync")
    return
  }

  const { data: allSites, error } = await admin
    .from("sites")
    .select("*")
    .in("user_id", activeUserIds)

  // Skip sites genuinely mid-sync; a stale "syncing" (killed run) is retried.
  const sites = (allSites ?? []).filter(
    (s: { sync_status: string | null; sync_started_at?: string | null }) => !isSyncInProgress(s.sync_status, s.sync_started_at)
  ) as { id: string; site_url: string }[]

  if (error) {
    console.error("Failed to fetch sites:", error)
    process.exit(1)
  }

  if (!sites?.length) {
    console.log("No sites need syncing")
    return
  }

  console.log(`Found ${sites.length} sites to sync`)

  let succeeded = 0
  let failed = 0

  for (const site of sites) {
    try {
      // The view is refreshed once below for all sites, not after each one.
      const { rowCount, complete, syncedThrough } = await syncSite(site.id, {
        refreshView: false,
        timeBudgetMs: 8 * 60_000,
      })
      console.log(
        `  ✓ ${site.site_url} — ${rowCount} rows${complete ? "" : ` (partial, through ${syncedThrough}; continues tomorrow)`}`
      )
      succeeded++
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error"
      console.error(`  ✗ ${site.site_url} — ${message}`)
      failed++
    }
  }

  // Refresh the striking-distance materialized view so today's recommendations
  // cron (which fires at 05:00 UTC, 60 minutes after sync-gsc at 04:00 UTC)
  // reads fresh data. Without this the generate-recs cron would operate on
  // yesterday's snapshot until the dedicated refresh-views job runs at 04:30 —
  // which is a 60-minute race window. Calling it here closes that gap.
  if (succeeded > 0) {
    try {
      const { error: refreshError } = await admin.rpc("refresh_striking_distance")
      if (refreshError) {
        console.error("Post-sync view refresh failed:", refreshError)
      } else {
        console.log("Striking-distance view refreshed")
      }
    } catch (e) {
      console.error("Post-sync view refresh threw:", e)
    }
  }

  console.log(`Done: ${succeeded} succeeded, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main()
