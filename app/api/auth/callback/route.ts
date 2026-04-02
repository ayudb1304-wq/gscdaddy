import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { storeTokens } from "@/lib/google/tokens"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const session = data.session
  const user = session.user

  // Extract Google tokens from the session
  const providerToken = session.provider_token
  const providerRefreshToken = session.provider_refresh_token

  // Upsert user in our users table
  const admin = createAdminClient()
  const { data: existingUser } = await admin
    .from("users")
    .select("id, created_at")
    .eq("id", user.id)
    .single()

  const isNewUser = !existingUser

  const userData: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    updated_at: new Date().toISOString(),
  }

  if (isNewUser) {
    // Set trial for new users
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)
    userData.trial_ends_at = trialEnd.toISOString()
    userData.plan = "free"
    userData.sites_limit = 1
  }

  await admin.from("users").upsert(userData, { onConflict: "id" })

  // Store encrypted Google tokens if available
  if (providerToken) {
    const expiresAt = new Date(Date.now() + 3600 * 1000) // Google tokens typically expire in 1 hour
    await storeTokens(
      user.id,
      providerToken,
      providerRefreshToken || "",
      expiresAt
    )
  }

  // Redirect new users to onboarding, returning users to dashboard
  const redirectTo = isNewUser ? "/onboarding" : next
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
