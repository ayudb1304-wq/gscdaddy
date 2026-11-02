import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { render } from "@react-email/components"
import { WeeklySummaryEmail, getWeeklySummarySubject } from "../lib/email/templates/weekly-summary"
import { TrialEndingEmail, getTrialEndingSubject } from "../lib/email/templates/trial-ending"
import { TrialExpiredEmail, getTrialExpiredSubject } from "../lib/email/templates/trial-expired"
import { NudgeRecommendationsEmail, getNudgeRecommendationsSubject } from "../lib/email/templates/nudge-recommendations"
import { applyUnsubscribe } from "../lib/email/unsubscribe"
import { fetchAllRows } from "../lib/supabase/fetch-all"
import { checkAccess, type AccessUser } from "../lib/billing/access"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function send(to: string, subject: string, element: React.ReactElement, userId: string) {
  // Signed one-click unsubscribe link in the footer + List-Unsubscribe headers.
  const { html, headers } = applyUnsubscribe(await render(element), userId)
  // Resend allows ~2 requests/second: pace sends and retry a rate-limit once.
  for (let attempt = 1; ; attempt++) {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html, headers })
    await sleep(600)
    if (!error) return
    if (attempt < 3 && /rate|429|too many/i.test(error.message)) {
      await sleep(1500 * attempt)
      continue
    }
    throw new Error(error.message)
  }
}

type EmailUser = AccessUser & { id: string; email: string; name: string | null }

/**
 * Subscribed (not unsubscribed) users with access, paged, with their
 * subscriptions embedded: one query instead of one per user, and no silent
 * cut-off at 1,000 users.
 */
async function emailableUsers(filter?: (q: ReturnType<typeof usersQuery>) => ReturnType<typeof usersQuery>): Promise<EmailUser[]> {
  const users = await fetchAllRows<EmailUser>((from, to) => {
    const q = usersQuery()
    return (filter ? filter(q) : q).order("id").range(from, to)
  })
  return users.filter((u) => checkAccess(u).hasAccess)
}

function usersQuery() {
  return admin
    .from("users")
    .select("id, email, name, trial_ends_at, created_at, subscriptions(status, plan, updated_at)")
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")
}

const siteDisplayName = (site: { display_name: string | null; site_url: string }) =>
  site.display_name || site.site_url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")

/** Striking-distance keywords via the RPC (the materialized view lives in the private schema). */
async function getStrikingDistance(siteId: string, limit: number) {
  const { data, error } = await admin.rpc("get_striking_distance", {
    p_site_id: siteId,
    p_sort_by: "opportunity_score",
    p_sort_order: "desc",
    p_page: 1,
    p_limit: limit,
    p_search: null,
    p_min_impressions: null,
    p_min_position: null,
    p_max_position: null,
  })
  if (error) throw new Error(`get_striking_distance failed: ${error.message}`)
  const rows = (data || []) as { query: string; avg_position: number; total_impressions: number; opportunity_score: number; total_count: number }[]
  return { rows, total: Number(rows[0]?.total_count ?? 0) }
}

/** Newest date with GSC data for a site (GSC lags 2-3 days, so "now" isn't it). */
async function getLatestDataDate(siteId: string): Promise<Date | null> {
  const { data } = await admin.from("gsc_data").select("date").eq("site_id", siteId).order("date", { ascending: false }).limit(1).maybeSingle()
  return data?.date ? new Date(`${data.date}T00:00:00Z`) : null
}

const isoDay = (d: Date) => d.toISOString().split("T")[0]
const daysBefore = (d: Date, n: number) => new Date(d.getTime() - n * 86400000)

async function main() {
  const now = new Date()
  const results = { weeklySent: 0, trialEndingSent: 0, trialExpiredSent: 0, nudgeSent: 0 }

  // --- WEEKLY SUMMARY (Sundays only) ---
  if (now.getUTCDay() === 0) {
    console.log("Sunday — sending weekly summaries...")
    results.weeklySent = await sendWeeklySummaries(now)
  } else {
    console.log("Not Sunday — skipping weekly summaries")
  }

  // --- TRIAL ENDING ---
  console.log("Checking trial-ending users...")
  results.trialEndingSent = await sendTrialEndingEmails(now)

  // --- TRIAL EXPIRED ---
  console.log("Checking trial-expired users...")
  results.trialExpiredSent = await sendTrialExpiredEmails(now)

  // --- NUDGE: data synced + opportunities but no recommendations ---
  console.log("Checking for users to nudge...")
  results.nudgeSent = await sendNudgeRecommendationsEmails(now)

  console.log("\nResults:", results)
}

