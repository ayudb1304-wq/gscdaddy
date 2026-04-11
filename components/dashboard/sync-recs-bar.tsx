"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      router.refresh()
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
    </div>
  )
}
