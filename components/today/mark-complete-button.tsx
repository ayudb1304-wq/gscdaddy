"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MarkCompleteButton({ recommendationId }: { recommendationId: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleClick = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/recommendations/${recommendationId}`, { method: "PATCH" })
      if (res.ok) router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={submitting} className="gap-1.5">
      {submitting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      Mark complete
    </Button>
  )
}