async function sendWeeklySummaries(now: Date) {
  let sent = 0

  const activeUsers = await emailableUsers()
  if (!activeUsers.length) return 0

  for (const user of activeUsers) {
    const { data: sites } = await admin
      .from("sites")
      .select("id, site_url, display_name")
      .eq("user_id", user.id)
      .eq("sync_status", "completed")

    if (!sites?.length) continue

    for (const site of sites) {
      try {
        const [traffic, keywords, movers, recsCount] = await Promise.all([
          getTrafficSnapshot(site.id),
          getTopKeywords(site.id),
          getPositionMovers(site.id),
          getRecsCompleted(site.id),
        ])

        const siteName = siteDisplayName(site)

        await send(
          user.email,
          getWeeklySummarySubject(siteName),
          WeeklySummaryEmail({
            userName: user.name || user.email,
            siteName,
            totalClicks: traffic.clicks,
            totalImpressions: traffic.impressions,
            avgPosition: traffic.avgPosition,
            topKeywords: keywords,
            positionMovers: movers,
            recsCompletedCount: recsCount,
          }),
          user.id
        )

        console.log(`  ✓ Weekly summary sent to ${user.email} for ${siteName}`)
        sent++
      } catch (err) {
        console.error(`  ✗ Weekly summary failed for ${user.email}:`, err)
      }
    }
  }

  return sent
}

async function sendTrialEndingEmails(now: Date) {
  let sent = 0

  // Anyone whose trial ends within 3 days and hasn't had this email yet (a
  // 24-hour window meant one missed run skipped people for good).
  const twoDays = now.toISOString()
  const threeDays = new Date(now.getTime() + 3 * 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name, trial_ends_at")
    .gte("trial_ends_at", twoDays)
    .lte("trial_ends_at", threeDays)
    .is("trial_ending_email_sent_at", null)
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) { console.log("  No trial-ending users"); return 0 }

  for (const user of users) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (sub) continue

    try {
      const [sitesCount, keywordsCount, recsCount] = await Promise.all([
        getUserSitesCount(user.id),
        getUserKeywordsCount(user.id),
        getUserRecsCount(user.id),
      ])

      const trialEnd = new Date(user.trial_ends_at)
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000)

      await send(
        user.email,
        getTrialEndingSubject(),
        TrialEndingEmail({
          userName: user.name || user.email,
          daysLeft,
          trialEndDate: trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          keywordsTracked: keywordsCount,
          recsGenerated: recsCount,
          sitesConnected: sitesCount,
        }),
        user.id
      )

      await admin.from("users").update({ trial_ending_email_sent_at: new Date().toISOString() }).eq("id", user.id)
      console.log(`  ✓ Trial ending email sent to ${user.email}`)
      sent++
    } catch (err) {
      console.error(`  ✗ Trial ending failed for ${user.email}:`, err)
    }
  }

  return sent
}

async function sendTrialExpiredEmails(now: Date) {
  let sent = 0

  // Look back 3 days so a missed run still catches people; the sent-at column
  // makes it send exactly once.
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name")
    .gte("trial_ends_at", threeDaysAgo)
    .lte("trial_ends_at", now.toISOString())
    .is("trial_expired_email_sent_at", null)
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) { console.log("  No trial-expired users"); return 0 }

  for (const user of users) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (sub) continue

    try {
      const [keywordsCount, recsCount] = await Promise.all([
        getUserKeywordsCount(user.id),
        getUserRecsCount(user.id),
      ])

      await send(
        user.email,
        getTrialExpiredSubject(),
        TrialExpiredEmail({
          userName: user.name || user.email,
          keywordsTracked: keywordsCount,
          recsGenerated: recsCount,
        }),
        user.id
      )

      await admin.from("users").update({ trial_expired_email_sent_at: new Date().toISOString() }).eq("id", user.id)
      console.log(`  ✓ Trial expired email sent to ${user.email}`)
      sent++
    } catch (err) {
      console.error(`  ✗ Trial expired failed for ${user.email}:`, err)
    }
  }

  return sent
}

// --- Nudge: recommendations not generated ---

async function sendNudgeRecommendationsEmails(now: Date) {
  let sent = 0

  // Users who signed up more than 24 hours ago
  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString()

  const users = await emailableUsers((q) => q.lte("created_at", oneDayAgo))
  if (!users.length) { console.log("  No users to nudge"); return 0 }

  for (const user of users) {
    // Get completed sites that haven't been nudged yet
    const { data: sites } = await admin
      .from("sites")
      .select("id, site_url, display_name")
      .eq("user_id", user.id)
      .eq("sync_status", "completed")
      .is("nudge_email_sent_at", null)

    if (!sites?.length) continue

    for (const site of sites) {
      try {
        // Skip if recommendations already exist
        const { count: recsCount } = await admin
          .from("recommendations")
          .select("*", { count: "exact", head: true })
          .eq("site_id", site.id)

        if (recsCount && recsCount > 0) continue

        // Check for striking distance keywords. (This used to read the
        // materialized view directly, which isn't exposed to the API, so the
        // query always failed and the nudge never sent.)
        const { rows: keywords, total: totalOpportunities } = await getStrikingDistance(site.id, 1)
        if (!keywords.length || totalOpportunities === 0) continue

        const topKw = keywords[0]
        const siteName = siteDisplayName(site)

        await send(
          user.email,
          getNudgeRecommendationsSubject(siteName),
          NudgeRecommendationsEmail({
            userName: user.name || user.email,
            siteName,
            topKeyword: topKw.query,
            topKeywordPosition: Number(topKw.avg_position),
            topKeywordImpressions: Number(topKw.total_impressions),
            totalOpportunities,
          }),
          user.id
        )

        // Mark as nudged so we don't send again
        await admin.from("sites").update({ nudge_email_sent_at: new Date().toISOString() }).eq("id", site.id)

        console.log(`  ✓ Nudge email sent to ${user.email} for ${siteName} (${totalOpportunities} opportunities)`)
        sent++
      } catch (err) {
        console.error(`  ✗ Nudge failed for ${user.email}:`, err)
      }
    }
  }

  return sent
}

