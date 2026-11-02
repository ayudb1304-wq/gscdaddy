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
  { key: "traffic_gain", label: "Clicks/mo at #3", sortable: false },
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
  const maxScore = Math.max(1, ...data.map((r) => r.opportunityScore))

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
      <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(0_0_0/0.12)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
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
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium">{row.query}</p>
                    <p className="max-w-[300px] truncate text-xs text-muted-foreground">
                      {formatPageUrl(row.page)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex min-w-12 justify-center rounded-md px-2 py-0.5 font-mono text-[13px] tabular-nums",
                      row.avgPosition <= 10 ? "bg-ok-soft text-ok" : "bg-muted"
                    )}
                  >
                    {row.avgPosition.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-[13px] tabular-nums">{row.impressions.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-[13px] tabular-nums">{row.clicks.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-[13px] tabular-nums">{(row.ctr * 100).toFixed(2)}%</TableCell>
                <TableCell>
                  <div className="flex min-w-36 items-center gap-2.5">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${Math.round((row.opportunityScore / maxScore) * 100)}%` }}
                      />
                    </span>
                    <span className="w-12 text-right font-mono text-[13px] tabular-nums">
                      {row.opportunityScore.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "font-mono text-sm",
                    row.estimatedTrafficGain > 0 ? "text-ok" : "text-muted-foreground"
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
