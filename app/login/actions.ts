"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGoogleOAuthScopes } from "@/lib/google/oauth"
import { headers } from "next/headers"

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      scopes: getGoogleOAuthScopes(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error || !data.url) {
    redirect("/login?error=auth_failed")
  }

  redirect(data.url)
}
