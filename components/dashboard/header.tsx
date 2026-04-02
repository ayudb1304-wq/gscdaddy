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

interface HeaderProps {
  user: {
    name: string | null
    email: string
    avatar_url: string | null
  }
  sites: Site[]
  daysRemaining?: number
  onToggleSidebar: () => void
}

export function Header({ user, sites, daysRemaining, onToggleSidebar }: HeaderProps) {
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
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
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
