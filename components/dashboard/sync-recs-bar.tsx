"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Sparkles, AlertCircle, Lightbulb, Clock, FileText, Target, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SyncRecsBarProps {
  siteId: string
  initialSyncStatus: string
  initialLastSyncedAt: string | null
  hasFreshRecs: boolean
}

function timeAgo(date: string | null): string {
  if (!date) return "Never"
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SyncRecsBar({
  siteId,
  initialSyncStatus,
  initialLastSyncedAt,
  hasFreshRecs,
}: SyncRecsBarProps) {
  const router = useRouter()
  const [syncStatus, setSyncStatus] = useState(initialSyncStatus)
  const [lastSyncedAt, setLastSyncedAt] = useState(initialLastSyncedAt)
  const [syncProgress, setSyncProgress] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noOpportunitiesOpen, setNoOpportunitiesOpen] = useState(false)
  const justFinishedSyncRef = useRef(false)

  const isSyncing = syncStatus === "syncing"

  // Poll sync status while syncing, so the bar updates as the background
  // sync makes progress. When sync finishes we refresh the page so the rest
  // of the dashboard (charts, opportunities, recs) picks up the new data.
  useEffect(() => {
    if (!isSyncing) return

    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}/sync/status`)
        if (!res.ok) return
        const json = await res.json()
        const payload = json.data || json
        if (payload.syncProgress) setSyncProgress(payload.syncProgress)
        if (payload.syncStatus && payload.syncStatus !== "syncing") {
          setSyncStatus(payload.syncStatus)
          if (payload.lastSyncedAt) setLastSyncedAt(payload.lastSyncedAt)
          setSyncProgress(null)
          justFinishedSyncRef.current = true
          // Refresh the server component so metrics/charts/recs repaint
          // with the freshly-synced data (and, if Layer 2 ran, new recs).
          router.refresh()
          // Notify client-side pages (Striking Distance, Recommendations) that
          // fetch via useEffect — router.refresh() alone doesn't re-run their
          // effects, so they'd otherwise keep showing stale data.
          window.dispatchEvent(
            new CustomEvent("gsc:sync-completed", { detail: { siteId } })
          )
        }
      } catch {
        // ignore polling errors — we'll try again next tick
      }
    }, 3000)

    return () => clearInterval(id)
  }, [isSyncing, siteId, router])

  const handleSync = useCallback(async () => {
    setError(null)
    setSyncStatus("syncing")
    setSyncProgress("Starting sync")
    try {
      const res = await fetch(`/api/sites/${siteId}/sync`, { method: "POST" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error?.message || json.error || "Sync failed to start")
      }
    } catch (e) {
      setSyncStatus(initialSyncStatus)
      setSyncProgress(null)
      setError(e instanceof Error ? e.message : "Sync failed to start")
    }
  }, [siteId, initialSyncStatus])

  const handleGenerate = useCallback(async () => {
    setError(null)
    setGenerating(true)
    try {
      const res = await fetch(`/api/recommendations/generate/${siteId}`, {
        method: "POST",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error?.message || json.error || "Generation failed")
      }
      // Success shape is { success: true, data: <recommendations[]> }.
      // An empty array means generateRecommendations() returned [] because
      // the site has no striking-distance keywords yet — surface that as a
      // friendly dialog instead of silently doing nothing.
      const data = json.data ?? json
      if (Array.isArray(data) && data.length === 0) {
        setNoOpportunitiesOpen(true)
      } else {
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }, [siteId, router])

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">
          {isSyncing ? (
            <span className="animate-pulse">{syncProgress || "Syncing"}...</span>
          ) : (
            <>Last synced {timeAgo(lastSyncedAt)}</>
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="gap-1.5"
        >
          <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing" : "Sync now"}
        </Button>
        {!hasFreshRecs && (
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating || isSyncing}
            className="gap-1.5"
          >
            <Sparkles className={`size-3.5 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating..." : "Generate AI recommendations"}
          </Button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Dialog open={noOpportunitiesOpen} onOpenChange={setNoOpportunitiesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Lightbulb className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-center text-lg">
              Not enough data for recommendations — yet
            </DialogTitle>
            <DialogDescription className="text-center">
              Your site doesn&apos;t have any{" "}
              <span className="font-medium text-foreground">&quot;striking distance&quot; keywords</span>{" "}
              right now. These are queries where you rank between positions 5–15 with enough impressions
              to be worth optimizing — the sweet spot for quick SEO wins.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium">Here&apos;s what usually helps:</p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Clock className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Give it time.</p>
                  <p className="text-muted-foreground">
                    Brand-new sites need 2–4 weeks before Google Search Console starts reporting
                    meaningful impression data. If you just connected this site, check back in a few days.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <FileText className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Publish more content.</p>
                  <p className="text-muted-foreground">
                    More indexed pages means more queries you can rank for. Aim for 10–20 well-targeted
                    pages before expecting meaningful striking-distance keywords.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Target className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Target mid-tail keywords.</p>
                  <p className="text-muted-foreground">
                    Phrases like &quot;best X for Y&quot; reach striking distance faster than short,
                    high-competition queries.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <BarChart3 className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Check GSC directly.</p>
                  <p className="text-muted-foreground">
                    If Search Console is showing zero impressions for your site, that&apos;s the root
                    issue — make sure the site is verified and indexed before expecting ranking data.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setNoOpportunitiesOpen(false)}
              className="w-full sm:w-auto"
            >
              Got it
            </Button>
            <Button
              onClick={() => {
                setNoOpportunitiesOpen(false)
                handleSync()
              }}
              disabled={isSyncing}
              className="w-full gap-1.5 sm:w-auto"
            >
              <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              Re-sync from GSC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
