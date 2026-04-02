import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateRecommendations } from "@/lib/ai/generate-recommendations"

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  // Fetch all sites with active users (trial not expired or paid subscription)
  const { data: sites, error } = await admin
    .from("sites")
    .select("id, site_url, users!inner(id, trial_ends_at, subscriptions(status))")
    .eq("sync_status", "completed")

  if (error) {
    console.error("Failed to fetch sites for rec generation:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  // Filter to sites with active access
  const activeSites = (sites || []).filter((site) => {
    const user = site.users as unknown as {
      trial_ends_at: string | null
      subscriptions: { status: string }[]
    }
    const hasPaidSub = user.subscriptions?.some((s) => s.status === "active")
    const hasActiveTrial = user.trial_ends_at && new Date(user.trial_ends_at) > new Date()
    return hasPaidSub || hasActiveTrial
  })

  if (activeSites.length === 0) {
    return NextResponse.json({ message: "No active sites", generated: 0 })
  }

  const results: { siteId: string; status: string; count?: number; error?: string }[] = []

  for (const site of activeSites) {
    try {
      const recs = await generateRecommendations(site.id)
      results.push({ siteId: site.id, status: "success", count: recs?.length || 0 })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error"
      results.push({ siteId: site.id, status: "failed", error: message })
    }
  }

  const succeeded = results.filter((r) => r.status === "success").length
  console.log(`Cron generate-recs: ${succeeded}/${activeSites.length} sites processed`)

  return NextResponse.json({
    message: `Generated recommendations for ${succeeded}/${activeSites.length} sites`,
    results,
  })
}
