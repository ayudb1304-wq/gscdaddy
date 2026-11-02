import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken, setGoogleAuthStatus } from "@/lib/google/tokens"
import { fetchAllSearchAnalytics, fetchDailyTotals, GoogleAuthError, GSCRow } from "@/lib/google/search-console"

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

const DAY_MS = 86_400_000
/** First sync for a site: this many days back. */
const INITIAL_DAYS = 90
/** Re-fetch this many days before the newest stored day (GSC finalizes late). */
const OVERLAP_DAYS = 4
/** Always cover at least the last N days. */
const MIN_RECENT_DAYS = 6
/** Search Console keeps about 16 months of data. */
const MAX_LOOKBACK_DAYS = 480

/** A "syncing" status older than this is treated as a dead run and retried. */
export const STALE_SYNC_MS = 30 * 60 * 1000

/**
 * True when a site is mid-sync for real. A run killed by a timeout never resets
 * its status, so an old (or untimed) "syncing" is treated as failed.
 */
export function isSyncInProgress(syncStatus: string | null, syncStartedAt: string | null | undefined): boolean {
  if (syncStatus !== "syncing") return false
  // Column not there yet (migration 016 not applied): keep the old behaviour.
  if (syncStartedAt === undefined) return true
  // Stuck from before sync_started_at existed.
  if (syncStartedAt === null) return false
  return Date.now() - new Date(syncStartedAt).getTime() < STALE_SYNC_MS
}

const utcDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS)

/**
 * Where to start fetching. Based on the newest day actually stored for the site,
 * not on when the last sync ran: a sync that "completed" with no data, or a site
 * that was stuck for months, used to leave a gap that never filled.
 */
export function getSyncRange(latestStoredDate: string | null, now = new Date()): { start: Date; end: Date } {
  const end = utcDay(now)
  const earliest = addDays(end, -MAX_LOOKBACK_DAYS)
  let start: Date
  if (!latestStoredDate) {
    start = addDays(end, -INITIAL_DAYS)
  } else {
    const fromLatest = addDays(new Date(`${latestStoredDate}T00:00:00Z`), -OVERLAP_DAYS)
    start = new Date(Math.min(fromLatest.getTime(), addDays(end, -MIN_RECENT_DAYS).getTime()))
  }
  if (start < earliest) start = earliest
  return { start, end }
}

/** Rows per upsert request (PostgREST handles ~1 MB bodies comfortably). */
const BATCH_SIZE = 5000
/** Days fetched from Google in parallel. Saving still happens oldest day first. */
const FETCH_CONCURRENCY = 4

async function updateSyncProgress(
  admin: ReturnType<typeof createAdminClient>,
  siteId: string,
  progress: string
) {
  await admin
    .from("sites")
    .update({ sync_progress: progress })
    .eq("id", siteId)
}

async function batchUpsert(
  admin: ReturnType<typeof createAdminClient>,
  siteId: string,
  rows: GSCRow[]
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const records = rows.slice(i, i + BATCH_SIZE).map((row) => ({
      site_id: siteId,
      date: row.keys[2], // [query, page, date]
      query: row.keys[0],
      page: row.keys[1],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }))

    const { error } = await admin
      .from("gsc_data")
      .upsert(records, {
        onConflict: "site_id,date,query,page,country,device",
        ignoreDuplicates: false,
      })

    if (error) {
      throw new Error(`Batch upsert failed at offset ${i}: ${error.message}`)
    }
  }
}

/**
 * Store Search Console's own per-day totals (site_daily_totals, migration 018).
 * Non-fatal: before 018 is applied, or if Google hiccups, the dashboard falls
 * back to summing query x page rows.
 */
