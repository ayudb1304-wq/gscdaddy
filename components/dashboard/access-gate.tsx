"use client"

import { usePathname } from "next/navigation"
import { TrialExpiredGate } from "./trial-expired-gate"
import { WelcomeModal } from "./welcome-modal"

const UNGATED_PATHS = ["/settings/billing"]

export function AccessGate({
  hasAccess,
  showWelcome,
  children,
}: {
  hasAccess: boolean
  /** New trial users only; decided server-side in the dashboard layout. */
  showWelcome: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isUngated = UNGATED_PATHS.some((p) => pathname.startsWith(p))

  if (!hasAccess && !isUngated) {
    return <TrialExpiredGate />
  }

  return (
    <>
      {showWelcome && <WelcomeModal />}
      {children}
    </>
  )
}
