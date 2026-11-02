"use client"

import { useState, useSyncExternalStore } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Rocket, Target, Sparkles, BarChart3 } from "lucide-react"

const DISMISSED_KEY = "gscdaddy-welcome-dismissed"

// Storage can throw (blocked cookies, some private modes): treat that as
// "already dismissed" rather than crashing the dashboard or nagging forever.
function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null
  } catch {
    return true
  }
}

const noopSubscribe = () => () => {}

/**
 * Shown once per browser to new trial users only (the layout decides who is
 * eligible). Previously it showed to everyone, paid users included, on every
 * new device or after clearing site data.
 */
export function WelcomeModal() {
  // false on the server and during hydration, the stored value after that.
  const dismissedOnLoad = useSyncExternalStore(noopSubscribe, readDismissed, () => true)
  const [closed, setClosed] = useState(false)
  const open = !dismissedOnLoad && !closed

  function handleClose() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1")
    } catch {
      // Storage unavailable: closing for this page view is the best we can do.
    }
    setClosed(true)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="size-7 text-primary" />
          </div>
          <DialogTitle className="text-center font-heading text-xl">
            You are in. Welcome to GSCdaddy.
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Your Google rankings are about to get very uncomfortable.
            <br />
            (In a good way. For you. Not for your competitors.)
          </p>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border p-3">
            <Target className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium">Striking Distance</p>
              <p className="text-[11px] text-muted-foreground">Find keywords almost on page 1</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border p-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium">AI Action Plans</p>
              <p className="text-[11px] text-muted-foreground">Know exactly what to fix</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border p-3">
            <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium">Performance</p>
              <p className="text-[11px] text-muted-foreground">Track clicks and impressions</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border p-3">
            <Rocket className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium">14 Days Free</p>
              <p className="text-[11px] text-muted-foreground">No credit card needed</p>
            </div>
          </div>
        </div>

        <p className="mt-1 text-center text-xs text-muted-foreground">
          Pro tip: connect your site from Settings if you skipped it during onboarding.
        </p>

        <Button onClick={handleClose} className="mt-2 w-full" size="lg">
          Let me at it
        </Button>
      </DialogContent>
    </Dialog>
  )
}
