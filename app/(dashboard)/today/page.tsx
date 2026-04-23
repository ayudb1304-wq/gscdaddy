import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { ShippedRecsBand, type ShippedRec } from "@/components/today/shipped-recs-band"
import { MoversBand, type Mover } from "@/components/today/movers-band"
import { TodaysFocusBand, type FocusRec } from "@/components/today/todays-focus-band"
import { TodayEmptyState } from "@/components/today/empty-state"

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
    .select("id, site_url, display_name, sync_status, last_synced_at")
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
    return (
      <div className="space-y-4">
        <Header name={user.name} />
        <TodayEmptyState kind="first-sync" name={user.name} />
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
    // Band 2 source: 9 days of gsc_data to compute 2-day vs 7-day deltas
    admin
      .from("gsc_data")
      .select("site_id, query, page, date, clicks, impressions")
      .in("site_id", siteIds)
      .gte("date", fmt(windowStart))
      .lte("date", fmt(now)),
  ])

  // --- Band 1: shipped recs impact ---
  const baselines = baselinesResult.data || []
  const shippedItems: ShippedRec[] = []

  if (baselines.length > 0) {
    // Fetch post-completion gsc_data for all baselines in one query
    const earliestCompleted = baselines.reduce((min, b) => {
      const d = new Date(b.completed_at)
      return !min || d < min ? d : min
    }, null as Date | null)

    const { data: postData } = earliestCompleted
      ? await admin
          .from("gsc_data")
          .select("site_id, query, page, date, clicks, position")
          .in("site_id", siteIds)
          .gte("date", fmt(earliestCompleted))
      : { data: [] as Array<{ site_id: string; query: string; page: string; date: string; clicks: number; position: number }> }

    const postList = postData || []

    for (const b of baselines) {
      const site = siteById.get(b.site_id)
      if (!site) continue

      const completedAt = new Date(b.completed_at)
      const daysSince = Math.floor((now.getTime() - completedAt.getTime()) / 86_400_000)

      // Baseline window length is always 28 days by construction; defensively
      // compute from start/end so we degrade gracefully if that ever changes.
      const bStart = new Date(b.baseline_start)
      const bEnd = new Date(b.baseline_end)
      const baselineDays = Math.max(
        1,
        Math.round((bEnd.getTime() - bStart.getTime()) / 86_400_000) + 1
      )
      const baselineClicksPerDay = Number(b.baseline_clicks) / baselineDays

      // Filter post-completion data for this (site, query, page)
      const postRows = postList.filter(
        (r) =>
          r.site_id === b.site_id &&
          r.query === b.query &&
          r.page === b.page &&
          new Date(r.date) >= completedAt
      )

      const actual = (() => {
        if (postRows.length === 0 || daysSince < 3) return null
        const distinctDays = new Set(postRows.map((r) => r.date)).size
        if (distinctDays < 3) return null
        const clicks = postRows.reduce((s, r) => s + (r.clicks || 0), 0)
        const position =
          postRows.reduce((s, r) => s + (r.position || 0), 0) / postRows.length
        return {
          clicksPerDay: clicks / distinctDays,
          avgPosition: position,
          daysObserved: distinctDays,
        }
      })()

      shippedItems.push({
        recommendationId: b.recommendation_id,
        siteUrl: site.site_url,
        query: b.query,
        page: b.page,
        daysSinceShipped: daysSince,
        baseline: {
          clicksPerDay: baselineClicksPerDay,
          avgPosition: Number(b.baseline_avg_position),
        },
        actual,
      })
    }
  }

  // --- Band 2: movers (last 2 days vs prior 7) ---
  const moversRaw = moversRawResult.data || []
  const recentCutoff = new Date(now)
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 2)

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
    const rowDate = new Date(row.date)
    if (rowDate >= recentCutoff) {
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
      <ShippedRecsBand items={shippedItems} />
      <MoversBand gainers={gainers} droppers={droppers} />
    </div>
  )
}

function Header({ name }: { name: string | null }) {
  const firstName = name?.split(" ")[0]
  return (
    <div>
      <h1 className="text-2xl font-bold">
        {firstName ? `Good to see you, ${firstName}` : "Today"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Your daily SEO briefing — what shipped, what moved, what&apos;s next.
      </p>
    </div>
  )
}
