import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

export interface Mover {
  query: string
  page: string
  siteUrl: string
  clickDelta: number
  recentClicks: number
  priorClicksAvg: number
}

function stripProtocol(url: string): string {
  return url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
}

function MoverRow({ item, kind }: { item: Mover; kind: "gain" | "drop" }) {
  const Icon = kind === "gain" ? ArrowUp : ArrowDown
  const color =
    kind === "gain"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400"
  const sign = item.clickDelta > 0 ? "+" : ""
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.query}</p>
        <p className="truncate text-xs text-muted-foreground">
          {stripProtocol(item.siteUrl)}
        </p>
      </div>
      <div className={`flex shrink-0 items-center gap-1 text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        <span>
          {sign}
          {Math.round(item.clickDelta)} clicks
        </span>
      </div>
    </div>
  )
}

export function MoversBand({
  gainers,
  droppers,
}: {
  gainers: Mover[]
  droppers: Mover[]
}) {
  const nothingToShow = gainers.length === 0 && droppers.length === 0
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Yesterday&apos;s movers</CardTitle>
        <p className="text-xs text-muted-foreground">
          Last 48 hours vs. prior 7-day average
        </p>
      </CardHeader>
      <CardContent>
        {nothingToShow ? (
          <p className="text-sm text-muted-foreground">
            Nothing unusual in the last 48 hours. Quiet days are a good sign.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Biggest gainers
              </p>
              {gainers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No significant gains.</p>
              ) : (
                <div className="space-y-3">
                  {gainers.map((m) => (
                    <MoverRow key={`g-${m.query}-${m.page}`} item={m} kind="gain" />
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Needs attention
              </p>
              {droppers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No significant drops.</p>
              ) : (
                <div className="space-y-3">
                  {droppers.map((m) => (
                    <MoverRow key={`d-${m.query}-${m.page}`} item={m} kind="drop" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
