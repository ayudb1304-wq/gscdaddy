import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { rateLimit } from "@/lib/api/rate-limit"

const PROTECTED_PREFIXES = ["/today", "/dashboard", "/reports", "/settings", "/onboarding", "/alerts", "/app/"]

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_PREFIXES.some((p) => path.startsWith(p))

  // Public pages (home, blog, tools, health checker) don't need the session:
  // skip the auth call there instead of paying for it on every page view.
  if (!isProtectedRoute && !path.startsWith("/api/") && path !== "/login") {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally when the project uses asymmetric
  // signing keys (otherwise it falls back to a network check, like getUser())
  // and refreshes the session cookie when needed.
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub } : null

  // Rate limit API routes for authenticated users
  if (user && request.nextUrl.pathname.startsWith("/api/")) {
    const { allowed, remaining, resetAt } = rateLimit(user.id)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests, try again later" } },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "50",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
          },
        }
      )
    }
    supabaseResponse.headers.set("X-RateLimit-Limit", "50")
    supabaseResponse.headers.set("X-RateLimit-Remaining", String(remaining))
    supabaseResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)))
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/today"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
