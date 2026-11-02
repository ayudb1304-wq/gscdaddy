"use client"

import { useEffect, useTransition } from "react"
import { Loader2 } from "lucide-react"
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
  // Server-rendered pages (Dashboard, Today) keep showing the old site until
  // the new one has loaded; the transition tells us that's happening.
  const [switching, startSwitch] = useTransition()
  const paramSiteId = searchParams.get("siteId")
  const paramIsValid = !!paramSiteId && sites.some((s) => s.id === paramSiteId)
  const currentSiteId = paramIsValid ? paramSiteId : sites[0]?.id

  // Ensure a valid siteId is always in the URL so client pages can read it
  // (also replaces a stale one, e.g. after the site was removed). Uses the
  // History API, which Next.js syncs with useSearchParams, instead of
  // router.replace(): that re-rendered the whole server page (e.g. Today ran
  // all its queries twice on every arrival). Server pages already fall back to
  // the first site when the param is missing.
  useEffect(() => {
    if (sites.length > 0 && !paramIsValid) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("siteId", sites[0].id)
      window.history.replaceState(window.history.state, "", `?${params.toString()}`)
    }
  }, [sites, searchParams, paramIsValid])

  const handleChange = (siteId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("siteId", siteId)
    startSwitch(() => router.push(`?${params.toString()}`))
  }

  if (sites.length === 0) return null

  return (
    <div className="flex items-center gap-2">
    {switching && (
      <div
        role="progressbar"
        aria-label="Loading site"
        className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/20"
      >
        <div className="h-full w-1/3 animate-[site-switch_1s_ease-in-out_infinite] bg-primary" />
      </div>
    )}
    <Select value={currentSiteId} onValueChange={handleChange} disabled={switching}>
      <SelectTrigger className="w-[220px]" aria-busy={switching}>
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
    {switching && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
    </div>
  )
}
