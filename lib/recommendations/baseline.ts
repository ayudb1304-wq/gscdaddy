import { createAdminClient } from "@/lib/supabase/admin"

type Admin = ReturnType<typeof createAdminClient>

const BASELINE_WINDOW_DAYS = 28

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

/**
 * Snapshot the 28 days of gsc_data immediately before `completedAt` for the
 * rec's (query, page). Stored as the "before" half of the /today rec-impact
 * band. No-op if query or page is null (rec isn't pinned to a specific
 * query/page, so there's nothing to snapshot against).
 */
export async function captureBaseline(
  admin: Admin,
  recommendationId: string
): Promise<void> {
  const { data: rec } = await admin
    .from("recommendations")
    .select("id, site_id, query, page, completed_at")
    .eq("id", recommendationId)
    .single()

  if (!rec || !rec.query || !rec.page || !rec.completed_at) return

  const completedAt = new Date(rec.completed_at)
  const end = new Date(completedAt)
  end.setUTCDate(end.getUTCDate() - 1)
  const start = new Date(completedAt)
  start.setUTCDate(start.getUTCDate() - BASELINE_WINDOW_DAYS)

  const { data: rows } = await admin
    .from("gsc_data")
    .select("clicks, impressions, position, ctr")
    .eq("site_id", rec.site_id)
    .eq("query", rec.query)
    .eq("page", rec.page)
    .gte("date", formatDate(start))
    .lte("date", formatDate(end))

  const list = rows || []
  const clicks = list.reduce((s, r) => s + (r.clicks || 0), 0)
  const impressions = list.reduce((s, r) => s + (r.impressions || 0), 0)
  const avgPos =
    list.length > 0
      ? list.reduce((s, r) => s + (r.position || 0), 0) / list.length
      : 0
  const avgCtr =
    list.length > 0
      ? list.reduce((s, r) => s + (r.ctr || 0), 0) / list.length
      : 0

  await admin.from("recommendation_baselines").upsert(
    {
      recommendation_id: rec.id,
      site_id: rec.site_id,
      query: rec.query,
      page: rec.page,
      baseline_start: formatDate(start),
      baseline_end: formatDate(end),
      baseline_clicks: clicks,
      baseline_impressions: impressions,
      baseline_avg_position: Math.round(avgPos * 100) / 100,
      baseline_avg_ctr: Math.round(avgCtr * 10000) / 10000,
      completed_at: rec.completed_at,
    },
    { onConflict: "recommendation_id" }
  )
}

export async function clearBaseline(
  admin: Admin,
  recommendationId: string
): Promise<void> {
  await admin
    .from("recommendation_baselines")
    .delete()
    .eq("recommendation_id", recommendationId)
}
