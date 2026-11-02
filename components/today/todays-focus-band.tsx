import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Target, ArrowRight } from "lucide-react"
import { MarkCompleteButton } from "./mark-complete-button"

export interface FocusRec {
  id: string
  siteUrl: string
  type: string
  query: string | null
  page: string | null
  priority: string | null
  recommendationText: string
  actionItems: string[]
  estimatedTrafficGain: number | null
}

function stripProtocol(url: string): string {
  return url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
}

function priorityClass(priority: string | null): string {
  if (priority === "high")
    return "bg-critical-soft text-critical"
  if (priority === "medium")
    return "bg-warning-soft text-warning"
  return "bg-muted text-muted-foreground"
}

export function TodaysFocusBand({ rec }: { rec: FocusRec | null }) {
  return (
    <section
      aria-labelledby="focus-title"
      className="relative overflow-hidden rounded-3xl bg-tile-lime p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">
          <Target className="size-4 text-brand-strong" /> Today&apos;s focus
        </p>
        {rec && (
          <Link
            href="/reports/recommendations"
            className="flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            All plans <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {!rec ? (
        <div className="mt-4">
          <h2 id="focus-title" className="font-heading text-2xl font-semibold tracking-tight">
            You&apos;re caught up
          </h2>
          <p className="mt-1 text-[15px] text-foreground/75">
            Nothing pending. Generate fresh recommendations or check back after tomorrow&apos;s sync.
          </p>
          <Link
            href="/reports/recommendations"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-medium text-ink-foreground"
          >
            Generate recommendations <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 id="focus-title" className="font-heading text-2xl leading-snug font-semibold tracking-tight md:text-[1.75rem]">
              {rec.query ? `“${rec.query}”` : "Your top opportunity"}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {rec.priority && (
                <Badge variant="secondary" className={priorityClass(rec.priority)}>
                  {rec.priority} priority
                </Badge>
              )}
              <span className="text-foreground/65">{stripProtocol(rec.siteUrl)}</span>
              {rec.estimatedTrafficGain ? (
                <span className="font-medium text-brand-strong">
                  +{rec.estimatedTrafficGain} clicks/mo if it reaches page one
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{rec.recommendationText}</p>
          </div>

          <div className="rounded-2xl bg-card p-4 shadow-[0_12px_30px_-20px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:ring-white/10">
            {rec.actionItems.length > 0 && (
              <ol className="space-y-2.5">
                {rec.actionItems.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-muted/60 p-3 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-background text-[11px] font-semibold ring-1 ring-border">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4 flex justify-end">
              <MarkCompleteButton recommendationId={rec.id} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
