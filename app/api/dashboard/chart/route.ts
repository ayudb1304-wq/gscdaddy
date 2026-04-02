import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

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
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() - 3)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - dateRange)

    const fmt = (d: Date) => d.toISOString().split("T")[0]

    // Fetch raw data grouped by date
    const { data, error } = await admin
      .from("gsc_data")
      .select("date, clicks, impressions, position")
      .eq("site_id", siteId)
      .gte("date", fmt(startDate))
      .lte("date", fmt(endDate))
      .order("date", { ascending: true })

    if (error) return errors.internal("Failed to fetch chart data")

    // Aggregate by date
    const byDate = new Map<string, { clicks: number; impressions: number; positions: number[]; }>()

    for (const row of data || []) {
      const existing = byDate.get(row.date) || { clicks: 0, impressions: 0, positions: [] }
      existing.clicks += row.clicks || 0
      existing.impressions += row.impressions || 0
      existing.positions.push(row.position || 0)
      byDate.set(row.date, existing)
    }

    const chartData = Array.from(byDate.entries()).map(([date, vals]) => ({
      date,
      clicks: vals.clicks,
      impressions: vals.impressions,
      position: Math.round((vals.positions.reduce((a, b) => a + b, 0) / vals.positions.length) * 10) / 10,
    }))

    return successResponse(chartData)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch chart data")
  }
}
