import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { error } = await admin.rpc("refresh_striking_distance")

  if (error) {
    console.error("Failed to refresh striking distance view:", error)
    return NextResponse.json({ error: "Failed to refresh view" }, { status: 500 })
  }

  console.log("Materialized view refreshed successfully")
  return NextResponse.json({ message: "Striking distance view refreshed" })
}
