"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Globe, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"

interface Site {
  id: string
  site_url: string
  display_name: string | null
  sync_status: string
  last_synced_at: string | null
}

interface AvailableSite {
  siteUrl: string
  permissionLevel: string
  isAdded: boolean
}

interface Usage {
  sitesUsed: number
  sitesLimit: number
}

const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Synced", variant: "default" },
  syncing: { label: "Syncing...", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [availableSites, setAvailableSites] = useState<AvailableSite[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  const fetchSites = useCallback(async () => {
    const [sitesRes, usageRes] = await Promise.all([
      fetch("/api/sites"),
      fetch("/api/billing/usage"),
    ])
    const sitesData = await sitesRes.json()
    const usageData = await usageRes.json()
    setSites(sitesData.data || sitesData || [])
    setUsage(usageData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  async function handleSync(siteId: string) {
    setSyncing(siteId)
    await fetch(`/api/sites/${siteId}/sync`, { method: "POST" })
    // Update the site status locally
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, sync_status: "syncing" } : s))
    )
    setSyncing(null)
  }

  async function handleRemove(siteId: string) {
    await fetch(`/api/sites/${siteId}`, { method: "DELETE" })
    setSites((prev) => prev.filter((s) => s.id !== siteId))
    if (usage) setUsage({ ...usage, sitesUsed: usage.sitesUsed - 1 })
  }

  async function openAddDialog() {
    setAddDialogOpen(true)
    setLoadingAvailable(true)
    try {
      const res = await fetch("/api/sites/available")
      const data = await res.json()
      setAvailableSites(data.data || data || [])
    } finally {
      setLoadingAvailable(false)
    }
  }

  async function handleAddSite(siteUrl: string, permissionLevel: string) {
    setAdding(siteUrl)
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, permissionLevel }),
      })
      if (res.ok) {
        setAddDialogOpen(false)
        await fetchSites()
      }
    } finally {
      setAdding(null)
    }
  }

  function formatUrl(url: string) {
    return url.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, "")
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const atLimit = usage ? usage.sitesUsed >= usage.sitesLimit : false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {usage ? `${usage.sitesUsed} / ${usage.sitesLimit} sites used` : ""}
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAddDialog} disabled={atLimit}>
              <Plus className="mr-2 size-4" />
              Add site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a site from Google Search Console</DialogTitle>
            </DialogHeader>
            {loadingAvailable ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableSites.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sites found in your Google Search Console.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {availableSites.map((site) => (
                  <button
                    key={site.siteUrl}
                    disabled={site.isAdded || adding !== null}
                    onClick={() => handleAddSite(site.siteUrl, site.permissionLevel)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatUrl(site.siteUrl)}</p>
                        <p className="text-xs text-muted-foreground">{site.permissionLevel}</p>
                      </div>
                    </div>
                    {site.isAdded ? (
                      <Badge variant="secondary" className="text-xs">Added</Badge>
                    ) : adding === site.siteUrl ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {atLimit && (
        <p className="text-xs text-muted-foreground">
          You&apos;ve reached your plan&apos;s site limit.{" "}
          <a href="/settings/billing" className="text-primary hover:underline">Upgrade</a> for more.
        </p>
      )}

      {/* Sites list */}
      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Globe className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No sites connected</p>
          <p className="mt-1 text-xs text-muted-foreground">Add a site from your Google Search Console to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => {
            const status = STATUS_STYLES[site.sync_status] || STATUS_STYLES.pending
            return (
              <div
                key={site.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatUrl(site.site_url)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
                        {status.label}
                      </Badge>
                      {site.last_synced_at && (
                        <span>Last synced {timeAgo(site.last_synced_at)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleSync(site.id)}
                    disabled={syncing === site.id || site.sync_status === "syncing"}
                    title="Sync now"
                  >
                    <RefreshCw className={`size-3.5 ${syncing === site.id ? "animate-spin" : ""}`} />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" title="Remove site">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove site?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {formatUrl(site.site_url)} and all its synced data,
                          including keywords and recommendations. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(site.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove site
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
