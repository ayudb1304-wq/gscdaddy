"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { notifyUsageChanged } from "@/lib/usage-events"
import { RecommendationCard } from "@/components/reports/recommendation-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Loader2 } from "lucide-react"

type FilterTab = "all" | "active" | "completed"

interface Recommendation {
  id: string
  type: string
  query: string
  page: string
  current_position: number
  potential_position: number
  estimated_traffic_gain: number
  recommendation_text: string
  action_items: string[]
  priority: string
  is_completed: boolean
  created_at: string
}

export default function RecommendationsPage() {
  const searchParams = useSearchParams()
  const siteId = searchParams.get("siteId") || ""

  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [actionError, setActionError] = useState<string | null>(null)

  // Don't show the previous site's recs while the new site loads.
  const [prevSiteId, setPrevSiteId] = useState(siteId)
  if (siteId !== prevSiteId) {
    setPrevSiteId(siteId)
    setRecommendations([])
    setActionError(null)
  }

  // Only the latest request may update state (slow responses for a previous
  // site would otherwise overwrite the current one).
  const requestId = useRef(0)

  const fetchRecs = useCallback(async () => {
    if (!siteId) return
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await fetch(`/api/recommendations?siteId=${siteId}`)
      const json = await res.json().catch(() => null)
      if (id !== requestId.current) return
      setRecommendations(json?.success ? json.data : [])
    } catch {
      if (id === requestId.current) setRecommendations([])
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [siteId])

  useEffect(() => {
    fetchRecs()
  }, [fetchRecs])

  useEffect(() => {
    const onSyncCompleted = (e: Event) => {
      const ce = e as CustomEvent<{ siteId: string }>
      if (ce.detail?.siteId === siteId) fetchRecs()
    }
    window.addEventListener("gsc:sync-completed", onSyncCompleted)
    return () => window.removeEventListener("gsc:sync-completed", onSyncCompleted)
  }, [siteId, fetchRecs])

  const handleGenerate = async () => {
    if (!siteId) return
    setGenerating(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/recommendations/generate/${siteId}`, { method: "POST" })
      // A timeout comes back as an HTML error page, not JSON.
      const json = await res.json().catch(() => null)
      if (json?.success) {
        await fetchRecs()
        notifyUsageChanged()
      } else {
        setActionError(json?.error?.message || "Generating recommendations took too long or failed. Try again in a minute.")
      }
    } catch {
      setActionError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleComplete = async (id: string) => {
    setActionError(null)
    const res = await fetch(`/api/recommendations/${id}`, { method: "PATCH" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!json?.success) {
      setActionError("Couldn't update that recommendation. Try again.")
      return
    }
    {
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_completed: json.data.is_completed } : r
        )
      )
    }
  }

  const handleDismiss = async (id: string) => {
    setActionError(null)
    const res = await fetch(`/api/recommendations/${id}`, { method: "DELETE" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!json?.success) {
      setActionError("Couldn't dismiss that recommendation. Try again.")
      return
    }
    notifyUsageChanged()
    {
      setRecommendations((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const filtered = recommendations.filter((r) => {
    if (activeTab === "active") return !r.is_completed
    if (activeTab === "completed") return r.is_completed
    return true
  })

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: recommendations.length },
    { key: "active", label: "Active", count: recommendations.filter((r) => !r.is_completed).length },
    { key: "completed", label: "Completed", count: recommendations.filter((r) => r.is_completed).length },
  ]

  if (!siteId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No site selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a site from the dropdown above to view recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">Recommendations</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
            Step-by-step plans for your striking-distance keywords, written from your own data.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate New
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg border border-critical/30 bg-critical-soft px-4 py-3 text-sm text-critical">
          {actionError}
        </p>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-4" />
          {recommendations.length > 0 ? (
            <p className="text-lg font-medium">
              {activeTab === "completed" ? "Nothing completed yet" : "No active recommendations"}
            </p>
          ) : (
            <>
              <p className="text-lg font-medium">No recommendations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &quot;Generate New&quot; to get AI-powered SEO recommendations.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onComplete={handleComplete}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}
