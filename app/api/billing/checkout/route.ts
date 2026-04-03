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
    const body = await req.json()
    const { plan, interval } = schema.parse(body)

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
