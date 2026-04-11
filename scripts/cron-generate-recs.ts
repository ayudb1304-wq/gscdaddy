import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { generateRecommendations } from "../lib/ai/generate-recommendations"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log("Starting recommendation generation cron...")

  const { data: sites, error } = await admin
    .from("sites")
    .select("id, site_url, users!inner(id, trial_ends_at, subscriptions(status))")
    .eq("sync_status", "completed")

  if (error) {
    console.error("Failed to fetch sites:", error)
    process.exit(1)
  }

  const activeSites = (sites || []).filter((site) => {
    const user = site.users as unknown as {
      trial_ends_at: string | null
      subscriptions: { status: string }[]
    }
    const hasPaidSub = user.subscriptions?.some((s) => s.status === "active")
    const hasActiveTrial = user.trial_ends_at && new Date(user.trial_ends_at) > new Date()
    return hasPaidSub || hasActiveTrial
  })

  if (!activeSites.length) {
    console.log("No active sites to process")
    return
  }

  // Self-healing filter: only generate for sites that don't already have fresh recs.
  // This turns the daily cron into a safety net for users the post-sync hook missed
  // (existing backlog, failed auto-generations, expired recs) without re-billing
  // the AI call on sites that already have valid recommendations.
  const siteIds = activeSites.map((s) => s.id)
  const { data: freshRecs, error: recsError } = await admin
    .from("recommendations")
    .select("site_id")
    .in("site_id", siteIds)
    .gt("expires_at", new Date().toISOString())

  if (recsError) {
    console.error("Failed to check existing recommendations:", recsError)
    process.exit(1)
  }

  const sitesWithFreshRecs = new Set((freshRecs || []).map((r) => r.site_id))
  const sitesNeedingRecs = activeSites.filter((s) => !sitesWithFreshRecs.has(s.id))

  if (!sitesNeedingRecs.length) {
    console.log(`All ${activeSites.length} active sites already have fresh recommendations`)
    return
  }

  console.log(
    `Found ${sitesNeedingRecs.length}/${activeSites.length} active sites needing recommendations`
  )

  let succeeded = 0
  let failed = 0

  for (const site of sitesNeedingRecs) {
    try {
      const recs = await generateRecommendations(site.id)
      console.log(`  ✓ ${site.site_url} — ${recs?.length || 0} recommendations`)
      succeeded++
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error"
      console.error(`  ✗ ${site.site_url} — ${message}`)
      failed++
    }
  }

  console.log(`Done: ${succeeded} succeeded, ${failed} failed`)
  // Only exit 1 if *everything* failed — partial failures are normal (new sites,
  // transient Anthropic errors) and shouldn't mark the whole workflow as red.
  if (succeeded === 0 && failed > 0) process.exit(1)
}

main()
