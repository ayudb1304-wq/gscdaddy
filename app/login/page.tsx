import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "./actions"

export const metadata: Metadata = {
  title: "Log In - GSCdaddy",
  description:
    "Sign in to GSCdaddy to access your Google Search Console dashboard, striking distance keywords, and AI-powered SEO recommendations.",
  alternates: { canonical: "https://gscdaddy.com/login" },
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}


export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — inverted: dark in light mode, light in dark mode */}
      <div className="relative hidden flex-col justify-between bg-[#0a0a0a] p-10 text-white dark:bg-white dark:text-[#0a0a0a] lg:flex">
        {/* Logo — links to home */}
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <Image
            src="/images/GSCDaddyLogo_LightMode.png"
            alt="GSCdaddy"
            width={28}
            height={28}
            priority
            className="shrink-0 dark:hidden"
          />
          <Image
            src="/images/GSCDaddyLogo.png"
            alt="GSCdaddy"
            width={28}
            height={28}
            priority
            className="hidden shrink-0 dark:block"
          />
          GSCdaddy
        </Link>

        {/* Tagline */}
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold leading-tight">
            Your SEO data has<br />
            <span className="text-primary">stories to tell.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-sm text-neutral-400 dark:text-neutral-500">
            Strategic SEO intelligence powered by AI. Not another checklist of meaningless scores.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>&copy; {new Date().getFullYear()} GSCdaddy</span>
          <div className="flex gap-4">
            <Link href="/terms" className="transition-colors hover:text-neutral-300 dark:hover:text-neutral-700">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-neutral-300 dark:hover:text-neutral-700">
              Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* Right panel — sign in form */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo (hidden on desktop) */}
        <Link href="/" className="mb-8 flex items-center gap-2 font-heading text-xl font-bold lg:hidden">
          <Logo size={24} />
          GSCdaddy
        </Link>

        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Google sign in */}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="h-11 w-full gap-2.5 text-sm font-medium"
            >
              <GoogleIcon className="size-5" />
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            We only request read-only access to your Search Console data.
          </p>

          {/* Error message */}
          <ErrorMessage searchParams={searchParams} />

          {/* Terms footer (mobile only — desktop has it in left panel) */}
          <p className="text-center text-xs text-muted-foreground lg:hidden">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  if (!error) return null

  const messages: Record<string, string> = {
    missing_code: "Authentication failed. Please try again.",
    auth_failed: "Could not complete sign-in. Please try again.",
  }

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
      {messages[error] || "An error occurred during sign-in."}
    </div>
  )
}
