"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import type { KeywordRow } from "./keywords-table"

interface ExportCsvProps {
  siteId: string
  filters: {
    search: string
    minImpressions: string
    minPosition: string
    maxPosition: string
  }
}

const PAGE_SIZE = 1000
const MAX_ROWS = 50_000

/** Quote a CSV cell and neutralise spreadsheet formulas (=, +, -, @ at the start). */
function cell(value: string | number): string {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export function ExportCsv({ siteId, filters }: ExportCsvProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      // Page through the results: one request is capped at 1,000 rows, so large
      // exports used to be cut off silently.
      const rows: KeywordRow[] = []
      for (let page = 1; rows.length < MAX_ROWS; page++) {
        const params = new URLSearchParams({ export: "1", limit: String(PAGE_SIZE), page: String(page) })
        if (filters.search) params.set("search", filters.search)
        if (filters.minImpressions) params.set("minImpressions", filters.minImpressions)
        if (filters.minPosition) params.set("minPosition", filters.minPosition)
        if (filters.maxPosition) params.set("maxPosition", filters.maxPosition)

        const res = await fetch(`/api/reports/striking-distance/${siteId}?${params}`)
        const json = await res.json().catch(() => null)
        if (!json?.success) {
          setError(json?.error?.message || "Couldn't export. Please try again.")
          return
        }
        rows.push(...(json.data as KeywordRow[]))
        const total = Number(json.meta?.total ?? 0)
        if (json.data.length < PAGE_SIZE || rows.length >= total) break
      }

      const headers = ["Keyword", "Page", "Avg Position", "Impressions (28d)", "Clicks (28d)", "CTR", "Opportunity Score", "Est. extra clicks/mo at #3"]
      const csvRows = rows.map((r) => [
        cell(r.query),
        cell(r.page),
        r.avgPosition.toFixed(1),
        r.impressions,
        r.clicks,
        (r.ctr * 100).toFixed(2) + "%",
        r.opportunityScore,
        r.estimatedTrafficGain,
      ])

      // BOM so Excel reads non-ASCII keywords as UTF-8.
      const csv = "\uFEFF" + [headers.map(cell).join(","), ...csvRows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `striking-distance-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("Couldn't reach the server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export CSV
      </Button>
      {error && <p role="alert" className="max-w-xs text-right text-xs text-critical">{error}</p>}
    </div>
  )
}
