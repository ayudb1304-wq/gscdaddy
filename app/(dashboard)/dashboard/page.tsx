import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { fetchAllRows } from "@/lib/supabase/fetch-all"
import { createAdminClient } from "@/lib/supabase/admin"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { TopOpportunities } from "@/components/dashboard/top-opportunities"
import { RecentRecs } from "@/components/dashboard/recent-recs"
import { SyncRecsBar } from "@/components/dashboard/sync-recs-bar"

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
    .select("id, site_url, sync_status, last_synced_at")
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

  // Only ever query a site the user owns: the admin client below bypasses RLS.
  const site = sites.find((s) => s.id === siteIdParam) || sites[0]
  const siteId = site.id

  // Only show the full-page "syncing" placeholder for a site's FIRST sync
  // (when there's no prior data to display). For subsequent re-syncs triggered
  // from the SyncRecsBar, we keep the dashboard visible with stale data so the
  // user retains context while the background sync runs.
  if (site.sync_status === "syncing" && !site.last_synced_at) {
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
  // GSC data lags 2-3 days, so anchor the window to the newest day we actually
  // have. Ending at "today" left the current window with ~3 empty days while
  // the prior window was complete, so every site showed a fake ~10% drop.
  const dateRange = 28
  const { data: latestRow } = await admin
    .from("gsc_data")
    .select("date")
    .eq("site_id", siteId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()
  const endDate = latestRow?.date ? new Date(`${latestRow.date}T00:00:00Z`) : new Date()
  const currentStart = new Date(endDate)
  currentStart.setUTCDate(currentStart.getUTCDate() - (dateRange - 1))
  const priorEnd = new Date(currentStart)
  priorEnd.setUTCDate(priorEnd.getUTCDate() - 1)
  const priorStart = new Date(priorEnd)
  priorStart.setUTCDate(priorStart.getUTCDate() - (dateRange - 1))
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  // Fetch all data in parallel
  const nowIso = new Date().toISOString()
  const [currentResult, priorResult, , opportunitiesResult, recsResult, freshRecsCountResult] = await Promise.all([
    // Paged: a single request is capped at 1,000 rows, which undercounted busy sites.
    fetchAllRows<{ date: string; clicks: number; impressions: number; position: number }>((from, to) =>
      admin
        .from("gsc_data")
        .select("date, clicks, impressions, position")
        .eq("site_id", siteId)
        .gte("date", fmt(currentStart))
        .lte("date", fmt(endDate))
        .order("date", { ascending: true })
        .order("id")
        .range(from, to)
    ).then((data) => ({ data })),
    fetchAllRows<{ clicks: number; impressions: number; position: number }>((from, to) =>
      admin
        .from("gsc_data")
        .select("clicks, impressions, position")
        .eq("site_id", siteId)
        .gte("date", fmt(priorStart))
        .lte("date", fmt(priorEnd))
        .order("id")
        .range(from, to)
    ).then((data) => ({ data })),
    Promise.resolve(null),
    admin.rpc("get_striking_distance", {
      p_site_id: siteId,
      p_sort_by: "opportunity_score",
      p_sort_order: "desc",
      p_page: 1,
      p_limit: 5,
    }).then((res) => {
      if (res.error) return { data: [], total: 0 }
      // Map to the shape TopOpportunities expects
      return {
        total: Number(res.data?.[0]?.total_count ?? 0),
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
    // Count non-expired recommendations for this site so SyncRecsBar can decide
    // whether to show the prominent "Generate AI recommendations" CTA.
    admin
      .from("recommendations")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gt("expires_at", nowIso),
  ])

  const current = currentResult.data || []
  const prior = priorResult.data || []

  const aggregate = (rows: { clicks: number; impressions: number; position: number }[]) => {
    if (rows.length === 0) return { clicks: 0, impressions: 0, avgPosition: 0 }
    const clicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0)
    const impressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0)
    // Impression-weighted, like GSC: a plain mean lets long-tail rows with a
    // handful of impressions drag the site average down.
    const weighted = rows.reduce((sum, r) => sum + (r.position || 0) * (r.impressions || 0), 0)
    const avgPosition = impressions > 0
      ? weighted / impressions
      : rows.reduce((sum, r) => sum + (r.position || 0), 0) / rows.length
    return { clicks, impressions, avgPosition: Math.round(avgPosition * 10) / 10 }
  }

  const currentMetrics = aggregate(current)
  const priorMetrics = aggregate(prior)

  const pctChange = (curr: number, prev: number): number | null => {
    // No prior data to compare against: show "New" rather than a fake +100%.
    if (prev === 0) return curr > 0 ? null : 0
    return Math.round(((curr - prev) / prev) * 1000) / 10
  }

  // Total from the RPC (the list itself is limited to the top 5)
  const strikingDistanceCount = opportunitiesResult.total

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
  // The chart uses the same paged rows as the totals (already ordered by date).
  const chartRaw = currentResult.data || []
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

  const hasFreshRecs = (freshRecsCountResult.count || 0) > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">Dashboard</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">How your site did in Google over the last 28 days.</p>
        </div>
        <SyncRecsBar
          key={site.id}
          siteId={site.id}
          initialSyncStatus={site.sync_status}
          initialLastSyncedAt={site.last_synced_at}
          hasFreshRecs={hasFreshRecs}
        />
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
