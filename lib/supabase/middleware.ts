import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { rateLimit } from "@/lib/api/rate-limit"

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/today") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/alerts")

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
