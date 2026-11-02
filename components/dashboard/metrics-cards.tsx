import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MousePointerClick, Eye, ArrowUpDown, Crosshair, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsData {
  current: {
    clicks: number
    impressions: number
    avgPosition: number
  }
  // null = no prior period to compare against (the change is hidden)
  changes: {
    clicks: number | null
    impressions: number | null
    avgPosition: number | null
  }
  strikingDistanceCount: number
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function ChangeIndicator({ value, inverted = false }: { value: number | null; inverted?: boolean }) {
  // No comparable prior period (new site) or no change: neutral, not a red drop.
  if (value === null || value === 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {value === null ? "New" : "No change"}
      </span>
    )
  }
  const isPositive = inverted ? value < 0 : value > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const color = isPositive ? "text-ok" : "text-critical"

  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%
    </span>
  )
}

const cards = [
  {
    title: "Total Clicks",
    icon: MousePointerClick,
    getValue: (d: MetricsData) => formatNumber(d.current.clicks),
    getChange: (d: MetricsData) => d.changes.clicks,
  },
  {
    title: "Impressions",
    icon: Eye,
    getValue: (d: MetricsData) => formatNumber(d.current.impressions),
    getChange: (d: MetricsData) => d.changes.impressions,
  },
  {
    title: "Avg Position",
    icon: ArrowUpDown,
    getValue: (d: MetricsData) => d.current.avgPosition.toFixed(1),
    getChange: (d: MetricsData) => d.changes.avgPosition,
    inverted: true,
  },
  {
    title: "Striking Distance",
    icon: Crosshair,
    getValue: (d: MetricsData) => formatNumber(d.strikingDistanceCount),
    getChange: () => null,
  },
]

export function MetricsCards({ data }: { data: MetricsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const change = card.getChange(data)
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-[2rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">{card.getValue(data)}</div>
              {change !== null && (
                <div className="mt-1">
                  <ChangeIndicator value={change} inverted={card.inverted} />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
