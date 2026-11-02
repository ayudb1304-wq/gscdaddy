import { redirect } from "next/navigation"
import { getCurrentUser, getUserSites } from "@/lib/auth"
import { getDailySeries, summarize } from "@/lib/metrics/daily-series"
import { isSyncInProgress } from "@/lib/sync/gsc-sync"
import { createAdminClient } from "@/lib/supabase/admin"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart-lazy"
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

  // Get user's sites to determine which to show (cached: the layout ran the same query)
  const sites = await getUserSites(user.id)

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
  if (isSyncInProgress(site.sync_status, site.sync_started_at) && !site.last_synced_at) {
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
          Start it now; it usually takes a couple of minutes.
        </p>
        <div className="mt-6">
          <SyncRecsBar
            key={site.id}
            siteId={site.id}
            initialSyncStatus={site.sync_status}
            initialLastSyncedAt={site.last_synced_at}
            hasFreshRecs={false}
          />
        </div>
      </div>
    )
  }

  // Fetch dashboard data: 56 days (current 28 + prior 28) ending at the newest
  // day with data (GSC lags 2-3 days, so ending at "today" made every site
  // look like it dropped).
  const dateRange = 28
  const nowIso = new Date().toISOString()
  const [series, opportunitiesResult, recsResult, freshRecsCountResult] = await Promise.all([
    getDailySeries(admin, siteId, dateRange * 2),
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

  const currentPoints = series.points.slice(-dateRange)
  const priorPoints = series.points.slice(0, Math.max(0, series.points.length - dateRange))
  const currentMetrics = summarize(currentPoints)
  const priorMetrics = summarize(priorPoints)
  const hasPrior = priorMetrics.impressions > 0

  const pctChange = (curr: number, prev: number): number | null => {
    // No prior data to compare against: hide the change rather than a fake +100%.
    if (!hasPrior || prev === 0) return null
    return Math.round(((curr - prev) / prev) * 1000) / 10
  }

  // Total from the RPC (the list itself is limited to the top 5)
  const strikingDistanceCount = opportunitiesResult.total

  const metricsData = {
    current: currentMetrics,
    changes: {
      clicks: pctChange(currentMetrics.clicks, priorMetrics.clicks),
      impressions: pctChange(currentMetrics.impressions, priorMetrics.impressions),
      // Position change in positions (current - prior), like GSC. Negative is
      // better. (It was a % with swapped arguments plus an inverted colour, so
      // improving 10 -> 8 showed as a red drop.)
      avgPosition:
        hasPrior && currentMetrics.avgPosition > 0 && priorMetrics.avgPosition > 0
          ? Math.round((currentMetrics.avgPosition - priorMetrics.avgPosition) * 10) / 10
          : null,
    },
    strikingDistanceCount,
  }

  // Chart: one point per day (gap-filled), position weighted by impressions.
  const chartData = currentPoints.map((p) => ({
    date: p.date,
    clicks: p.clicks,
    impressions: p.impressions,
    position: p.impressions > 0 ? Math.round(p.position * 10) / 10 : null,
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
