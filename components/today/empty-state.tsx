import Link from "next/link"
import { ArrowRight, Globe, Sparkles, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  kind: "no-sites" | "first-sync" | "no-data-yet"
  name?: string | null
}

export function TodayEmptyState({ kind, name }: EmptyStateProps) {
  const hello = name ? `Hey ${name.split(" ")[0]},` : "Welcome!"

  if (kind === "no-sites") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Globe className="size-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{hello} let&apos;s connect your first site</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          GSCdaddy pulls your Google Search Console data, surfaces striking-distance
          keywords, and drafts AI recommendations — all on autopilot. It starts here.
        </p>
        <Link href="/settings/sites" className="mt-5">
          <Button className="gap-1.5">
            Connect a site <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    )
  }

  if (kind === "first-sync") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Clock className="size-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold">Your first sync is running</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;re pulling the last 90 days of Search Console data. This usually takes
          a couple of minutes. You can watch the progress on your dashboard.
        </p>
        <Link href="/dashboard" className="mt-5">
          <Button variant="outline" className="gap-1.5">
            Go to dashboard <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    )
  }

  // no-data-yet: sites exist and synced, but not enough for any band to render
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="size-6 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">You&apos;re all set up</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your data is synced but there&apos;s not much to surface yet — brand-new sites
        usually need 1–2 weeks of Search Console impressions before striking-distance
        keywords and recommendations come to life.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/reports/recommendations">
          <Button className="gap-1.5">
            Try generating recommendations <ArrowRight className="size-3.5" />
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">See dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
