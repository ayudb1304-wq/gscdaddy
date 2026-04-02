"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Site {
  id: string
  site_url: string
  display_name: string | null
  sync_status: string
}

function formatSiteUrl(url: string): string {
  return url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
}

export function SiteSelector({ sites }: { sites: Site[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSiteId = searchParams.get("siteId") || sites[0]?.id

  // Ensure siteId is always in the URL so client pages can read it
  useEffect(() => {
    if (sites.length > 0 && !searchParams.get("siteId")) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("siteId", sites[0].id)
      router.replace(`?${params.toString()}`)
    }
  }, [sites, searchParams, router])

  const handleChange = (siteId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("siteId", siteId)
    router.push(`?${params.toString()}`)
  }

  if (sites.length === 0) return null

  if (sites.length === 1) {
    return (
      <div className="text-sm font-medium text-muted-foreground">
        {sites[0].display_name || formatSiteUrl(sites[0].site_url)}
      </div>
    )
  }

  return (
    <Select value={currentSiteId} onValueChange={handleChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a site" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            {site.display_name || formatSiteUrl(site.site_url)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
