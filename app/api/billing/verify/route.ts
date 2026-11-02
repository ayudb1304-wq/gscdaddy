import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDodoClient, planFromProductId } from "@/lib/billing/dodo"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/billing/plans"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json().catch(() => null)
    const subscriptionId = body?.subscriptionId

    if (typeof subscriptionId !== "string" || subscriptionId.length === 0 || subscriptionId.length > 200) {
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

    const row = {
      user_id: user.id,
      dodo_subscription_id: sub.subscription_id,
      dodo_customer_id: sub.customer?.customer_id ?? null,
      plan,
      status: "active",
      current_period_start: sub.previous_billing_date ?? new Date().toISOString(),
      current_period_end: sub.next_billing_date ?? null,
      cancel_at_period_end: sub.cancel_at_next_billing_date ?? false,
      updated_at: new Date().toISOString(),
    }
    let { error: upsertError } = await admin
      .from("subscriptions")
      .upsert({ ...row, billing_interval: planInfo?.interval ?? null }, { onConflict: "dodo_subscription_id" })
    if (upsertError && /billing_interval/.test(upsertError.message)) {
      // Migration 018 not applied yet.
      ;({ error: upsertError } = await admin.from("subscriptions").upsert(row, { onConflict: "dodo_subscription_id" }))
    }
    if (upsertError) {
      // Don't report "activated" when nothing was saved; the webhook will retry.
      console.error("Verify: saving subscription failed:", upsertError.message)
      return NextResponse.json({ status: "active", activated: false })
    }

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
