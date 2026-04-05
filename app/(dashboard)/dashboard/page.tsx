import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { TopOpportunities } from "@/components/dashboard/top-opportunities"
import { RecentRecs } from "@/components/dashboard/recent-recs"

interface DashboardPageProps {
  searchParams: Promise<{ siteId?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { siteId: siteIdParam } = await searchParams
  const admin = createAdminClient()

  // Get user's sites to determine which to show
  const { data: sites } = await admin
    .from("sites")
    .select("id, site_url, sync_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (!sites || sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">No sites connected</h2>
        <p className="mt-2 text-muted-foreground">
          Connect a site from Google Search Console to get started.
        </p>
      </div>
    )
  }

  const siteId = siteIdParam || sites[0].id
  const site = sites.find((s) => s.id === siteId) || sites[0]

  if (site.sync_status === "syncing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="mt-4 text-xl font-semibold">Syncing your data...</h2>
        <p className="mt-2 text-muted-foreground">
          This may take a few minutes. Refresh to check progress.
        </p>
      </div>
    )
  }

  if (site.sync_status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">Waiting for first sync</h2>
        <p className="mt-2 text-muted-foreground">
          Your site data will be synced shortly. Check back in a few minutes.
        </p>
      </div>
    )
  }

  // Fetch dashboard data
  const dateRange = 28
  const now = new Date()
  const endDate = new Date(now)
  const currentStart = new Date(endDate)
  currentStart.setDate(currentStart.getDate() - dateRange)
  const priorEnd = new Date(currentStart)
  priorEnd.setDate(priorEnd.getDate() - 1)
  const priorStart = new Date(priorEnd)
  priorStart.setDate(priorStart.getDate() - dateRange)
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  // Fetch all data in parallel
  const [currentResult, priorResult, chartResult, opportunitiesResult, recsResult] = await Promise.all([
    admin
      .from("gsc_data")
      .select("clicks, impressions, position")
      .eq("site_id", siteId)
      .gte("date", fmt(currentStart))
      .lte("date", fmt(endDate)),
    admin
      .from("gsc_data")
      .select("clicks, impressions, position")
      .eq("site_id", siteId)
      .gte("date", fmt(priorStart))
      .lte("date", fmt(priorEnd)),
    admin
      .from("gsc_data")
      .select("date, clicks, impressions, position")
      .eq("site_id", siteId)
      .gte("date", fmt(currentStart))
      .lte("date", fmt(endDate))
      .order("date", { ascending: true }),
    admin.rpc("get_striking_distance", {
      p_site_id: siteId,
      p_sort_by: "opportunity_score",
      p_sort_order: "desc",
      p_page: 1,
      p_limit: 5,
    }).then((res) => {
      if (res.error) return { data: [] }
      // Map to the shape TopOpportunities expects
      return {
        data: (res.data || []).map((r: { query: string; page: string; avg_position: number; total_impressions: number; opportunity_score: number }) => ({
          query: r.query,
          page: r.page,
          avg_position: Number(r.avg_position),
          total_impressions: Number(r.total_impressions),
          opportunity_score: Math.round(Number(r.opportunity_score)),
        })),
      }
    }),
    admin
      .from("recommendations")
      .select("id, query, recommendation_text, is_completed, created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then((res) => {
        if (res.error) return { data: [] }
        // Map to the shape RecentRecs expects
        return {
          data: (res.data || []).map((r: { id: string; query: string; recommendation_text: string; is_completed: boolean; created_at: string }) => ({
            id: r.id,
            keyword: r.query || "",
            title: r.recommendation_text?.slice(0, 80) || "Recommendation",
            status: r.is_completed ? "completed" : "active",
            created_at: r.created_at,
          })),
        }
      }),
  ])

  const current = currentResult.data || []
  const prior = priorResult.data || []

  const aggregate = (rows: typeof current) => {
    if (rows.length === 0) return { clicks: 0, impressions: 0, avgPosition: 0 }
    const clicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0)
    const impressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0)
    const avgPosition = rows.reduce((sum, r) => sum + (r.position || 0), 0) / rows.length
    return { clicks, impressions, avgPosition: Math.round(avgPosition * 10) / 10 }
  }

  const currentMetrics = aggregate(current)
  const priorMetrics = aggregate(prior)

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 1000) / 10
  }

  // Count striking distance keywords in current period
  const strikingDistanceCount = current.filter(
    (r) => r.position >= 5 && r.position <= 15
  ).length

  const metricsData = {
    current: currentMetrics,
    changes: {
      clicks: pctChange(currentMetrics.clicks, priorMetrics.clicks),
      impressions: pctChange(currentMetrics.impressions, priorMetrics.impressions),
      avgPosition: pctChange(priorMetrics.avgPosition, currentMetrics.avgPosition),
    },
    strikingDistanceCount,
  }

  // Aggregate chart data by date
  const chartRaw = chartResult.data || []
  const byDate = new Map<string, { clicks: number; impressions: number; positions: number[] }>()
  for (const row of chartRaw) {
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
    position:
      Math.round((vals.positions.reduce((a, b) => a + b, 0) / vals.positions.length) * 10) / 10,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Last 28 days performance overview</p>
      </div>

      <MetricsCards data={metricsData} />
      <PerformanceChart data={chartData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopOpportunities data={opportunitiesResult.data || []} />
        <RecentRecs data={recsResult.data || []} />
      </div>
    </div>
  )
}
