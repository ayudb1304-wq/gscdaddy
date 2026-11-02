"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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

  // Debounce filter typing so "foobar" doesn't fire six requests.
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilters(filters), 300)
    return () => clearTimeout(id)
  }, [filters])

  // New site: start from page 1 with an empty table, not the old site's rows.
  const [prevSiteId, setPrevSiteId] = useState(siteId)
  if (siteId !== prevSiteId) {
    setPrevSiteId(siteId)
    setPage(1)
    setData([])
    setTotal(0)
  }

  // Only the latest request may update state, so a slow response for an
  // earlier site/filter can't overwrite the current one.
  const requestId = useRef(0)

  const fetchData = useCallback(async () => {
    if (!siteId) return
    const id = ++requestId.current
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        page: String(page),
        limit: String(limit),
      })
      if (debouncedFilters.search) params.set("search", debouncedFilters.search)
      if (debouncedFilters.minImpressions) params.set("minImpressions", debouncedFilters.minImpressions)
      if (debouncedFilters.minPosition) params.set("minPosition", debouncedFilters.minPosition)
      if (debouncedFilters.maxPosition) params.set("maxPosition", debouncedFilters.maxPosition)

      const res = await fetch(`/api/reports/striking-distance/${siteId}?${params}`)
      const json = await res.json().catch(() => null)
      if (id !== requestId.current) return

      if (json?.success) {
        setData(json.data)
        setTotal(json.meta?.total ?? 0)
      } else {
        setData([])
        setTotal(0)
      }
    } catch {
      if (id === requestId.current) {
        setData([])
        setTotal(0)
      }
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [siteId, sortBy, sortOrder, page, debouncedFilters])

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
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">Striking distance</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
            Keywords averaging positions 5–20 over your last 28 days of data, sorted by opportunity.
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
