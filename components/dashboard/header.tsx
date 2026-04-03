"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SiteSelector } from "./site-selector"

interface Site {
  id: string
  site_url: string
  display_name: string | null
  sync_status: string
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  trial: "bg-muted text-muted-foreground",
  blogger: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-primary/10 text-primary",
  agency: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  trial: "Trial",
  blogger: "Blogger",
  pro: "Pro",
  agency: "Agency",
}

interface HeaderProps {
  user: {
    name: string | null
    email: string
    avatar_url: string | null
  }
  sites: Site[]
  plan: string
  daysRemaining?: number
  onToggleSidebar: () => void
}

export function Header({ user, sites, plan, daysRemaining, onToggleSidebar }: HeaderProps) {
  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <SiteSelector sites={sites} />
      </div>

      <div className="flex items-center gap-3">
        {daysRemaining !== undefined && daysRemaining > 0 && (
          <Badge variant="secondary" className="text-xs">
            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left in trial
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-auto gap-2 rounded-full px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Badge
                variant="secondary"
                className={`text-[10px] font-semibold ${PLAN_BADGE_STYLES[plan] ?? PLAN_BADGE_STYLES.free}`}
              >
                {PLAN_LABELS[plan] ?? plan}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => { window.location.href = "/settings/profile" }}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                fetch("/api/auth/logout", { method: "POST" }).then(() => {
                  window.location.href = "/login"
                })
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
