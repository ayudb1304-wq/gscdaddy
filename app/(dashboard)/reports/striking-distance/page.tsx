"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { KeywordsTable, type KeywordRow } from "@/components/reports/keywords-table"
import { KeywordsFilters } from "@/components/reports/keywords-filters"
import { ExportCsv } from "@/components/reports/export-csv"
import { Skeleton } from "@/components/ui/skeleton"

interface FiltersState {
  search: string
  minImpressions: string
  minPosition: string
  maxPosition: string
}

export default function StrikingDistancePage() {
  const searchParams = useSearchParams()
  const siteId = searchParams.get("siteId") || ""

  const [data, setData] = useState<KeywordRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("opportunity_score")
  const [sortOrder, setSortOrder] = useState("desc")
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    minImpressions: "",
    minPosition: "",
    maxPosition: "",
  })

  const limit = 25

  const fetchData = useCallback(async () => {
    if (!siteId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        page: String(page),
        limit: String(limit),
      })
      if (filters.search) params.set("search", filters.search)
      if (filters.minImpressions) params.set("minImpressions", filters.minImpressions)
      if (filters.minPosition) params.set("minPosition", filters.minPosition)
      if (filters.maxPosition) params.set("maxPosition", filters.maxPosition)

      const res = await fetch(`/api/reports/striking-distance/${siteId}?${params}`)
      const json = await res.json()

      if (json.success) {
        setData(json.data)
        setTotal(json.meta?.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [siteId, sortBy, sortOrder, page, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const onSyncCompleted = (e: Event) => {
      const ce = e as CustomEvent<{ siteId: string }>
      if (ce.detail?.siteId === siteId) fetchData()
    }
    window.addEventListener("gsc:sync-completed", onSyncCompleted)
    return () => window.removeEventListener("gsc:sync-completed", onSyncCompleted)
  }, [siteId, fetchData])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters)
    setPage(1)
  }

  if (!siteId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No site selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a site from the dropdown above to view your striking distance keywords.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Striking Distance Keywords</h1>
          <p className="text-sm text-muted-foreground">
            Keywords ranking positions 5–15 with the highest traffic potential
          </p>
        </div>
        <ExportCsv siteId={siteId} filters={filters} />
      </div>

      <KeywordsFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <KeywordsTable
          data={data}
          total={total}
          page={page}
          limit={limit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
