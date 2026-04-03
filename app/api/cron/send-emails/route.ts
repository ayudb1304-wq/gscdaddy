import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/resend"
import { WeeklySummaryEmail, getWeeklySummarySubject } from "@/lib/email/templates/weekly-summary"
import { TrialEndingEmail, getTrialEndingSubject } from "@/lib/email/templates/trial-ending"
import { TrialExpiredEmail, getTrialExpiredSubject } from "@/lib/email/templates/trial-expired"

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const results = { weeklySent: 0, trialEndingSent: 0, trialExpiredSent: 0, errors: 0 }

  // --- WEEKLY SUMMARY (Sundays only) ---
  if (now.getUTCDay() === 0) {
    results.weeklySent = await sendWeeklySummaries(admin)
  }

  // --- TRIAL ENDING (3 days before) ---
  results.trialEndingSent = await sendTrialEndingEmails(admin, now)

  // --- TRIAL EXPIRED (last 24h) ---
  results.trialExpiredSent = await sendTrialExpiredEmails(admin, now)

  return NextResponse.json({ success: true, ...results })
}

// ===== WEEKLY SUMMARY =====

async function sendWeeklySummaries(admin: ReturnType<typeof createAdminClient>) {
  let sent = 0

  // Get users with active access and completed sites
  const { data: users } = await admin
    .from("users")
    .select("id, email, name")
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) return 0

  // Filter to users with active access (paid or trial)
  const now = new Date()
  const activeUsers = []
  for (const user of users) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    const { data: userRow } = await admin
      .from("users")
      .select("trial_ends_at")
      .eq("id", user.id)
      .single()

    const hasActiveSub = !!sub
    const hasActiveTrial = userRow?.trial_ends_at && new Date(userRow.trial_ends_at) > now

    if (hasActiveSub || hasActiveTrial) {
      activeUsers.push(user)
    }
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
          getTrafficSnapshot(admin, site.id),
          getTopKeywords(admin, site.id),
          getPositionMovers(admin, site.id),
          getRecsCompleted(admin, site.id),
        ])

        const siteName = site.display_name || site.site_url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")

        const result = await sendEmail({
          to: user.email,
          subject: getWeeklySummarySubject(siteName),
          react: WeeklySummaryEmail({
            userName: user.name || user.email,
            siteName,
            totalClicks: traffic.clicks,
            totalImpressions: traffic.impressions,
            avgPosition: traffic.avgPosition,
            topKeywords: keywords,
            positionMovers: movers,
            recsCompletedCount: recsCount,
          }),
        })

        if (result) sent++
      } catch (err) {
        console.error(`Weekly summary failed for user ${user.id}, site ${site.id}:`, err)
      }
    }
  }

  return sent
}

async function getTrafficSnapshot(admin: ReturnType<typeof createAdminClient>, siteId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]

  const { data } = await admin
    .from("gsc_data")
    .select("clicks, impressions, position")
    .eq("site_id", siteId)
    .gte("date", sevenDaysAgo)

  if (!data?.length) return { clicks: 0, impressions: 0, avgPosition: 0 }

  const clicks = data.reduce((sum, r) => sum + (r.clicks || 0), 0)
  const impressions = data.reduce((sum, r) => sum + (r.impressions || 0), 0)
  const avgPosition = data.reduce((sum, r) => sum + Number(r.position || 0), 0) / data.length

  return { clicks, impressions, avgPosition }
}

async function getTopKeywords(admin: ReturnType<typeof createAdminClient>, siteId: string) {
  const { data } = await admin
    .from("striking_distance_keywords")
    .select("query, avg_position, total_impressions, opportunity_score")
    .eq("site_id", siteId)
    .order("opportunity_score", { ascending: false })
    .limit(5)

  return (data || []).map((kw) => ({
    query: kw.query,
    position: Number(kw.avg_position),
    opportunityScore: Number(kw.opportunity_score),
    impressions: Number(kw.total_impressions),
  }))
}

