import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
  if (priority === "medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
}

export function TodaysFocusBand({ rec }: { rec: FocusRec | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium">Today&apos;s focus</CardTitle>
        </div>
        {rec && (
          <Link
            href="/reports/recommendations"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {!rec ? (
          <div className="rounded-md border border-dashed border-border/60 p-4 text-center">
            <p className="text-sm font-medium">You&apos;re caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nothing pending. Generate fresh recommendations or check back after tomorrow&apos;s sync.
            </p>
            <Link
              href="/reports/recommendations"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Generate recommendations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {rec.priority && (
                <Badge variant="secondary" className={priorityClass(rec.priority)}>
                  {rec.priority}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {stripProtocol(rec.siteUrl)}
                {rec.query ? ` · ${rec.query}` : ""}
              </span>
              {rec.estimatedTrafficGain ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  +{rec.estimatedTrafficGain} est. clicks/mo
                </span>
              ) : null}
            </div>

            <p className="text-sm leading-relaxed">{rec.recommendationText}</p>

            {rec.actionItems.length > 0 && (
              <ul className="space-y-1.5 text-sm">
                {rec.actionItems.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-muted-foreground">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <MarkCompleteButton recommendationId={rec.id} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
