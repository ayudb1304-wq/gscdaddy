import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { syncSite } from "../lib/sync/gsc-sync"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log("Starting GSC sync cron...")

  const { data: sites, error } = await admin
    .from("sites")
    .select("id, site_url")
    .neq("sync_status", "syncing")

  if (error) {
    console.error("Failed to fetch sites:", error)
    process.exit(1)
  }

  if (!sites?.length) {
    console.log("No sites need syncing")
    return
  }

  console.log(`Found ${sites.length} sites to sync`)

  let succeeded = 0
  let failed = 0

  for (const site of sites) {
    try {
      const { rowCount } = await syncSite(site.id)
      console.log(`  ✓ ${site.site_url} — ${rowCount} rows`)
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
