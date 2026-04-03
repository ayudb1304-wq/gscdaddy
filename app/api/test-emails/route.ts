import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/resend"
import { WeeklySummaryEmail, getWeeklySummarySubject } from "@/lib/email/templates/weekly-summary"
import { TrialEndingEmail, getTrialEndingSubject } from "@/lib/email/templates/trial-ending"
import { TrialExpiredEmail, getTrialExpiredSubject } from "@/lib/email/templates/trial-expired"

const TEST_EMAIL = "ayucorp1304@gmail.com"

export async function GET() {
  const results = { weekly: false, trialEnding: false, trialExpired: false }

  // 1. Weekly Summary
  const weekly = await sendEmail({
    to: TEST_EMAIL,
    subject: getWeeklySummarySubject("gscdaddy.com"),
    react: WeeklySummaryEmail({
      userName: "Ayush",
      siteName: "gscdaddy.com",
      totalClicks: 342,
      totalImpressions: 18_420,
      avgPosition: 11.3,
      topKeywords: [
        { query: "striking distance keywords", position: 7.2, opportunityScore: 89, impressions: 3200 },
        { query: "gsc keyword tracker", position: 9.1, opportunityScore: 76, impressions: 2100 },
        { query: "google search console tools", position: 11.4, opportunityScore: 68, impressions: 4500 },
        { query: "seo action plan generator", position: 8.8, opportunityScore: 62, impressions: 1800 },
        { query: "almost ranking keywords finder", position: 12.3, opportunityScore: 54, impressions: 2900 },
      ],
      positionMovers: [
        { query: "striking distance keywords", direction: "up", change: 3.2, currentPosition: 7.2 },
        { query: "gsc keyword tracker", direction: "up", change: 2.1, currentPosition: 9.1 },
        { query: "seo action plan generator", direction: "up", change: 1.8, currentPosition: 8.8 },
        { query: "best seo audit tool free", direction: "down", change: 2.4, currentPosition: 14.1 },
        { query: "search console alternative", direction: "down", change: 1.5, currentPosition: 13.2 },
      ],
      recsCompletedCount: 7,
    }),
  })
  results.weekly = !!weekly

  // 2. Trial Ending
  const trialEnding = await sendEmail({
    to: TEST_EMAIL,
    subject: getTrialEndingSubject(),
    react: TrialEndingEmail({
      userName: "Ayush",
      daysLeft: 3,
      trialEndDate: "April 6, 2026",
      keywordsTracked: 1247,
      recsGenerated: 15,
      sitesConnected: 2,
    }),
  })
  results.trialEnding = !!trialEnding

  // 3. Trial Expired
  const trialExpired = await sendEmail({
    to: TEST_EMAIL,
    subject: getTrialExpiredSubject(),
    react: TrialExpiredEmail({
      userName: "Ayush",
      keywordsTracked: 1247,
      recsGenerated: 15,
    }),
  })
  results.trialExpired = !!trialExpired

  return NextResponse.json({ success: true, results })
}
