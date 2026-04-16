import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDodoClient, getProductId, planFromProductId } from "@/lib/billing/dodo"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/billing/plans"
import { z } from "zod"

const schema = z.object({
  plan: z.enum(["blogger", "pro", "agency"]),
  interval: z.enum(["monthly", "annual"]),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { plan, interval } = schema.parse(body)

    const admin = createAdminClient()

    // Find existing active subscription
    const { data: sub } = await admin
      .from("subscriptions")
      .select("dodo_subscription_id, plan")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!sub?.dodo_subscription_id) {
      return NextResponse.json({ error: "No active subscription to change" }, { status: 404 })
    }

    const newProductId = getProductId(plan, interval)
    const client = getDodoClient()

    // Use Dodo's changePlan — prorated immediately for upgrades,
    // effective at next billing date for downgrades
    const currentPlanOrder = ["blogger", "pro", "agency"]
    const currentIdx = currentPlanOrder.indexOf(sub.plan)
    const newIdx = currentPlanOrder.indexOf(plan)
    const isUpgrade = newIdx > currentIdx

    await client.subscriptions.changePlan(sub.dodo_subscription_id, {
      product_id: newProductId,
      quantity: 1,
      proration_billing_mode: isUpgrade ? "prorated_immediately" : "full_immediately",
      effective_at: isUpgrade ? "immediately" : "next_billing_date",
      metadata: {
        user_id: user.id,
        plan,
        interval,
      },
    })

    if (isUpgrade) {
      // Upgrade: apply immediately in our DB too
      const planConfig = PLANS[plan as keyof typeof PLANS]
      await admin
        .from("subscriptions")
        .update({
          plan,
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", sub.dodo_subscription_id)

      await admin
        .from("users")
        .update({
          plan,
          sites_limit: planConfig?.sites ?? 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
    }
    // Downgrade: Dodo will fire subscription.plan_changed webhook at next billing date

    return NextResponse.json({
      success: true,
      plan,
      effective: isUpgrade ? "immediately" : "next_billing_date",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Change plan error:", error)
    return NextResponse.json({ error: "Failed to change plan" }, { status: 500 })
  }
}
