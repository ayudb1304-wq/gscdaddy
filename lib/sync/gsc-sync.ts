import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken } from "@/lib/google/tokens"
import { fetchAllSearchAnalytics, GSCRow } from "@/lib/google/search-console"

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
/** Fetch and save in chunks so long backfills make durable progress. */
const CHUNK_DAYS = 30

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

/** Split [start, end] into consecutive chunks of at most CHUNK_DAYS days, oldest first. */
export function chunkRange(start: Date, end: Date, days = CHUNK_DAYS): { start: string; end: string }[] {
  const chunks: { start: string; end: string }[] = []
  for (let cs = start; cs <= end; cs = addDays(cs, days)) {
    const ce = addDays(cs, days - 1)
    chunks.push({ start: formatDate(cs), end: formatDate(ce > end ? end : ce) })
  }
  // Fold a short tail (under a week) into the previous chunk: one fewer API call.
  if (chunks.length > 1) {
    const tail = chunks[chunks.length - 1]
    const tailDays = (new Date(`${tail.end}T00:00:00Z`).getTime() - new Date(`${tail.start}T00:00:00Z`).getTime()) / DAY_MS + 1
    if (tailDays < 7) {
      chunks.pop()
      chunks[chunks.length - 1].end = tail.end
    }
  }
  return chunks
}

const BATCH_SIZE = 1000

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
  const totalBatches = Math.ceil(rows.length / BATCH_SIZE)

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const batch = rows.slice(i, i + BATCH_SIZE)
    const records = batch.map((row) => ({
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

    await updateSyncProgress(
      admin,
      siteId,
      `Saving data: batch ${batchNum}/${totalBatches} (${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} rows)`
    )
  }
}

export interface SyncOptions {
  /** Refresh the striking-distance view at the end (the cron does it once for all sites). */
  refreshView?: boolean
  /** Stop after the current chunk once this much time has passed; the next sync continues. */
  timeBudgetMs?: number
}

export async function syncSite(
  siteId: string,
  { refreshView = true, timeBudgetMs = Infinity }: SyncOptions = {}
): Promise<{ rowCount: number; complete: boolean; syncedThrough: string | null }> {
  const admin = createAdminClient()
  const startedAt = Date.now()

  // Fetch site record
  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, site_url, user_id, last_synced_at")
    .eq("id", siteId)
    .single()

  if (siteError || !site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  // Mark as syncing. sync_started_at lets a run killed by a timeout be retried
  // (column added in migration 016; fall back if it isn't applied yet).
  const { error: markError } = await admin
    .from("sites")
    .update({ sync_status: "syncing", sync_progress: "Starting sync...", sync_started_at: new Date().toISOString() })
    .eq("id", siteId)
  if (markError) {
    await admin
      .from("sites")
      .update({ sync_status: "syncing", sync_progress: "Starting sync..." })
      .eq("id", siteId)
  }

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
    const chunks = chunkRange(start, end)
    const isInitial = !latestRow

    let rowCount = 0
    let syncedThrough: string | null = null
    let complete = true

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      await updateSyncProgress(
        admin,
        siteId,
        `${isInitial ? "First sync" : "Syncing"}: ${chunk.start} to ${chunk.end} (${i + 1}/${chunks.length})...`
      )
      // Per chunk, so a long backfill never runs on an expired token.
      const accessToken = await getValidAccessToken(site.user_id)
      const rows = await fetchAllSearchAnalytics(accessToken, site.site_url, chunk.start, chunk.end)
      if (rows.length > 0) {
        await batchUpsert(admin, siteId, rows)
      }
      rowCount += rows.length
      syncedThrough = chunk.end

      if (i < chunks.length - 1 && Date.now() - startedAt > timeBudgetMs) {
        // Saved so far is durable; the next sync resumes from the newest stored day.
        complete = false
        break
      }
    }

    // Refresh the striking-distance materialized view before flipping status
    // to "completed". The dashboard/recommendations/striking-distance UIs
    // refetch as soon as they see status != "syncing"; if the view isn't
    // refreshed first, the user sees empty/stale opportunities for a beat.
    // Non-fatal on failure — the nightly refresh-views cron is a safety net.
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

    console.log(`Sync ${complete ? "completed" : "partially completed"} for site ${siteId}: ${rowCount} rows through ${syncedThrough}`)
    return { rowCount, complete, syncedThrough }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    // Mark as failed
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
