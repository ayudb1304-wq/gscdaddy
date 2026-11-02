import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDodoClient, getProductId } from "@/lib/billing/dodo"
import { z } from "zod"

const schema = z.object({
  plan: z.enum(["blogger", "pro", "agency"]),
  interval: z.enum(["monthly", "annual"]),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Choose a valid plan and billing interval." }, { status: 400 })
    }
    const { plan, interval } = parsed.data

    // Don't start a second subscription for someone who already pays (or whose
    // payment is being retried): that double-bills them. Plan changes go
    // through /api/billing/change-plan.
    const existing = (user.subscriptions ?? []).find(
      (s: { status: string }) => s.status === "active" || s.status === "past_due"
    )
    if (existing) {
      return NextResponse.json(
        { error: "You already have a subscription. Change plans from the billing page or update your payment method." },
        { status: 409 }
      )
    }

    const client = getDodoClient()
    const productId = getProductId(plan, interval)

    const subscription = await client.subscriptions.create({
      product_id: productId,
      quantity: 1,
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=success`,
      billing: {
        city: "",
        country: "US",
        state: "",
        street: "",
        zipcode: "",
      },
      customer: {
        email: user.email,
        name: user.name || user.email,
      },
      metadata: {
        user_id: user.id,
        plan,
        interval,
      },
    })

    return NextResponse.json({
      url: subscription.payment_link,
      subscriptionId: subscription.subscription_id,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
