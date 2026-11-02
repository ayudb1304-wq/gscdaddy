import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser, getUserSites } from "@/lib/auth"
import { checkAccess, shouldShowWelcome } from "@/lib/billing/access"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AccessGate } from "@/components/dashboard/access-gate"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Cached per request: pages reuse the same query.
  const sites = await getUserSites(user.id)

  const access = checkAccess(user)

  const showWelcome = shouldShowWelcome(user)

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, avatar_url: user.avatar_url }}
      sites={sites.map((s) => ({ id: s.id, site_url: s.site_url, display_name: s.display_name, sync_status: s.sync_status }))}
      plan={access.plan}
      daysRemaining={access.daysRemaining}
      needsGoogleReconnect={user.google_auth_status === "reauth_required"}
    >
      <AccessGate hasAccess={access.hasAccess} showWelcome={showWelcome}>
        {children}
      </AccessGate>
    </DashboardShell>
  )
}
