"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  title_optimization: { label: "Title Optimization", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  content_expansion: { label: "Content Expansion", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  internal_linking: { label: "Internal Linking", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  content_refresh: { label: "Content Refresh", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  cannibalization_fix: { label: "Cannibalization Fix", className: "bg-red-500/10 text-red-600 border-red-200" },
  quick_win: { label: "Quick Win", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
}

const PRIORITY_CONFIG: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-muted-foreground",
}

interface RecommendationCardProps {
  recommendation: Recommendation
  onComplete: (id: string) => Promise<void>
  onDismiss: (id: string) => Promise<void>
}

export function RecommendationCard({ recommendation: rec, onComplete, onDismiss }: RecommendationCardProps) {
  const [completing, setCompleting] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  const typeConfig = TYPE_CONFIG[rec.type] || { label: rec.type, className: "" }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await onComplete(rec.id)
    } finally {
      setCompleting(false)
    }
  }

  const handleDismiss = async () => {
    setDismissing(true)
    try {
      await onDismiss(rec.id)
    } finally {
      setDismissing(false)
    }
  }

  return (
    <Card className={cn(rec.is_completed && "opacity-60")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", typeConfig.className)}>
              {typeConfig.label}
            </Badge>
            <span className={cn("text-xs font-medium uppercase", PRIORITY_CONFIG[rec.priority])}>
              {rec.priority} priority
            </span>
          </div>
          <p className="font-medium">{rec.query}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[500px]">
            {rec.page.replace(/^https?:\/\/[^/]+/, "")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right text-xs">
            <div className="flex items-center gap-1 text-emerald-500">
              <ArrowUp className="h-3 w-3" />
              <span className="font-mono">{rec.current_position.toFixed(1)} → {rec.potential_position.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground">+{rec.estimated_traffic_gain} clicks/mo</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">{rec.recommendation_text}</p>

        {rec.action_items && rec.action_items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Action Items</p>
            <ul className="space-y-1.5">
              {rec.action_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    rec.is_completed
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-muted-foreground/30"
                  )}>
                    {rec.is_completed && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className={cn(rec.is_completed && "line-through text-muted-foreground")}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant={rec.is_completed ? "secondary" : "default"}
            size="sm"
            onClick={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-3 w-3" />
            )}
            {rec.is_completed ? "Undo Complete" : "Mark Complete"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={dismissing}
          >
            {dismissing ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <X className="mr-1.5 h-3 w-3" />
            )}
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
