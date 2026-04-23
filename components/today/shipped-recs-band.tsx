import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ShippedRec {
  recommendationId: string
  siteUrl: string
  query: string
  page: string
  daysSinceShipped: number
  baseline: {
    clicksPerDay: number
    avgPosition: number
  }
  actual: {
    clicksPerDay: number
    avgPosition: number
    daysObserved: number
  } | null
}

function stripProtocol(url: string): string {
  return url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
}

function DeltaChip({ delta, inverse = false }: { delta: number; inverse?: boolean }) {
  const isZero = Math.abs(delta) < 0.05
  const isPositive = inverse ? delta < 0 : delta > 0
  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown
  const cls = isZero
    ? "text-muted-foreground"
    : isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400"
  const sign = delta > 0 ? "+" : ""
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", cls)}>
      <Icon className="h-3 w-3" />
      {sign}
      {Math.abs(delta) < 10 ? delta.toFixed(1) : Math.round(delta)}
    </span>
  )
}

export function ShippedRecsBand({ items }: { items: ShippedRec[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">Recs you shipped</CardTitle>
          <p className="text-xs text-muted-foreground">
            How your completed recommendations are performing
          </p>
        </div>
        <Link
          href="/reports/recommendations"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-4 text-center">
            <p className="text-sm font-medium">No shipped recs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mark a recommendation as complete and we&apos;ll start tracking its impact here.
            </p>
            <Link
              href="/reports/recommendations"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Go to recommendations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.recommendationId}
                className="flex items-start justify-between gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.query}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stripProtocol(item.siteUrl)} · {item.page.replace(/^https?:\/\/[^/]+/, "")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {item.actual ? (
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Clicks/day</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-medium">{item.actual.clicksPerDay.toFixed(1)}</span>
                          <DeltaChip
                            delta={item.actual.clicksPerDay - item.baseline.clicksPerDay}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Position</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-medium">{item.actual.avgPosition.toFixed(1)}</span>
                          <DeltaChip
                            delta={item.actual.avgPosition - item.baseline.avgPosition}
                            inverse
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Shipped {item.daysSinceShipped}d ago · checking in{" "}
                        {Math.max(1, 3 - item.daysSinceShipped)}d
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