async function saveDailyTotals(
  admin: ReturnType<typeof createAdminClient>,
  siteId: string,
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  try {
    const rows = await fetchDailyTotals(accessToken, siteUrl, startDate, endDate)
    if (rows.length === 0) return
    const { error } = await admin.from("site_daily_totals").upsert(
      rows.map((r) => ({
        site_id: siteId,
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      { onConflict: "site_id,date" }
    )
    if (error && !/site_daily_totals/.test(error.message)) {
      console.error(`Saving daily totals failed for site ${siteId}:`, error.message)
    }
  } catch (err) {
    if (err instanceof GoogleAuthError) throw err
    console.error(`Fetching daily totals failed for site ${siteId}:`, err)
  }
}

/** Every date from start to end inclusive, oldest first, as YYYY-MM-DD. */
function eachDay(start: Date, end: Date): string[] {
  const days: string[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(formatDate(d))
  return days
}

export interface SyncOptions {
  /** Refresh the striking-distance view at the end (the cron does it once for all sites). */
  refreshView?: boolean
  /** Stop after the current group of days once this much time has passed; the next sync continues. */
  timeBudgetMs?: number
}

/** Thrown when another sync of the same site is already running. */
export class SyncAlreadyRunningError extends Error {
  constructor() {
    super("A sync for this site is already running")
    this.name = "SyncAlreadyRunningError"
  }
}

/**
 * Atomically mark the site as syncing, unless a live sync already holds it.
 * Checking status and then updating in two steps let the Sync button and the
 * daily job run the same site at once.
 */
async function claimSite(admin: ReturnType<typeof createAdminClient>, siteId: string): Promise<void> {
  const staleBefore = new Date(Date.now() - STALE_SYNC_MS).toISOString()
  const { data, error } = await admin
    .from("sites")
    .update({ sync_status: "syncing", sync_progress: "Starting sync...", sync_started_at: new Date().toISOString() })
    .eq("id", siteId)
    // Timestamp quoted: ":" and "." are reserved in PostgREST filter values.
    .or(`sync_status.neq.syncing,sync_started_at.is.null,sync_started_at.lt."${staleBefore}"`)
    .select("id")

  if (error) {
    // sync_started_at missing (migration 016 not applied): plain update.
    await admin.from("sites").update({ sync_status: "syncing", sync_progress: "Starting sync..." }).eq("id", siteId)
    return
  }
  if (!data || data.length === 0) throw new SyncAlreadyRunningError()
}

export async function syncSite(
  siteId: string,
  { refreshView = true, timeBudgetMs = Infinity }: SyncOptions = {}
): Promise<{ rowCount: number; complete: boolean; syncedThrough: string | null }> {
  const admin = createAdminClient()
  const startedAt = Date.now()

  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, site_url, user_id, last_synced_at")
    .eq("id", siteId)
    .single()

  if (siteError || !site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  await claimSite(admin, siteId)

  try {
    await updateSyncProgress(admin, siteId, "Authenticating with Google...")
    // Fail fast on revoked access before planning anything.
    await getValidAccessToken(site.user_id)

    const { data: latestRow } = await admin
      .from("gsc_data")
      .select("date")
      .eq("site_id", siteId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { start, end } = getSyncRange(latestRow?.date ?? null)
    const days = eachDay(start, end)
    const isInitial = !latestRow

    let rowCount = 0
    let syncedThrough: string | null = null
    let complete = true

    // One day per Google request, a few days in parallel, saved oldest day
    // first. The newest stored day is then always the last one written, so a run
    // killed mid-way can only leave that day partial, and the next sync's
    // overlap re-fetches it. (Multi-day requests come back sorted by clicks, so a
    // kill could leave holes in older days that no later sync would revisit.)
    for (let i = 0; i < days.length; i += FETCH_CONCURRENCY) {
      const group = days.slice(i, i + FETCH_CONCURRENCY)
      await updateSyncProgress(
        admin,
        siteId,
        `${isInitial ? "First sync" : "Syncing"}: ${group[0]} to ${group[group.length - 1]} (day ${Math.min(i + group.length, days.length)} of ${days.length})...`
      )
      // Per group, so a long backfill never runs on an expired token.
      const accessToken = await getValidAccessToken(site.user_id)
      const results = await Promise.all(
        group.map((day) => fetchAllSearchAnalytics(accessToken, site.site_url, day, day))
      )
      for (let j = 0; j < group.length; j++) {
        if (results[j].length > 0) await batchUpsert(admin, siteId, results[j])
        rowCount += results[j].length
        syncedThrough = group[j]
      }
      await saveDailyTotals(admin, siteId, accessToken, site.site_url, group[0], group[group.length - 1])

      if (i + FETCH_CONCURRENCY < days.length && Date.now() - startedAt > timeBudgetMs) {
        // Saved so far is durable; the next sync resumes from the newest stored day.
        complete = false
        break
      }
    }

    // Refresh the striking-distance materialized view before flipping status
    // to "completed". The dashboard/recommendations/striking-distance UIs
    // refetch as soon as they see status != "syncing"; if the view isn't
    // refreshed first, the user sees empty/stale opportunities for a beat.
    // Non-fatal on failure — the daily job refreshes it too.
    if (refreshView) {
      await updateSyncProgress(admin, siteId, "Refreshing opportunities view...")
      // rpc() returns errors instead of throwing, so check both.
      try {
        const { error: refreshError } = await admin.rpc("refresh_striking_distance")
        if (refreshError) console.error(`Post-sync view refresh failed for site ${siteId}:`, refreshError.message)
      } catch (err) {
        console.error(`Post-sync view refresh failed for site ${siteId}:`, err)
      }
    }

    await admin
      .from("sites")
      .update({
        sync_status: "completed",
        sync_progress: complete
          ? `Completed: ${rowCount} rows synced`
          : `Synced through ${syncedThrough} (${rowCount} rows). The rest continues on the next sync.`,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", siteId)

    await setGoogleAuthStatus(site.user_id, true)
    console.log(`Sync ${complete ? "completed" : "partially completed"} for site ${siteId}: ${rowCount} rows through ${syncedThrough}`)
    return { rowCount, complete, syncedThrough }
  } catch (error) {
    const isAuth = error instanceof GoogleAuthError
    if (isAuth) await setGoogleAuthStatus(site.user_id, false)
    const message = isAuth
      ? "Google access expired or was revoked. Reconnect Google to resume syncing."
      : error instanceof Error
        ? error.message
        : "Unknown error"
    await admin
      .from("sites")
      .update({
        sync_status: "failed",
        sync_progress: `Failed: ${message}`,
      })
      .eq("id", siteId)

    console.error(`Sync failed for site ${siteId}:`, error)
    throw error
  }
}
