"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KeywordRow {
  query: string
  page: string
  avgPosition: number
  impressions: number
  clicks: number
  ctr: number
  opportunityScore: number
  estimatedTrafficGain: number
  lastSeen: string
}

interface KeywordsTableProps {
  data: KeywordRow[]
  total: number
  page: number
  limit: number
  sortBy: string
  sortOrder: string
  onSort: (column: string) => void
  onPageChange: (page: number) => void
}

const columns = [
  { key: "query", label: "Keyword", sortable: false },
  { key: "avg_position", label: "Position", sortable: true },
  { key: "total_impressions", label: "Impressions", sortable: true },
  { key: "total_clicks", label: "Clicks", sortable: true },
  { key: "avg_ctr", label: "CTR", sortable: true },
  { key: "opportunity_score", label: "Opportunity", sortable: true },
  { key: "traffic_gain", label: "Est. Traffic Gain", sortable: false },
]

function formatPageUrl(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, "")
}

export function KeywordsTable({
  data,
  total,
  page,
  limit,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: KeywordsTableProps) {
  const totalPages = Math.ceil(total / limit)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No striking distance keywords found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters, or sync more data from Google Search Console.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className={cn(
                        "flex items-center gap-1 hover:text-foreground transition-colors",
                        sortBy === col.key && "text-foreground font-medium"
                      )}
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={`${row.query}-${row.page}`}>
                <TableCell>
                  <div>
                    <p className="font-medium">{row.query}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {formatPageUrl(row.page)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{row.avgPosition.toFixed(1)}</TableCell>
                <TableCell className="font-mono">{row.impressions.toLocaleString()}</TableCell>
                <TableCell className="font-mono">{row.clicks.toLocaleString()}</TableCell>
                <TableCell className="font-mono">{(row.ctr * 100).toFixed(2)}%</TableCell>
                <TableCell className="font-mono font-medium">{row.opportunityScore.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={cn(
                    "font-mono text-sm",
                    row.estimatedTrafficGain > 0 ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    +{row.estimatedTrafficGain.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} keywords
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
