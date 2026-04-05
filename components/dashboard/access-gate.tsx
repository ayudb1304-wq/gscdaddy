"use client"

import { usePathname } from "next/navigation"
import { TrialExpiredGate } from "./trial-expired-gate"
import { WelcomeModal } from "./welcome-modal"

const UNGATED_PATHS = ["/settings/billing"]

export function AccessGate({
  hasAccess,
  children,
}: {
  hasAccess: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isUngated = UNGATED_PATHS.some((p) => pathname.startsWith(p))

  if (!hasAccess && !isUngated) {
    return <TrialExpiredGate />
  }

  return (
    <>
      <WelcomeModal />
      {children}
    </>
  )
}
