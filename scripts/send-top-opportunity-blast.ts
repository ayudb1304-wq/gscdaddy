/**
 * One-shot marketing email blast: nudges users with non-expired recommendations
 * to visit the dashboard and act on their top opportunity.
 *
 * Usage:
 *   npx tsx scripts/send-top-opportunity-blast.ts                   # dry run (default)
 *   npx tsx scripts/send-top-opportunity-blast.ts send              # real send
 *   npx tsx scripts/send-top-opportunity-blast.ts send --only=foo@bar.com  # single recipient
 *   npx tsx scripts/send-top-opportunity-blast.ts send --include-self      # include Ayush's own account
 *
 * Audience: users whose sites have at least one non-expired, not-completed
 * recommendation. Excludes the gscdaddy.com site owner by default.
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import {
  TopOpportunityAlertEmail,
  getTopOpportunityAlertSubject,
} from "../lib/email/templates/top-opportunity-alert"

// sendEmail is imported lazily inside the real-send branch so that a dry
// run doesn't need RESEND_API_KEY in the local environment — the Resend
// client is instantiated at module-load time in lib/email/resend.ts and
// throws if the key is missing. Dry run should work without any Resend setup.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface Recipient {
  userId: string
  email: string
  name: string | null
  siteName: string
  topKeyword: string
  currentPosition: number
  potentialPosition: number
  estimatedTrafficGain: number
  totalRecommendations: number
  topRecommendationText: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  const send = args.includes("send")
  const includeSelf = args.includes("--include-self")
  const onlyArg = args.find((a) => a.startsWith("--only="))
  const only = onlyArg ? onlyArg.slice("--only=".length) : null
  return { send, includeSelf, only }
}

function formatSiteName(rawUrl: string): string {
  return rawUrl.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
}

async function findSelfUserIds(): Promise<Set<string>> {
  // Identify the gscdaddy.com site owner(s) so we can skip them by default.
  // Uses site_url match so this works regardless of the owner's email.
  const { data, error } = await admin
    .from("sites")
    .select("user_id")
    .ilike("site_url", "%gscdaddy.com%")

  if (error) {
    console.error("Warning: couldn't look up self user IDs:", error.message)
    return new Set()
  }
  return new Set((data || []).map((r) => r.user_id))
}

async function buildRecipients(): Promise<Recipient[]> {
  const nowIso = new Date().toISOString()

  // 1. Pull all non-expired, not-completed recommendations with their site info.
  const { data: recs, error: recsError } = await admin
    .from("recommendations")
    .select(
      "id, site_id, query, current_position, potential_position, estimated_traffic_gain, recommendation_text, sites!inner(id, site_url, user_id)"
    )
    .gt("expires_at", nowIso)
    .eq("is_completed", false)
    .order("estimated_traffic_gain", { ascending: false })

  if (recsError) {
    console.error("Failed to fetch recommendations:", recsError.message)
    process.exit(1)
  }

  if (!recs || recs.length === 0) {
    return []
  }

  // 2. Group by user_id, pick the single highest-gain rec per user as the hero.
  type RawRec = {
    id: string
    site_id: string
    query: string
    current_position: number | null
    potential_position: number | null
    estimated_traffic_gain: number | null
    recommendation_text: string | null
    sites: { id: string; site_url: string; user_id: string }
  }

  const topByUser = new Map<string, { rec: RawRec; totalRecsCount: number }>()
  for (const r of recs as unknown as RawRec[]) {
    const userId = r.sites?.user_id
    if (!userId) continue
    const existing = topByUser.get(userId)
    if (!existing) {
      topByUser.set(userId, { rec: r, totalRecsCount: 1 })
    } else {
      existing.totalRecsCount += 1
      const existingGain = Number(existing.rec.estimated_traffic_gain) || 0
      const thisGain = Number(r.estimated_traffic_gain) || 0
      if (thisGain > existingGain) existing.rec = r
    }
  }

  if (topByUser.size === 0) return []

  // 3. Fetch user emails + names + opt-out status for just the user_ids we have.
  const userIds = Array.from(topByUser.keys())
  const { data: users, error: usersError } = await admin
    .from("users")
    .select("id, email, name, email_unsubscribed")
    .in("id", userIds)
    .or("email_unsubscribed.is.null,email_unsubscribed.eq.false")

  if (usersError) {
    console.error("Failed to fetch users:", usersError.message)
    process.exit(1)
  }

  // 4. Build recipient payloads
  const recipients: Recipient[] = []
  for (const u of users || []) {
    const entry = topByUser.get(u.id)
    if (!entry) continue
    const { rec, totalRecsCount } = entry
    recipients.push({
      userId: u.id,
      email: u.email,
      name: u.name,
      siteName: formatSiteName(rec.sites.site_url),
      topKeyword: rec.query || "(unknown)",
      currentPosition: Number(rec.current_position) || 0,
      potentialPosition: Number(rec.potential_position) || 0,
      estimatedTrafficGain: Number(rec.estimated_traffic_gain) || 0,
      totalRecommendations: totalRecsCount,
      topRecommendationText: rec.recommendation_text || "",
    })
  }

  // Sort by biggest opportunity first so the dry-run output leads with the hero
  recipients.sort((a, b) => b.estimatedTrafficGain - a.estimatedTrafficGain)
  return recipients
}

async function main() {
  const { send, includeSelf, only } = parseArgs()
  const mode = send ? "SENDING LIVE" : "DRY RUN — no emails will be sent"
  console.log(`=== ${mode} ===\n`)

  const recipients = await buildRecipients()
  if (recipients.length === 0) {
    console.log("No recipients found. Nothing to send.")
    return
  }

  const selfIds = includeSelf ? new Set<string>() : await findSelfUserIds()

  // Filter based on flags
  const filtered = recipients.filter((r) => {
    if (only && r.email !== only) return false
    if (selfIds.has(r.userId) && !includeSelf) return false
    return true
  })

  const skipped = recipients.length - filtered.length
  if (filtered.length === 0) {
    console.log(
      `All ${recipients.length} candidates were filtered out (only=${only || "-"}, includeSelf=${includeSelf}).`
    )
    return
  }

  // Print the full candidate list including skipped so the user can see who got excluded
  console.log(`Candidates: ${recipients.length} | Will process: ${filtered.length} | Skipped: ${skipped}\n`)

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i]
    const willSend = filtered.includes(r)
    const selfSkipped = !includeSelf && selfIds.has(r.userId)
    const onlySkipped = only !== null && r.email !== only

    const skipReason = selfSkipped
      ? " ← SKIPPED (self account, pass --include-self)"
      : onlySkipped
      ? ` ← SKIPPED (--only=${only})`
      : ""

    const subject = getTopOpportunityAlertSubject(
      r.siteName,
      r.estimatedTrafficGain,
      r.totalRecommendations
    )

    console.log(`[${i + 1}/${recipients.length}] ${r.siteName}${skipReason}`)
    console.log(`  → ${r.email}`)
    console.log(`  Subject: "${subject}"`)
    console.log(`  Top keyword: "${r.topKeyword}"`)
    console.log(
      `  Gain: +${r.estimatedTrafficGain} clicks/mo | Current pos: ${r.currentPosition.toFixed(1)} → potential ${Math.round(r.potentialPosition)}`
    )
    console.log(`  Total recs: ${r.totalRecommendations}`)
    const preview = r.topRecommendationText.slice(0, 140).trim()
    console.log(`  Recommendation preview: "${preview}${r.topRecommendationText.length > 140 ? "..." : ""}"`)

    if (willSend && send) {
      // Lazy-import so the Resend client only instantiates when we are
      // genuinely sending. Dry runs never hit this branch.
      const { sendEmail } = await import("../lib/email/resend")
      const result = await sendEmail({
        to: r.email,
        subject,
        react: TopOpportunityAlertEmail({
          userName: r.name || "",
          siteName: r.siteName,
          topKeyword: r.topKeyword,
          currentPosition: r.currentPosition,
          potentialPosition: r.potentialPosition,
          estimatedTrafficGain: r.estimatedTrafficGain,
          totalRecommendations: r.totalRecommendations,
          topRecommendationText: r.topRecommendationText,
        }),
      })

      if (result?.id) {
        console.log(`  ✓ SENT (Resend id: ${result.id})\n`)
        succeeded++
      } else {
        console.log(`  ✗ FAILED — see Resend error above\n`)
        failed++
      }
    } else {
      console.log("")
    }
  }

  if (send) {
    console.log(`\nDone: ${succeeded} sent, ${failed} failed`)
  } else {
    console.log(
      `\nSummary: ${filtered.length} emails would be sent.\n` +
        `  Run with \`send\` to execute: npx tsx scripts/send-top-opportunity-blast.ts send\n` +
        `  Or preview to yourself first: npx tsx scripts/send-top-opportunity-blast.ts send --only=<your-email>`
    )
  }
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
