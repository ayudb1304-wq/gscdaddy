import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDodoClient } from "@/lib/billing/dodo"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()

    // Find the user's active subscription to get dodo_customer_id
    const { data: sub } = await admin
      .from("subscriptions")
      .select("dodo_customer_id")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!sub?.dodo_customer_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    const client = getDodoClient()
    const session = await client.customers.customerPortal.create(sub.dodo_customer_id, {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    })

    return NextResponse.json({ url: session.link })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Failed to get portal URL" }, { status: 500 })
  }
}
