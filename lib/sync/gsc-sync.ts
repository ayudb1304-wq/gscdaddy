import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken } from "@/lib/google/tokens"
import { fetchAllSearchAnalytics, GSCRow } from "@/lib/google/search-console"

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getDateRange(lastSyncedAt: string | null): { startDate: string; endDate: string } {
  const now = new Date()
  // GSC data has 2-3 day delay, so end date is 3 days ago
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() - 3)

  const startDate = new Date(now)
  if (!lastSyncedAt) {
    // Initial sync: last 90 days
    startDate.setDate(startDate.getDate() - 90)
  } else {
    // Daily sync: last 6 days (overlap to catch late-arriving data)
    startDate.setDate(startDate.getDate() - 6)
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  }
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

export async function syncSite(siteId: string): Promise<{ rowCount: number }> {
  const admin = createAdminClient()

  // Fetch site record
  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, site_url, user_id, last_synced_at")
    .eq("id", siteId)
    .single()

  if (siteError || !site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  // Mark as syncing
  await admin
    .from("sites")
    .update({ sync_status: "syncing", sync_progress: "Starting sync..." })
    .eq("id", siteId)

  try {
    // Get valid access token (refreshes if needed)
    await updateSyncProgress(admin, siteId, "Authenticating with Google...")
    const accessToken = await getValidAccessToken(site.user_id)

    // Determine date range
    const { startDate, endDate } = getDateRange(site.last_synced_at)
    const isInitial = !site.last_synced_at
    await updateSyncProgress(
      admin,
      siteId,
      `Fetching ${isInitial ? "90 days" : "6 days"} of data from GSC (${startDate} to ${endDate})...`
    )

    // Fetch all data from GSC (handles pagination internally)
    const rows = await fetchAllSearchAnalytics(accessToken, site.site_url, startDate, endDate)

    await updateSyncProgress(admin, siteId, `Fetched ${rows.length} rows. Saving to database...`)

    // Batch upsert into gsc_data
    if (rows.length > 0) {
      await batchUpsert(admin, siteId, rows)
    }

    // Mark as completed
    await admin
      .from("sites")
      .update({
        sync_status: "completed",
        sync_progress: `Completed: ${rows.length} rows synced`,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", siteId)

    console.log(`Sync completed for site ${siteId}: ${rows.length} rows`)
    return { rowCount: rows.length }
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
