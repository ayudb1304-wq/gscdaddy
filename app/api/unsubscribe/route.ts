import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gscdaddy.com"

/**
 * POST /api/unsubscribe?u=<userId>&t=<token>
 * Used by mail clients' one-click unsubscribe (RFC 8058) and by the
 * /unsubscribe page's form. `resubscribe=1` in the form body turns emails back on.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("u") ?? ""
  const token = searchParams.get("t") ?? ""

  if (!verifyUnsubscribeToken(userId, token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 })
  }

  const form = await request.formData().catch(() => null)
  const resubscribe = form?.get("resubscribe") === "1"

  const admin = createAdminClient()
  const { error } = await admin
    .from("users")
    .update({ email_unsubscribed: !resubscribe, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Unsubscribe failed:", error.message)
    return NextResponse.json({ error: "Could not update your email preferences" }, { status: 500 })
  }

  // Browser form posts get sent back to the page; mail clients just need a 2xx.
  if (form?.get("from") === "page") {
    const params = new URLSearchParams({ u: userId, t: token, done: resubscribe ? "resubscribed" : "unsubscribed" })
    return NextResponse.redirect(`${APP_URL}/unsubscribe?${params}`, 303)
  }
  return NextResponse.json({ unsubscribed: !resubscribe })
}
