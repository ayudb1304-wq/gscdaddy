import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDodoClient, planFromProductId } from "@/lib/billing/dodo"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/billing/plans"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 })
    }

    const client = getDodoClient()
    const sub = await client.subscriptions.retrieve(subscriptionId)

    // Verify this subscription belongs to the current user via metadata
    if (sub.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "Subscription mismatch" }, { status: 403 })
    }

    if (sub.status !== "active") {
      return NextResponse.json({ status: sub.status, activated: false })
    }

    // Subscription is active — update DB
    const admin = createAdminClient()
    const planInfo = planFromProductId(sub.product_id)
    const plan = planInfo?.plan ?? sub.metadata?.plan ?? "blogger"

    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        dodo_subscription_id: sub.subscription_id,
        dodo_customer_id: sub.customer?.customer_id ?? null,
        plan,
        status: "active",
        current_period_start: sub.previous_billing_date ?? new Date().toISOString(),
        current_period_end: sub.next_billing_date ?? null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dodo_subscription_id" }
    )

    const planConfig = PLANS[plan as keyof typeof PLANS]
    await admin
      .from("users")
      .update({
        plan,
        sites_limit: planConfig?.sites ?? 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({ status: "active", activated: true, plan })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 })
  }
}
