import type { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/fetch-all"

type Admin = ReturnType<typeof createAdminClient>

export interface DayPoint {
  date: string
  clicks: number
  impressions: number
  /** Impression-weighted average position (0 when the day has no impressions). */
  position: number
}

const DAY_MS = 86_400_000
const iso = (d: Date) => d.toISOString().split("T")[0]

/**
 * The last `days` days of site metrics ending at the newest day with data,
 * gap-filled with zero days so charts don't draw lines across missing dates.
 *
 * Uses the site_daily_series RPC (migration 018): one round trip, Search
 * Console's own daily totals where stored (they include anonymised queries,
 * so they match the GSC Performance report), otherwise summed query x page
 * rows. Before 018 is applied it falls back to paging raw rows.
 */
export async function getDailySeries(admin: Admin, siteId: string, days: number): Promise<{ latest: string | null; points: DayPoint[] }> {
  let rows: { date: string; clicks: number; impressions: number; position: number }[] | null = null

  const { data, error } = await admin.rpc("site_daily_series", { p_site_id: siteId, p_days: days })
  if (!error && Array.isArray(data)) {
    rows = data.map((r: { date: string; clicks: number; impressions: number; avg_position: number }) => ({
      date: r.date,
      clicks: Number(r.clicks),
      impressions: Number(r.impressions),
      position: Number(r.avg_position),
    }))
  } else {
    rows = await legacySeries(admin, siteId, days)
  }

  if (rows.length === 0) return { latest: null, points: [] }

  const latest = rows.reduce((max, r) => (r.date > max ? r.date : max), rows[0].date)
  const byDate = new Map(rows.map((r) => [r.date, r]))
  const end = new Date(`${latest}T00:00:00Z`)
  const points: DayPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = iso(new Date(end.getTime() - i * DAY_MS))
    const r = byDate.get(date)
    points.push(r ? { ...r } : { date, clicks: 0, impressions: 0, position: 0 })
  }
  return { latest, points }
}

/** Totals over a set of days, with impression-weighted position. */
export function summarize(points: DayPoint[]) {
  const clicks = points.reduce((s, p) => s + p.clicks, 0)
  const impressions = points.reduce((s, p) => s + p.impressions, 0)
  const weighted = points.reduce((s, p) => s + p.position * p.impressions, 0)
  const avgPosition = impressions > 0 ? Math.round((weighted / impressions) * 10) / 10 : 0
  return { clicks, impressions, avgPosition }
}

async function legacySeries(admin: Admin, siteId: string, days: number) {
  const { data: latestRow } = await admin
    .from("gsc_data")
    .select("date")
    .eq("site_id", siteId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latestRow?.date) return []
  const end = new Date(`${latestRow.date}T00:00:00Z`)
  const start = iso(new Date(end.getTime() - (days - 1) * DAY_MS))
  const raw = await fetchAllRows<{ date: string; clicks: number; impressions: number; position: number }>((from, to) =>
    admin
      .from("gsc_data")
      .select("date, clicks, impressions, position")
      .eq("site_id", siteId)
      .gte("date", start)
      .lte("date", latestRow.date)
      .order("date", { ascending: true })
      .order("id")
      .range(from, to)
  )
  const acc = new Map<string, { clicks: number; impressions: number; weighted: number }>()
  for (const r of raw) {
    const a = acc.get(r.date) ?? { clicks: 0, impressions: 0, weighted: 0 }
    a.clicks += r.clicks || 0
    a.impressions += r.impressions || 0
    a.weighted += (r.position || 0) * (r.impressions || 0)
    acc.set(r.date, a)
  }
  return [...acc.entries()].map(([date, a]) => ({
    date,
    clicks: a.clicks,
    impressions: a.impressions,
    position: a.impressions > 0 ? a.weighted / a.impressions : 0,
  }))
}
