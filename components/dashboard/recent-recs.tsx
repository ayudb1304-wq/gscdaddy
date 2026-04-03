import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface Recommendation {
  id: string
  keyword: string
  title: string
  status: string
  created_at: string
}

export function RecentRecs({ data }: { data: Recommendation[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Recent Recommendations</CardTitle>
        <Link
          href="/reports/recommendations"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations yet. Head to the Recommendations page to generate your first AI-powered action plan.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{rec.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{rec.keyword}</p>
                </div>
                <Badge
                  variant={rec.status === "completed" ? "default" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
