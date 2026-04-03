import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface Opportunity {
  query: string
  page: string
  avg_position: number
  total_impressions: number
  opportunity_score: number
}

export function TopOpportunities({ data }: { data: Opportunity[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Top Opportunities</CardTitle>
        <Link
          href="/reports/striking-distance"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No striking distance keywords found yet. These appear when you have pages ranking at positions 5-15 with sufficient impressions.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => (
              <div key={`${item.query}-${item.page}`} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.query}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.page.replace(/^https?:\/\/[^/]+/, "")}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right text-xs shrink-0">
                  <div>
                    <p className="font-medium">{item.avg_position.toFixed(1)}</p>
                    <p className="text-muted-foreground">Position</p>
                  </div>
                  <div>
                    <p className="font-medium">{item.total_impressions.toLocaleString()}</p>
                    <p className="text-muted-foreground">Impressions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
