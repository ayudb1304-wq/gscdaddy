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

export function ExportCsv({ siteId, filters }: ExportCsvProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "10000", page: "1" })
      if (filters.search) params.set("search", filters.search)
      if (filters.minImpressions) params.set("minImpressions", filters.minImpressions)
      if (filters.minPosition) params.set("minPosition", filters.minPosition)
      if (filters.maxPosition) params.set("maxPosition", filters.maxPosition)

      const res = await fetch(`/api/reports/striking-distance/${siteId}?${params}`)
      const json = await res.json()

      if (!json.success || !json.data) return

      const rows: KeywordRow[] = json.data
      const headers = ["Keyword", "Page", "Avg Position", "Impressions", "Clicks", "CTR", "Opportunity Score", "Est. Traffic Gain"]
      const csvRows = rows.map((r) => [
        `"${r.query.replace(/"/g, '""')}"`,
        `"${r.page.replace(/"/g, '""')}"`,
        r.avgPosition.toFixed(1),
        r.impressions,
        r.clicks,
        (r.ctr * 100).toFixed(2) + "%",
        r.opportunityScore,
        r.estimatedTrafficGain,
      ])

      const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `striking-distance-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export CSV
    </Button>
  )
}