// --- Data helpers ---

async function getTrafficSnapshot(siteId: string) {
  // Last 7 days of data we actually have, paged past the 1,000-row cap.
  const latest = await getLatestDataDate(siteId)
  if (!latest) return { clicks: 0, impressions: 0, avgPosition: 0 }
  const data = await fetchAllRows<{ clicks: number; impressions: number; position: number }>((from, to) =>
    admin.from("gsc_data").select("clicks, impressions, position").eq("site_id", siteId)
      .gte("date", isoDay(daysBefore(latest, 6))).lte("date", isoDay(latest))
      .order("id").range(from, to)
  )
  if (!data.length) return { clicks: 0, impressions: 0, avgPosition: 0 }
  const clicks = data.reduce((sum, r) => sum + (r.clicks || 0), 0)
  const impressions = data.reduce((sum, r) => sum + (r.impressions || 0), 0)
  // Impression-weighted, like GSC.
  const weighted = data.reduce((sum, r) => sum + Number(r.position || 0) * (r.impressions || 0), 0)
  const avgPosition = impressions > 0 ? weighted / impressions : 0
  return { clicks, impressions, avgPosition }
}

async function getTopKeywords(siteId: string) {
  const { rows } = await getStrikingDistance(siteId, 5)
  return rows.map((kw) => ({ query: kw.query, position: Number(kw.avg_position), opportunityScore: Number(kw.opportunity_score), impressions: Number(kw.total_impressions) }))
}

async function getPositionMovers(siteId: string) {
  const latest = await getLatestDataDate(siteId)
  if (!latest) return []
  const thisWeekStart = isoDay(daysBefore(latest, 6))
  const lastWeekStart = isoDay(daysBefore(latest, 13))
  const data = await fetchAllRows<{ query: string; date: string; position: number; impressions: number }>((from, to) =>
    admin.from("gsc_data").select("query, date, position, impressions").eq("site_id", siteId)
      .gte("date", lastWeekStart).lte("date", isoDay(latest))
      .order("id").range(from, to)
  )
  if (!data.length) return []
  // Impression-weighted position per query per week.
  type Acc = { weighted: number; impressions: number }
  const thisWeek = new Map<string, Acc>()
  const lastWeek = new Map<string, Acc>()
  for (const row of data) {
    const bucket = row.date >= thisWeekStart ? thisWeek : lastWeek
    const acc = bucket.get(row.query) || { weighted: 0, impressions: 0 }
    acc.weighted += Number(row.position) * row.impressions
    acc.impressions += row.impressions
    bucket.set(row.query, acc)
  }
  const movers: { query: string; direction: "up" | "down"; change: number; currentPosition: number }[] = []
  // Volume threshold on the week's total, after aggregating (filtering daily
  // rows under 10 impressions first skewed the averages toward busy days).
  for (const [query, acc] of thisWeek) {
    const before = lastWeek.get(query)
    if (!before || acc.impressions < 10 || before.impressions < 10) continue
    const avgNow = acc.weighted / acc.impressions
    const avgBefore = before.weighted / before.impressions
    const change = avgBefore - avgNow
    if (Math.abs(change) >= 1) movers.push({ query, direction: change > 0 ? "up" : "down", change: Math.abs(change), currentPosition: avgNow })
  }
  movers.sort((a, b) => b.change - a.change)
  return movers.slice(0, 5)
}

async function getRecsCompleted(siteId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { count } = await admin.from("recommendations").select("*", { count: "exact", head: true }).eq("site_id", siteId).eq("is_completed", true).gte("completed_at", sevenDaysAgo)
  return count || 0
}

async function getUserSitesCount(userId: string) {
  const { count } = await admin.from("sites").select("*", { count: "exact", head: true }).eq("user_id", userId)
  return count || 0
}

/** Distinct keywords (queries) with data in the last ~28 days. It counted query x page x day rows (~300 keywords showed as ~23,000). */
async function getUserKeywordsCount(userId: string) {
  const { data, error } = await admin.rpc("count_user_keywords", { p_user_id: userId })
  if (!error && data !== null) return Number(data)
  // Before migration 018: distinct queries from the striking-distance view's sites, best effort.
  const { data: sites } = await admin.from("sites").select("id").eq("user_id", userId)
  let total = 0
  for (const s of sites ?? []) total += (await getStrikingDistance(s.id, 1)).total
  return total
}

async function getUserRecsCount(userId: string) {
  const { data: sites } = await admin.from("sites").select("id").eq("user_id", userId)
  if (!sites?.length) return 0
  const { count } = await admin.from("recommendations").select("*", { count: "exact", head: true }).in("site_id", sites.map((s) => s.id))
  return count || 0
}

main()
