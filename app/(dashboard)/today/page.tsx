import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { fetchAllRows } from "@/lib/supabase/fetch-all"
import { createAdminClient } from "@/lib/supabase/admin"
import { ShippedRecsBand, type ShippedRec } from "@/components/today/shipped-recs-band"
import { MoversBand, type Mover } from "@/components/today/movers-band"
import { TodaysFocusBand, type FocusRec } from "@/components/today/todays-focus-band"
import { TodayEmptyState } from "@/components/today/empty-state"
import { isSyncInProgress } from "@/lib/sync/gsc-sync"

/** Days before completion used as the "before" window for shipped-fix impact. */
const BASELINE_DAYS = 28

function fmt(d: Date): string {
  return d.toISOString().split("T")[0]
}

// Deterministic hash so Today's focus rec is stable across the day for a
// given user, but rotates to a new rec tomorrow.
function stableIndex(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h) % Math.max(1, mod)
}

export default async function TodayPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: sitesRaw } = await admin
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const sites = sitesRaw || []
  const siteIds = sites.map((s) => s.id)
  const siteById = new Map(sites.map((s) => [s.id, s]))

  // Empty state: no sites
  if (sites.length === 0) {
    return (
      <div className="space-y-4">
        <Header name={user.name} />
        <TodayEmptyState kind="no-sites" name={user.name} />
      </div>
    )
  }

  // Empty state: first sync still running (no site has ever synced)
  const anySynced = sites.some((s) => s.last_synced_at)
  if (!anySynced) {
    // A failed (or timed-out) first sync used to show "running" forever.
    const stillRunning = sites.some(
      (s) => s.sync_status === "pending" || isSyncInProgress(s.sync_status, s.sync_started_at)
    )
    return (
      <div className="space-y-4">
        <Header name={user.name} />
        <TodayEmptyState kind={stillRunning ? "first-sync" : "first-sync-failed"} name={user.name} />
      </div>
    )
  }

  // Pull everything we need in parallel.
  const now = new Date()

  const [baselinesResult, openRecsResult, moversResult] = await Promise.all([
    // Band 1 source: completed recs that have a baseline snapshot
    admin
      .from("recommendation_baselines")
      .select(
        "recommendation_id, site_id, query, page, baseline_clicks, baseline_impressions, baseline_avg_position, baseline_start, baseline_end, completed_at"
      )
      .in("site_id", siteIds)
      .order("completed_at", { ascending: false })
      .limit(10),
    // Band 3 source: open non-expired recs
    admin
      .from("recommendations")
      .select(
        "id, site_id, type, query, page, priority, recommendation_text, action_items, estimated_traffic_gain, created_at"
      )
      .in("site_id", siteIds)
      .eq("is_completed", false)
      .gt("expires_at", now.toISOString())
      .order("priority", { ascending: true })
      .order("estimated_traffic_gain", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(25),
    // Band 2 source: movers aggregated in SQL (today_movers, migration 018):
    // last 2 days vs the 7 before, per site, anchored to each site's newest day.
    admin.rpc("today_movers", { p_site_ids: siteIds }),
  ])

  // --- Band 1: shipped recs impact ---
  const baselines = baselinesResult.data || []
  const shippedItems: ShippedRec[] = []

  if (baselines.length > 0) {
    // One narrow query per shipped rec (site + query + page + date), covering the 28 days
    // before completion and everything after. Both sides are computed here from the same data
    // with the same maths. The snapshot stored at completion missed the last 2-3 days (GSC
    // lag) and divided by 28 calendar days, which made every fix look like a win.
    const perRec = await Promise.all(
      baselines.map((b) =>
        fetchAllRows<{ site_id: string; query: string; page: string; date: string; clicks: number; impressions: number; position: number }>(
          (from, to) =>
            admin
              .from("gsc_data")
              .select("site_id, query, page, date, clicks, impressions, position")
              .eq("site_id", b.site_id)
              .eq("query", b.query)
              .eq("page", b.page)
              .gte("date", fmt(new Date(new Date(b.completed_at).getTime() - BASELINE_DAYS * 86_400_000)))
              .order("date", { ascending: true })
              .order("id")
              .range(from, to)
        )
      )
    )
    const postList = perRec.flat()

    // Newest data day per site: "after" is measured up to it, in calendar days.
    const shippedSiteIds = [...new Set(baselines.map((b) => b.site_id))]
    const latestEntries = await Promise.all(
      shippedSiteIds.map(async (id) => {
        const { data } = await admin
          .from("gsc_data")
          .select("date")
          .eq("site_id", id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle()
        return [id, data?.date ?? null] as const
      })
    )
    const latestDateBySite = new Map(latestEntries)

    for (const b of baselines) {
      const site = siteById.get(b.site_id)
      if (!site) continue

      const completedAt = new Date(b.completed_at)
      const daysSince = Math.floor((now.getTime() - completedAt.getTime()) / 86_400_000)

      const completedDay = fmt(completedAt)
      const recRows = postList.filter(
        (r) => r.site_id === b.site_id && r.query === b.query && r.page === b.page
      )
      const beforeRows = recRows.filter((r) => r.date < completedDay)
      const postRows = recRows.filter((r) => r.date >= completedDay)

      // Same definition on both sides: clicks per CALENDAR day (GSC only has
      // rows on days with impressions, so dividing by days-with-rows inflated
      // sparse keywords), and impression-weighted position (like GSC).
      const summarize = (rows: typeof recRows, calendarDays: number) => {
        const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0)
        const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0)
        const weighted = rows.reduce((s, r) => s + (r.position || 0) * (r.impressions || 0), 0)
        return {
          clicksPerDay: calendarDays > 0 ? clicks / calendarDays : 0,
          avgPosition: impressions > 0 ? weighted / impressions : null,
        }
      }

      const before = summarize(beforeRows, BASELINE_DAYS)
      const baseline =
        beforeRows.length > 0 && before.avgPosition !== null
          ? { clicksPerDay: before.clicksPerDay, avgPosition: before.avgPosition }
          : {
              // No raw rows left for the window: fall back to the stored snapshot.
              clicksPerDay:
                Number(b.baseline_clicks) /
                Math.max(1, Math.round((new Date(b.baseline_end).getTime() - new Date(b.baseline_start).getTime()) / 86_400_000) + 1),
              avgPosition: Number(b.baseline_avg_position),
            }

      const actual = (() => {
        // Observed window: completion day through the site's newest data day.
        const latest = latestDateBySite.get(b.site_id)
        if (!latest || latest < completedDay) return null
        const observedDays =
          Math.round((new Date(`${latest}T00:00:00Z`).getTime() - new Date(`${completedDay}T00:00:00Z`).getTime()) / 86_400_000) + 1
        if (observedDays < 3) return null
        // No rows after shipping = no impressions: show 0 clicks, not "checking" forever.
        const after = summarize(postRows, observedDays)
        return {
          clicksPerDay: after.clicksPerDay,
          avgPosition: after.avgPosition,
          daysObserved: observedDays,
        }
      })()

      shippedItems.push({
        recommendationId: b.recommendation_id,
        siteUrl: site.site_url,
        query: b.query,
        page: b.page,
        daysSinceShipped: daysSince,
        baseline,
        actual,
      })
    }
  }

  // --- Band 2: movers (last 2 days vs prior 7) ---
  let moverCandidates: Mover[] = []
  if (!moversResult.error && Array.isArray(moversResult.data)) {
    moverCandidates = (moversResult.data as {
      site_id: string
      query: string
      page: string
      recent_clicks: number
      prior_daily_avg: number
      click_delta: number
    }[]).flatMap((m) => {
      const site = siteById.get(m.site_id)
      if (!site) return []
      return [{
        query: m.query,
        page: m.page,
        siteUrl: site.site_url,
        clickDelta: Number(m.click_delta),
        recentClicks: Number(m.recent_clicks),
        priorClicksAvg: Number(m.prior_daily_avg),
      }]
    })
  } else {
    moverCandidates = await legacyMovers(admin, siteIds, siteById)
  }

  const gainers = [...moverCandidates]
    .filter((m) => m.clickDelta > 0)
    .sort((a, b) => b.clickDelta - a.clickDelta)
    .slice(0, 3)
  const droppers = [...moverCandidates]
    .filter((m) => m.clickDelta < 0)
    .sort((a, b) => a.clickDelta - b.clickDelta)
    .slice(0, 3)

  // --- Band 3: today's focus (deterministic pick, stable per day) ---
  const openRecs = openRecsResult.data || []
  // The DB sort above favors priority via text asc (high < low < medium alphabetically),
  // which isn't semantic. Re-sort in JS with a priority rank.
  const rank = (p: string | null) => (p === "high" ? 0 : p === "medium" ? 1 : 2)
  const ranked = [...openRecs].sort((a, b) => {
    const dp = rank(a.priority) - rank(b.priority)
    if (dp !== 0) return dp
    const dt = (b.estimated_traffic_gain || 0) - (a.estimated_traffic_gain || 0)
    if (dt !== 0) return dt
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const topCandidates = ranked.slice(0, Math.min(5, ranked.length))
  const focusRecRaw =
    topCandidates.length > 0
      ? topCandidates[stableIndex(`${user.id}-${fmt(now)}`, topCandidates.length)]
      : null

  const focus: FocusRec | null = focusRecRaw
    ? {
        id: focusRecRaw.id,
        siteUrl: siteById.get(focusRecRaw.site_id)?.site_url || "",
        type: focusRecRaw.type,
        query: focusRecRaw.query,
        page: focusRecRaw.page,
        priority: focusRecRaw.priority,
        recommendationText: focusRecRaw.recommendation_text,
        actionItems: Array.isArray(focusRecRaw.action_items)
          ? (focusRecRaw.action_items as string[])
          : [],
        estimatedTrafficGain: focusRecRaw.estimated_traffic_gain,
      }
    : null

  // If every band is empty, show a friendly catch-all with a main CTA
  // instead of three empty cards.
  const allEmpty =
    shippedItems.length === 0 &&
    gainers.length === 0 &&
    droppers.length === 0 &&
    focus === null

  if (allEmpty) {
    return (
      <div className="space-y-4">
        <Header name={user.name} />
        <TodayEmptyState kind="no-data-yet" name={user.name} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header name={user.name} />
      <TodaysFocusBand rec={focus} />
      <div className="grid items-start gap-6 xl:grid-cols-[1.45fr_1fr]">
        <ShippedRecsBand items={shippedItems} />
        <MoversBand gainers={gainers} droppers={droppers} />
      </div>
    </div>
  )
}

function Header({ name }: { name: string | null }) {
  const firstName = name?.split(" ")[0]
  return (
    <div>
      <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">
        {firstName ? `Good to see you, ${firstName}` : "Today"}
      </h1>
      <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
        Your daily briefing: what you shipped, what moved, and the one page to work on next.
      </p>
    </div>
  )
}

/**
 * Movers computed in JS from raw rows; only used until migration 018 adds the
 * today_movers RPC. Same definition: last 2 days vs the 7 before, per site,
 * anchored to the site's newest day, prior average per calendar day.
 */
async function legacyMovers(
  admin: ReturnType<typeof createAdminClient>,
  siteIds: string[],
  siteById: Map<string, { site_url: string }>
): Promise<Mover[]> {
  const windowStart = new Date(Date.now() - 12 * 86_400_000).toISOString().split("T")[0]
  const rows = await fetchAllRows<{ site_id: string; query: string; page: string; date: string; clicks: number; impressions: number }>(
    (from, to) =>
      admin
        .from("gsc_data")
        .select("site_id, query, page, date, clicks, impressions")
        .in("site_id", siteIds)
        .gte("date", windowStart)
        .order("date", { ascending: true })
        .order("id")
        .range(from, to)
  )
  const latestBySite = new Map<string, string>()
  for (const r of rows) {
    const cur = latestBySite.get(r.site_id)
    if (!cur || r.date > cur) latestBySite.set(r.site_id, r.date)
  }
  const shift = (d: string, n: number) => new Date(new Date(`${d}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().split("T")[0]
  type B = { siteId: string; query: string; page: string; recent: number; prior: number; priorImpr: number; priorDays: Set<string> }
  const buckets = new Map<string, B>()
  for (const r of rows) {
    const latest = latestBySite.get(r.site_id)!
    if (r.date <= shift(latest, -9)) continue
    const k = `${r.site_id}|${r.query}|${r.page}`
    const b = buckets.get(k) ?? { siteId: r.site_id, query: r.query, page: r.page, recent: 0, prior: 0, priorImpr: 0, priorDays: new Set<string>() }
    if (r.date > shift(latest, -2)) b.recent += r.clicks || 0
    else {
      b.prior += r.clicks || 0
      b.priorImpr += r.impressions || 0
      b.priorDays.add(r.date)
    }
    buckets.set(k, b)
  }
  const out: Mover[] = []
  for (const b of buckets.values()) {
    if (b.priorDays.size < 3 || b.priorImpr < 50) continue
    const priorDailyAvg = b.prior / 7
    const delta = b.recent - priorDailyAvg * 2
    if (Math.abs(delta) < 3) continue
    const site = siteById.get(b.siteId)
    if (!site) continue
    out.push({ query: b.query, page: b.page, siteUrl: site.site_url, clickDelta: delta, recentClicks: b.recent, priorClicksAvg: priorDailyAvg })
  }
  return out
}
