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
  const windowStart = new Date(now)
  windowStart.setUTCDate(windowStart.getUTCDate() - 9)

  const [baselinesResult, openRecsResult, moversRawResult] = await Promise.all([
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
    // Band 2 source: 9 days of gsc_data to compute 2-day vs 7-day deltas.
    // Paged: a real site easily has more than PostgREST's 1,000-row cap in 9 days.
    fetchAllRows<{ site_id: string; query: string; page: string; date: string; clicks: number; impressions: number }>(
      (from, to) =>
        admin
          .from("gsc_data")
          .select("site_id, query, page, date, clicks, impressions")
          .in("site_id", siteIds)
          .gte("date", fmt(windowStart))
          .lte("date", fmt(now))
          .order("date", { ascending: true })
          .order("id")
          .range(from, to)
    ).then((data) => ({ data })),
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

      // Same definition on both sides: clicks per day that has data, and
      // impression-weighted position (like GSC).
      const summarize = (rows: typeof recRows) => {
        const days = new Set(rows.map((r) => r.date)).size
        const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0)
        const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0)
        const weighted = rows.reduce((s, r) => s + (r.position || 0) * (r.impressions || 0), 0)
        const avgPosition =
          impressions > 0 ? weighted / impressions : rows.reduce((s, r) => s + (r.position || 0), 0) / Math.max(1, rows.length)
        return { days, clicksPerDay: days > 0 ? clicks / days : 0, avgPosition }
      }

      const before = summarize(beforeRows)
      const baseline =
        before.days > 0
          ? { clicksPerDay: before.clicksPerDay, avgPosition: before.avgPosition }
          : {
              // No raw rows left for the window: fall back to the stored snapshot.
              clicksPerDay:
                Number(b.baseline_clicks) /
                Math.max(1, Math.round((new Date(b.baseline_end).getTime() - new Date(b.baseline_start).getTime()) / 86_400_000) + 1),
              avgPosition: Number(b.baseline_avg_position),
            }

      const actual = (() => {
        if (postRows.length === 0 || daysSince < 3) return null
        const after = summarize(postRows)
        if (after.days < 3) return null
        return {
          clicksPerDay: after.clicksPerDay,
          avgPosition: after.avgPosition,
          daysObserved: after.days,
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
  const moversRaw = moversRawResult.data || []
  // Search Console data lags 2–3 days, so "the last 2 days" means the 2 newest days each site
  // actually has data for. Counting back from now left the recent window empty and showed
  // every keyword as a drop.
  const latestBySite = new Map<string, string>()
  for (const row of moversRaw) {
    const cur = latestBySite.get(row.site_id)
    if (!cur || row.date > cur) latestBySite.set(row.site_id, row.date)
  }
  const recentCutoffBySite = new Map<string, string>()
  for (const [siteId, latest] of latestBySite) {
    const d = new Date(`${latest}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - 1)
    recentCutoffBySite.set(siteId, fmt(d))
  }

  type Bucket = {
    key: string
    siteId: string
    query: string
    page: string
    recentClicks: number
    priorClicks: number
    priorDays: Set<string>
    priorImpressions: number
  }
  const buckets = new Map<string, Bucket>()

  for (const row of moversRaw) {
    const k = `${row.site_id}|${row.query}|${row.page}`
    let b = buckets.get(k)
    if (!b) {
      b = {
        key: k,
        siteId: row.site_id,
        query: row.query,
        page: row.page,
        recentClicks: 0,
        priorClicks: 0,
        priorDays: new Set(),
        priorImpressions: 0,
      }
      buckets.set(k, b)
    }
    if (row.date >= (recentCutoffBySite.get(row.site_id) ?? row.date)) {
      b.recentClicks += row.clicks || 0
    } else {
      b.priorClicks += row.clicks || 0
      b.priorImpressions += row.impressions || 0
      b.priorDays.add(row.date)
    }
  }

  const moverCandidates: Mover[] = []
  for (const b of buckets.values()) {
    // Need a meaningful prior window and volume to be signal, not noise
    if (b.priorDays.size < 3 || b.priorImpressions < 50) continue
    const priorDailyAvg = b.priorClicks / b.priorDays.size
    const expectedRecent = priorDailyAvg * 2 // recent window is ~2 days
    const delta = b.recentClicks - expectedRecent
    if (Math.abs(delta) < 3) continue
    const site = siteById.get(b.siteId)
    if (!site) continue
    moverCandidates.push({
      query: b.query,
      page: b.page,
      siteUrl: site.site_url,
      clickDelta: delta,
      recentClicks: b.recentClicks,
      priorClicksAvg: priorDailyAvg,
    })
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

