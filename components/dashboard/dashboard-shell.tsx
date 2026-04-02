"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Sheet, SheetContent } from "@/components/ui/sheet"

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
  daysRemaining?: number
  children: React.ReactNode
}

export function DashboardShell({ user, sites, daysRemaining, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          sites={sites}
          daysRemaining={daysRemaining}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
