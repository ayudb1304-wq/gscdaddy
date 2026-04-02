import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { syncSite } from "@/lib/sync/gsc-sync"

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find all sites that need syncing: never synced or last synced > 24h ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: sites, error } = await admin
    .from("sites")
    .select("id, site_url")
    .or(`last_synced_at.is.null,last_synced_at.lt.${twentyFourHoursAgo}`)
    .neq("sync_status", "syncing")

  if (error) {
    console.error("Failed to fetch sites for sync:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ message: "No sites need syncing", synced: 0 })
  }

  const results: { siteId: string; siteUrl: string; status: string; rowCount?: number; error?: string }[] = []

  // Process sites sequentially to respect GSC API rate limits
  for (const site of sites) {
    try {
      const { rowCount } = await syncSite(site.id)
      results.push({ siteId: site.id, siteUrl: site.site_url, status: "completed", rowCount })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error"
      results.push({ siteId: site.id, siteUrl: site.site_url, status: "failed", error: message })
    }
  }

  const succeeded = results.filter((r) => r.status === "completed").length
  const failed = results.filter((r) => r.status === "failed").length

  console.log(`Cron sync-gsc: ${succeeded} succeeded, ${failed} failed out of ${sites.length} sites`)

  return NextResponse.json({
    message: `Synced ${succeeded}/${sites.length} sites`,
    synced: succeeded,
    failed,
    results,
  })
}
