"use client"

import { useCallback, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface FiltersState {
  search: string
  minImpressions: string
  minPosition: string
  maxPosition: string
}

interface KeywordsFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
}

export function KeywordsFilters({ filters, onFiltersChange }: KeywordsFiltersProps) {
  const [local, setLocal] = useState(filters)
  const [isPending, startTransition] = useTransition()

  const apply = useCallback(
    (updated: FiltersState) => {
      setLocal(updated)
      startTransition(() => {
        onFiltersChange(updated)
      })
    },
    [onFiltersChange]
  )

  const clear = () => {
    apply({ search: "", minImpressions: "", minPosition: "", maxPosition: "" })
  }

  const hasFilters = local.search || local.minImpressions || local.minPosition || local.maxPosition

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search keywords or pages..."
          value={local.search}
          onChange={(e) => apply({ ...local, search: e.target.value })}
          className="pl-9"
        />
      </div>
      <div className="w-[140px]">
        <label className="mb-1 block text-xs text-muted-foreground">Min Impressions</label>
        <Input
          type="number"
          placeholder="e.g. 100"
          value={local.minImpressions}
          onChange={(e) => apply({ ...local, minImpressions: e.target.value })}
        />
      </div>
      <div className="w-[120px]">
        <label className="mb-1 block text-xs text-muted-foreground">Min Position</label>
        <Input
          type="number"
          placeholder="5"
          value={local.minPosition}
          onChange={(e) => apply({ ...local, minPosition: e.target.value })}
        />
      </div>
      <div className="w-[120px]">
        <label className="mb-1 block text-xs text-muted-foreground">Max Position</label>
        <Input
          type="number"
          placeholder="15"
          value={local.maxPosition}
          onChange={(e) => apply({ ...local, maxPosition: e.target.value })}
        />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear}>
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  )
}
