import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { checkAccess } from "@/lib/billing/access"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: sites } = await admin
    .from("sites")
    .select("id, site_url, display_name, sync_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const access = checkAccess(user)

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, avatar_url: user.avatar_url }}
      sites={sites || []}
      daysRemaining={access.daysRemaining}
    >
      {children}
    </DashboardShell>
  )
}
