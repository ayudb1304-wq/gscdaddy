"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="font-heading text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        This page hit an error loading your data. Try again, and if it keeps happening, reload the page.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