async function getPositionMovers(admin: ReturnType<typeof createAdminClient>, siteId: string) {
  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString().split("T")[0]
  const fourteenDaysAgo = new Date(now - 14 * 86400000).toISOString().split("T")[0]

  // Get last 14 days of data
  const { data } = await admin
    .from("gsc_data")
    .select("query, date, position")
    .eq("site_id", siteId)
    .gte("date", fourteenDaysAgo)
    .gte("impressions", 10)

  if (!data?.length) return []

  // Split into two 7-day windows
  const thisWeek = new Map<string, number[]>()
  const lastWeek = new Map<string, number[]>()

  for (const row of data) {
    const bucket = row.date >= sevenDaysAgo ? thisWeek : lastWeek
    const positions = bucket.get(row.query) || []
    positions.push(Number(row.position))
    bucket.set(row.query, positions)
  }

  // Compare averages
  const movers: { query: string; direction: "up" | "down"; change: number; currentPosition: number }[] = []

  for (const [query, positions] of thisWeek) {
    const lastPositions = lastWeek.get(query)
    if (!lastPositions) continue

    const avgNow = positions.reduce((a, b) => a + b, 0) / positions.length
    const avgBefore = lastPositions.reduce((a, b) => a + b, 0) / lastPositions.length
    const change = avgBefore - avgNow // positive = improved (lower position number)

    if (Math.abs(change) >= 1) {
      movers.push({
        query,
        direction: change > 0 ? "up" : "down",
        change: Math.abs(change),
        currentPosition: avgNow,
      })
    }
  }

  // Sort by absolute change, take top 5
  movers.sort((a, b) => b.change - a.change)
  return movers.slice(0, 5)
}

async function getRecsCompleted(admin: ReturnType<typeof createAdminClient>, siteId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const { count } = await admin
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("is_completed", true)
    .gte("completed_at", sevenDaysAgo)

  return count || 0
}

// ===== TRIAL ENDING =====

async function sendTrialEndingEmails(admin: ReturnType<typeof createAdminClient>, now: Date) {
  let sent = 0

  const twoDays = new Date(now.getTime() + 2 * 86400000).toISOString()
  const threeDays = new Date(now.getTime() + 3 * 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name, trial_ends_at")
    .gte("trial_ends_at", twoDays)
    .lte("trial_ends_at", threeDays)
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) return 0

  for (const user of users) {
    // Skip if user has an active paid subscription
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
        getUserSitesCount(admin, user.id),
        getUserKeywordsCount(admin, user.id),
        getUserRecsCount(admin, user.id),
      ])

      const trialEnd = new Date(user.trial_ends_at)
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000)

      const result = await sendEmail({
        to: user.email,
        subject: getTrialEndingSubject(),
        react: TrialEndingEmail({
          userName: user.name || user.email,
          daysLeft,
          trialEndDate: trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          keywordsTracked: keywordsCount,
          recsGenerated: recsCount,
          sitesConnected: sitesCount,
        }),
      })

      if (result) sent++
    } catch (err) {
      console.error(`Trial ending email failed for user ${user.id}:`, err)
    }
  }

  return sent
}

// ===== TRIAL EXPIRED =====

async function sendTrialExpiredEmails(admin: ReturnType<typeof createAdminClient>, now: Date) {
  let sent = 0

  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString()

  const { data: users } = await admin
    .from("users")
    .select("id, email, name")
    .gte("trial_ends_at", oneDayAgo)
    .lte("trial_ends_at", now.toISOString())
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (!users?.length) return 0

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
        getUserKeywordsCount(admin, user.id),
        getUserRecsCount(admin, user.id),
      ])

      const result = await sendEmail({
        to: user.email,
        subject: getTrialExpiredSubject(),
        react: TrialExpiredEmail({
          userName: user.name || user.email,
          keywordsTracked: keywordsCount,
          recsGenerated: recsCount,
        }),
      })

      if (result) sent++
    } catch (err) {
      console.error(`Trial expired email failed for user ${user.id}:`, err)
    }
  }

  return sent
}

// ===== SHARED HELPERS =====

async function getUserSitesCount(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { count } = await admin
    .from("sites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
  return count || 0
}

async function getUserKeywordsCount(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: sites } = await admin
    .from("sites")
    .select("id")
    .eq("user_id", userId)

  if (!sites?.length) return 0

  const siteIds = sites.map((s) => s.id)
  const { count } = await admin
    .from("gsc_data")
    .select("query", { count: "exact", head: true })
    .in("site_id", siteIds)

  return count || 0
}

async function getUserRecsCount(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: sites } = await admin
    .from("sites")
    .select("id")
    .eq("user_id", userId)

  if (!sites?.length) return 0

  const siteIds = sites.map((s) => s.id)
  const { count } = await admin
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .in("site_id", siteIds)

  return count || 0
}
