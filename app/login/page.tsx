import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Lock } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "./actions"

export const metadata: Metadata = {
  title: "Log In - GSCdaddy",
  description:
    "Sign in to GSCdaddy to access your Google Search Console dashboard, striking distance keywords, and AI-powered SEO recommendations.",
  alternates: { canonical: "https://gscdaddy.com/login" },
  openGraph: {
    title: "Log In - GSCdaddy",
    description:
      "Sign in to access your SEO dashboard and AI-powered recommendations.",
    url: "https://gscdaddy.com/login",
    siteName: "GSCdaddy",
    locale: "en_US",
    type: "website",
    images: ["/opengraph-image"],
  },
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
    <div className="grid min-h-screen gap-3 bg-background p-3 lg:grid-cols-[1.1fr_1fr]">
      {/* Left: the same sky and hills as the homepage, with the promise on top */}
      <div className="relative hidden overflow-hidden rounded-tile lg:block">
        <Image
          src="/marketing/hero-sky.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover object-bottom dark:brightness-[0.45] dark:saturate-[0.8]"
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex w-fit items-center gap-2 rounded-xl bg-white/80 px-3 py-2 backdrop-blur">
            <Image src="/images/GSCDaddyLogo.png" alt="" width={24} height={24} priority />
            <span className="font-heading text-base font-bold text-[oklch(0.2_0.008_230)]">GSCdaddy</span>
          </Link>
          <div className="max-w-md pb-[18%]">
            <h2 className="font-heading text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-[oklch(0.27_0.09_245)] dark:text-white">
              Your next page-one keyword is already in Search Console.
            </h2>
            <ul className="mt-6 space-y-2 text-[15px] text-[oklch(0.28_0.05_245)] dark:text-white/85">
              {["Read-only Google access", "Your first opportunities in minutes", "14 days free, no card"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right: sign in */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>

        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <Logo size={28} />
          <span className="font-heading text-xl font-bold">GSCdaddy</span>
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.02em]">Welcome back</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Sign in with the Google account that owns your Search Console properties.
          </p>

          <form action={signInWithGoogle} className="mt-8">
            <Button type="submit" variant="outline" size="lg" className="w-full gap-3 bg-card">
              <GoogleIcon className="size-5" />
              Continue with Google
            </Button>
          </form>

          <div className="mt-4">
            <ErrorMessage searchParams={searchParams} />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-tile-sage p-4 text-sm">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <p className="text-foreground/80">
              We ask for read-only access to Search Console. GSCdaddy can never change your site,
              your content or your Google settings.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
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
    <div role="alert" className="rounded-xl bg-critical-soft p-3 text-center text-sm text-critical">
      {messages[error] || "An error occurred during sign-in."}
    </div>
  )
}
