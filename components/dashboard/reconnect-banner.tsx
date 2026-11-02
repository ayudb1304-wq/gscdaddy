"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/app/login/actions"

/**
 * Shown when Google rejected the stored credentials (revoked access, expired
 * grant, or Search Console scope not granted). Before, syncs just failed every
 * day with a bare "Failed" badge.
 */
export function ReconnectBanner() {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 border-b border-warning/30 bg-warning-soft px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between md:px-6"
    >
      <p className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          Google stopped letting us read your Search Console data, so your sites aren&apos;t syncing. Reconnect to
          pick up where you left off; nothing is lost.
        </span>
      </p>
      <form action={signInWithGoogle}>
        <Button type="submit" size="sm" variant="ink" className="shrink-0">
          Reconnect Google
        </Button>
      </form>
    </div>
  )
}
