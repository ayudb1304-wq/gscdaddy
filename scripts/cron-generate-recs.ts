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

  console.log(`Found ${activeSites.length} active sites`)

  let succeeded = 0
  let failed = 0

  for (const site of activeSites) {
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
  if (failed > 0) process.exit(1)
}

main()
