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
  // When the event happened at Dodo; older events than the last one applied
  // to a subscription are skipped (Dodo doesn't guarantee delivery order).
  const eventAt = new Date((event as { timestamp?: string }).timestamp ?? Date.now()).toISOString()

  try {
  switch (event.type) {
    // Subscription events
    case "subscription.active":
    case "subscription.renewed": {
      await handleSubscriptionActive(admin, event.data as Subscriptions.Subscription, eventAt)
      break
    }
    case "subscription.on_hold": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "past_due", eventAt)
      break
    }
    case "subscription.cancelled": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "canceled", eventAt)
      break
    }
    case "subscription.failed": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "past_due", eventAt)
      break
    }
    case "subscription.expired": {
      await handleSubscriptionStatusChange(admin, event.data as Subscriptions.Subscription, "canceled", eventAt)
      break
    }
    case "subscription.plan_changed":
    case "subscription.updated": {
      // Route by the subscription's real status. Previously every update was
      // treated as "active", so an update arriving after a cancellation or a
      // failed payment silently re-activated the paid plan.
      const sub = event.data as Subscriptions.Subscription
      switch (sub.status) {
        case "active":
          await handleSubscriptionActive(admin, sub, eventAt)
          break
        case "on_hold":
          await handleSubscriptionStatusChange(admin, sub, "past_due", eventAt)
          break
        case "cancelled":
        case "expired":
        case "failed":
          await handleSubscriptionStatusChange(admin, sub, "canceled", eventAt)
          break
        default:
          console.log(`Ignoring ${event.type} with status ${sub.status}`)
      }
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
      await handleRefundSucceeded(admin, event.data as Refunds.Refund, client)
      break
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`)
  }
  } catch (err) {
    // Non-2xx makes Dodo retry the webhook instead of silently losing it.
    console.error(`Webhook ${event.type} handling failed:`, err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

type Admin = ReturnType<typeof createAdminClient>

let trackingColumns: boolean | null = null
/** Whether migration 018's subscriptions.last_event_at / billing_interval exist. */
async function hasTrackingColumns(admin: Admin): Promise<boolean> {
  if (trackingColumns === null) {
    const { error } = await admin.from("subscriptions").select("last_event_at, billing_interval").limit(1)
    trackingColumns = !error
  }
  return trackingColumns
}

/** True when a newer event than `eventAt` was already applied to this subscription. */
async function isStaleEvent(admin: Admin, subscriptionId: string, eventAt: string): Promise<boolean> {
  if (!(await hasTrackingColumns(admin))) return false
  const { data } = await admin
    .from("subscriptions")
    .select("last_event_at")
    .eq("dodo_subscription_id", subscriptionId)
    .maybeSingle()
  if (data?.last_event_at && new Date(data.last_event_at) > new Date(eventAt)) {
    console.log(`Skipping out-of-order webhook for ${subscriptionId} (event ${eventAt}, applied ${data.last_event_at})`)
    return true
  }
  return false
}

async function handleSubscriptionActive(
  admin: Admin,
  data: Subscriptions.Subscription,
  eventAt: string
) {
  const userId = data.metadata?.user_id
  if (!userId) {
    console.error("Webhook missing user_id in metadata", { subscriptionId: data.subscription_id })
    return
  }
  if (await isStaleEvent(admin, data.subscription_id, eventAt)) return

  // The account may have been deleted (we cancel its subscriptions, but a
  // renewal could already be in flight): don't fail the webhook on the FK.
  const { data: userRow } = await admin.from("users").select("id").eq("id", userId).maybeSingle()
  if (!userRow) {
    console.warn(`Subscription ${data.subscription_id} belongs to a deleted user; ignoring`)
    return
  }

  const planInfo = planFromProductId(data.product_id)
  const plan = planInfo?.plan ?? data.metadata?.plan ?? "blogger"
  const tracking = await hasTrackingColumns(admin)

  await must(admin.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_subscription_id: data.subscription_id,
      dodo_customer_id: data.customer?.customer_id ?? null,
      plan,
      status: "active",
      current_period_start: data.previous_billing_date ?? new Date().toISOString(),
      current_period_end: data.next_billing_date ?? null,
      cancel_at_period_end: data.cancel_at_next_billing_date ?? false,
      updated_at: new Date().toISOString(),
      ...(tracking ? { last_event_at: eventAt, billing_interval: planInfo?.interval ?? data.metadata?.interval ?? null } : {}),
    },
    { onConflict: "dodo_subscription_id" }
  ))

  const planConfig = PLANS[plan as keyof typeof PLANS]
  await must(admin
    .from("users")
    .update({
      plan,
      sites_limit: planConfig?.sites ?? 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId))
}

async function handleSubscriptionStatusChange(
  admin: Admin,
  data: Subscriptions.Subscription,
  status: "canceled" | "past_due" | "paused",
  eventAt: string
) {
  const userId = data.metadata?.user_id
  if (await isStaleEvent(admin, data.subscription_id, eventAt)) return
  const tracking = await hasTrackingColumns(admin)

  await must(admin
    .from("subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(tracking ? { last_event_at: eventAt } : {}),
    })
    .eq("dodo_subscription_id", data.subscription_id))

  if (status === "canceled" && userId) {
    await must(admin
      .from("users")
      .update({
        plan: "free",
        sites_limit: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId))
  }
}

async function handlePaymentSucceeded(
  admin: ReturnType<typeof createAdminClient>,
  data: Payments.Payment
) {
  if (!data.subscription_id) return

  // A successful payment clears a failed one (past_due -> active). It must not
  // revive a cancelled or refunded subscription: a retried payment.succeeded
  // arriving after a refund used to re-grant paid access.
  await must(admin
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", data.subscription_id)
    .in("status", ["active", "past_due"]))
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createAdminClient>,
  data: Payments.Payment
) {
  if (!data.subscription_id) return

  // Mark an active subscription past_due when a payment fails (grace period
  // applies in checkAccess). Never touch cancelled ones.
  await must(admin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", data.subscription_id)
    .eq("status", "active"))
}

async function handleRefundSucceeded(
  admin: ReturnType<typeof createAdminClient>,
  data: Refunds.Refund,
  client: ReturnType<typeof getDodoClient>
) {
  // A partial (goodwill) refund doesn't end the subscription.
  if (data.is_partial) {
    console.log("Partial refund; subscription unchanged", { paymentId: data.payment_id })
    return
  }
  // Refund metadata is usually empty, so resolve the subscription through the
  // refunded payment.
  let subscriptionId = (data.metadata as Record<string, string> | undefined)?.subscription_id ?? null
  if (!subscriptionId) {
    const payment = await client.payments.retrieve(data.payment_id)
    subscriptionId = payment.subscription_id ?? null
  }
  if (!subscriptionId) {
    console.log("Refund for non-subscription payment", { paymentId: data.payment_id })
    return
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("user_id, dodo_subscription_id")
    .eq("dodo_subscription_id", subscriptionId)
    .maybeSingle()

  if (!sub) {
    console.log("Refund for non-subscription payment", { paymentId: data.payment_id })
    return
  }

  // Full refund: stop future charges at Dodo too (otherwise the next renewal
  // bills and re-activates them), then downgrade.
  try {
    await client.subscriptions.update(sub.dodo_subscription_id, { status: "cancelled" })
  } catch (err) {
    console.error(`Couldn't cancel refunded subscription ${sub.dodo_subscription_id} at Dodo:`, err)
  }

  await must(admin
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("dodo_subscription_id", sub.dodo_subscription_id))

  await must(admin
    .from("users")
    .update({
      plan: "free",
      sites_limit: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.user_id))
}

/** Throw on a Supabase write error so the webhook returns 500 and Dodo retries. */
async function must<T extends { error: { message: string } | null }>(query: PromiseLike<T>): Promise<T> {
  const result = await query
  if (result.error) throw new Error(result.error.message)
  return result
}
