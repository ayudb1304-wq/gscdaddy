import { NextRequest, NextResponse } from "next/server"
import type { Subscriptions } from "dodopayments/resources/subscriptions"
import type { Payments } from "dodopayments/resources/payments"
import type { Refunds } from "dodopayments/resources/refunds"
import { getDodoClient, planFromProductId } from "@/lib/billing/dodo"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/billing/plans"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const client = getDodoClient()

  let event
  try {
    event = client.webhooks.unwrap(body, {
      headers: {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      },
    })
  } catch {
    console.error("Webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    // Subscription events
    case "subscription.active":
    case "subscription.renewed": {
      await handleSubscriptionActive(admin, event.data as Subscriptions.Subscription)
      break
    }
    case "subscription.on_hold": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "past_due")
      break
    }
    case "subscription.cancelled": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "canceled")
      break
    }
    case "subscription.failed": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "past_due")
      break
    }
    case "subscription.expired": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "canceled")
      break
    }
    case "subscription.plan_changed":
    case "subscription.updated": {
      // Handles downgrades taking effect at next billing date
      await handleSubscriptionActive(admin, event.data as Subscriptions.Subscription)
      break
    }

    // Payment events
    case "payment.succeeded": {
      await handlePaymentSucceeded(admin, event.data as Payments.Payment)
      break
    }
    case "payment.failed": {
      await handlePaymentFailed(admin, event.data as Payments.Payment)
      break
    }

    // Refund events
    case "refund.succeeded": {
      await handleRefundSucceeded(admin, event.data as Refunds.Refund)
      break
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActive(
  admin: ReturnType<typeof createAdminClient>,
  data: Subscriptions.Subscription
) {
  const userId = data.metadata?.user_id
  if (!userId) {
    console.error("Webhook missing user_id in metadata", { subscriptionId: data.subscription_id })
    return
  }

  const planInfo = planFromProductId(data.product_id)
  const plan = planInfo?.plan ?? data.metadata?.plan ?? "blogger"

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_subscription_id: data.subscription_id,
      dodo_customer_id: data.customer?.customer_id ?? null,
      plan,
      status: "active",
      current_period_start: data.previous_billing_date ?? new Date().toISOString(),
      current_period_end: data.next_billing_date ?? null,
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
    .eq("id", userId)
}

async function handleSubscriptionStatusChange(
  admin: ReturnType<typeof createAdminClient>,
  data: Subscriptions.Subscription,
  status: "canceled" | "past_due" | "paused"
) {
  const userId = data.metadata?.user_id

  await admin
    .from("subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", data.subscription_id)

  if (status === "canceled" && userId) {
    await admin
      .from("users")
      .update({
        plan: "free",
        sites_limit: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }
}

async function handlePaymentSucceeded(
  admin: ReturnType<typeof createAdminClient>,
  data: Payments.Payment
) {
  if (!data.subscription_id) return

  // Update subscription period dates on successful renewal payment
  await admin
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", data.subscription_id)
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createAdminClient>,
  data: Payments.Payment
) {
  if (!data.subscription_id) return

  // Mark subscription as past_due when a payment fails
  await admin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", data.subscription_id)
}

async function handleRefundSucceeded(
  admin: ReturnType<typeof createAdminClient>,
  data: Refunds.Refund
) {
  // Look up the subscription via the refunded payment
  const { data: sub } = await admin
    .from("subscriptions")
    .select("user_id, dodo_subscription_id")
    .eq("dodo_subscription_id", data.metadata?.subscription_id ?? "")
    .single()

  if (!sub) {
    console.log("Refund for non-subscription payment", { paymentId: data.payment_id })
    return
  }

  // Downgrade user on refund
  await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", sub.dodo_subscription_id)

  await admin
    .from("users")
    .update({
      plan: "free",
      sites_limit: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.user_id)
}
