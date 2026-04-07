import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { render } from "@react-email/components"
import { WeeklySummaryEmail, getWeeklySummarySubject } from "../lib/email/templates/weekly-summary"
import { TrialEndingEmail, getTrialEndingSubject } from "../lib/email/templates/trial-ending"
import { TrialExpiredEmail, getTrialExpiredSubject } from "../lib/email/templates/trial-expired"
import { NudgeRecommendationsEmail, getNudgeRecommendationsSubject } from "../lib/email/templates/nudge-recommendations"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"

async function send(to: string, subject: string, element: React.ReactElement) {
  const html = await render(element)
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(error.message)
}

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

  const { data: users } = await admin
    .from("users")
    .select("id, email, name, trial_ends_at")
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) return 0

  // Filter to users with active access
  const activeUsers = []
  for (const user of users) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    const hasActiveSub = !!sub
    const hasActiveTrial = user.trial_ends_at && new Date(user.trial_ends_at) > now

    if (hasActiveSub || hasActiveTrial) activeUsers.push(user)
  }

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

        const siteName = site.display_name || site.site_url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")

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
          })
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

  const twoDays = new Date(now.getTime() + 2 * 86400000).toISOString()
  const threeDays = new Date(now.getTime() + 3 * 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name, trial_ends_at")
    .gte("trial_ends_at", twoDays)
    .lte("trial_ends_at", threeDays)
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
        })
      )

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

  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name")
    .gte("trial_ends_at", oneDayAgo)
    .lte("trial_ends_at", now.toISOString())
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
        })
      )

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

  const { data: users } = await admin
    .from("users")
    .select("id, email, name, trial_ends_at")
    .lte("created_at", oneDayAgo)
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) { console.log("  No users to nudge"); return 0 }

  for (const user of users) {
    // Must have active access
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    const hasActiveSub = !!sub
    const hasActiveTrial = user.trial_ends_at && new Date(user.trial_ends_at) > now
    if (!hasActiveSub && !hasActiveTrial) continue

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

        // Check for striking distance keywords
        const { data: keywords } = await admin
          .from("striking_distance_keywords")
          .select("query, avg_position, total_impressions, opportunity_score")
          .eq("site_id", site.id)
          .order("opportunity_score", { ascending: false })
          .limit(1)

        if (!keywords?.length) continue

        const { count: totalOpportunities } = await admin
          .from("striking_distance_keywords")
          .select("*", { count: "exact", head: true })
          .eq("site_id", site.id)

        if (!totalOpportunities || totalOpportunities === 0) continue

        const topKw = keywords[0]
        const siteName = site.display_name || site.site_url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")

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
          })
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
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  const { data } = await admin.from("gsc_data").select("clicks, impressions, position").eq("site_id", siteId).gte("date", sevenDaysAgo)
  if (!data?.length) return { clicks: 0, impressions: 0, avgPosition: 0 }
  const clicks = data.reduce((sum, r) => sum + (r.clicks || 0), 0)
  const impressions = data.reduce((sum, r) => sum + (r.impressions || 0), 0)
  const avgPosition = data.reduce((sum, r) => sum + Number(r.position || 0), 0) / data.length
  return { clicks, impressions, avgPosition }
}

async function getTopKeywords(siteId: string) {
  const { data } = await admin.from("striking_distance_keywords").select("query, avg_position, total_impressions, opportunity_score").eq("site_id", siteId).order("opportunity_score", { ascending: false }).limit(5)
  return (data || []).map((kw) => ({ query: kw.query, position: Number(kw.avg_position), opportunityScore: Number(kw.opportunity_score), impressions: Number(kw.total_impressions) }))
}

async function getPositionMovers(siteId: string) {
  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString().split("T")[0]
  const fourteenDaysAgo = new Date(now - 14 * 86400000).toISOString().split("T")[0]
  const { data } = await admin.from("gsc_data").select("query, date, position").eq("site_id", siteId).gte("date", fourteenDaysAgo).gte("impressions", 10)
  if (!data?.length) return []
  const thisWeek = new Map<string, number[]>()
  const lastWeek = new Map<string, number[]>()
  for (const row of data) {
    const bucket = row.date >= sevenDaysAgo ? thisWeek : lastWeek
    const positions = bucket.get(row.query) || []
    positions.push(Number(row.position))
    bucket.set(row.query, positions)
  }
  const movers: { query: string; direction: "up" | "down"; change: number; currentPosition: number }[] = []
  for (const [query, positions] of thisWeek) {
    const lastPositions = lastWeek.get(query)
    if (!lastPositions) continue
    const avgNow = positions.reduce((a, b) => a + b, 0) / positions.length
    const avgBefore = lastPositions.reduce((a, b) => a + b, 0) / lastPositions.length
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

async function getUserKeywordsCount(userId: string) {
  const { data: sites } = await admin.from("sites").select("id").eq("user_id", userId)
  if (!sites?.length) return 0
  const { count } = await admin.from("gsc_data").select("query", { count: "exact", head: true }).in("site_id", sites.map((s) => s.id))
  return count || 0
}

async function getUserRecsCount(userId: string) {
  const { data: sites } = await admin.from("sites").select("id").eq("user_id", userId)
  if (!sites?.length) return 0
  const { count } = await admin.from("recommendations").select("*", { count: "exact", head: true }).in("site_id", sites.map((s) => s.id))
  return count || 0
}

main()
