import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { Resend } from "resend"
import { render } from "@react-email/components"
import { WeeklySummaryEmail } from "../lib/email/templates/weekly-summary"
import { TrialEndingEmail } from "../lib/email/templates/trial-ending"
import { TrialExpiredEmail } from "../lib/email/templates/trial-expired"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "ayucorp1304@gmail.com"
const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"

async function main() {
  console.log("Sending 3 test emails to", TO)
  console.log("API key starts with:", process.env.RESEND_API_KEY?.slice(0, 8) + "...")

  // 1. Weekly Summary
  console.log("\n1. Sending Weekly Summary...")
  try {
    const html = await render(
      WeeklySummaryEmail({
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
      })
    )
    const { data, error } = await resend.emails.send({ from: FROM, to: TO, subject: "Your keywords did things this week", html })
    if (error) console.error("  Error:", error)
    else console.log("  Sent! ID:", data?.id)
  } catch (e) {
    console.error("  Failed:", e)
  }

  // 2. Trial Ending
  console.log("\n2. Sending Trial Ending...")
  try {
    const html = await render(
      TrialEndingEmail({
        userName: "Ayush",
        daysLeft: 3,
        trialEndDate: "April 6, 2026",
        keywordsTracked: 1247,
        recsGenerated: 15,
        sitesConnected: 2,
      })
    )
    const { data, error } = await resend.emails.send({ from: FROM, to: TO, subject: "3 days left to keep your SEO superpowers", html })
    if (error) console.error("  Error:", error)
    else console.log("  Sent! ID:", data?.id)
  } catch (e) {
    console.error("  Failed:", e)
  }

  // 3. Trial Expired
  console.log("\n3. Sending Trial Expired...")
  try {
    const html = await render(
      TrialExpiredEmail({
        userName: "Ayush",
        keywordsTracked: 1247,
        recsGenerated: 15,
      })
    )
    const { data, error } = await resend.emails.send({ from: FROM, to: TO, subject: "Your trial just left the chat", html })
    if (error) console.error("  Error:", error)
    else console.log("  Sent! ID:", data?.id)
  } catch (e) {
    console.error("  Failed:", e)
  }

  console.log("\nDone! Check your inbox.")
}

main()
