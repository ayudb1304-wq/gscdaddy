import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log("Refreshing striking distance materialized view...")

  const { error } = await admin.rpc("refresh_striking_distance")

  if (error) {
    console.error("Failed to refresh view:", error)
    process.exit(1)
  }

  console.log("Done: view refreshed successfully")
}

main()
