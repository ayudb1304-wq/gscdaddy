"use client"

import { Suspense, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

interface Site {
  id: string
  site_url: string
  display_name: string | null
  sync_status: string
}

interface DashboardShellProps {
  user: {
    name: string | null
    email: string
    avatar_url: string | null
  }
  sites: Site[]
  plan: string
  daysRemaining?: number
  children: React.ReactNode
}

export function DashboardShell({ user, sites, plan, daysRemaining, children }: DashboardShellProps) {
  // Remember which page the mobile menu was opened on: navigating anywhere
  // else closes it (the shell persists across pages, so it used to stay open).
  const pathname = usePathname()
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const sidebarOpen = openedOn === pathname
  const setSidebarOpen = (open: boolean) => setOpenedOn(open ? pathname : null)

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar">
      {/* Desktop sidebar */}
      {/* The sidebar reads search params, which renders it client-side only. Its own Suspense
          boundary keeps that from shifting the generated ids of everything after it. */}
      <Suspense fallback={<div className="hidden w-60 shrink-0 bg-sidebar lg:block" />}>
        <Sidebar className="hidden lg:flex" />
      </Suspense>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-60 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:py-2 lg:pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background lg:rounded-2xl lg:shadow-[0_1px_3px_rgb(0_0_0/0.05)] lg:ring-1 lg:ring-black/[0.06] dark:lg:ring-white/[0.07]">
        <Header
          user={user}
          sites={sites}
          plan={plan}
          daysRemaining={daysRemaining}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        </div>
      </div>
    </div>
  )
}
