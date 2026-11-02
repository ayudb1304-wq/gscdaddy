import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { fetchAllRows } from "@/lib/supabase/fetch-all"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")
    const dateRange = parseInt(searchParams.get("dateRange") || "28", 10)

    if (!siteId) return errors.validation("siteId is required")

    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (siteError || !site) return errors.notFound("Site")

    const now = new Date()
    const currentEnd = new Date(now)
    currentEnd.setDate(currentEnd.getDate() - 3) // GSC data delay
    const currentStart = new Date(currentEnd)
    currentStart.setDate(currentStart.getDate() - dateRange)
    const priorEnd = new Date(currentStart)
    priorEnd.setDate(priorEnd.getDate() - 1)
    const priorStart = new Date(priorEnd)
    priorStart.setDate(priorStart.getDate() - dateRange)

    const fmt = (d: Date) => d.toISOString().split("T")[0]

    // Current period metrics
    // Paged: one request is capped at 1,000 rows, which undercounted busy sites.
    type Row = { clicks: number; impressions: number; position: number }
    let current: Row[]
    try {
      current = await fetchAllRows<Row>((from, to) =>
        admin
          .from("gsc_data")
          .select("clicks, impressions, position")
          .eq("site_id", siteId)
          .gte("date", fmt(currentStart))
          .lte("date", fmt(currentEnd))
          .order("id")
          .range(from, to)
      )
    } catch {
      return errors.internal("Failed to fetch metrics")
    }

    // Prior period metrics
    const prior = await fetchAllRows<Row>((from, to) =>
      admin
        .from("gsc_data")
        .select("clicks, impressions, position")
        .eq("site_id", siteId)
        .gte("date", fmt(priorStart))
        .lte("date", fmt(priorEnd))
        .order("id")
        .range(from, to)
    ).catch(() => [] as Row[])

    // Striking distance count from materialized view
    const { count: strikingCount } = await admin
      .from("gsc_data")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("position", 5)
      .lte("position", 15)
      .gte("date", fmt(currentStart))
      .lte("date", fmt(currentEnd))

    const aggregate = (rows: typeof current) => {
      if (!rows || rows.length === 0) return { clicks: 0, impressions: 0, avgPosition: 0 }
      const clicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0)
      const impressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0)
      const avgPosition = rows.reduce((sum, r) => sum + (r.position || 0), 0) / rows.length
      return { clicks, impressions, avgPosition: Math.round(avgPosition * 10) / 10 }
    }

    const currentMetrics = aggregate(current)
    const priorMetrics = aggregate(prior || [])

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 1000) / 10
    }

    return successResponse({
      current: currentMetrics,
      prior: priorMetrics,
      strikingDistanceCount: strikingCount || 0,
      changes: {
        clicks: pctChange(currentMetrics.clicks, priorMetrics.clicks),
        impressions: pctChange(currentMetrics.impressions, priorMetrics.impressions),
        avgPosition: pctChange(priorMetrics.avgPosition, currentMetrics.avgPosition), // inverted: lower is better
      },
      dateRange,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch dashboard metrics")
  }
}
