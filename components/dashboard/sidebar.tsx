"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, Target, Lightbulb, Settings, Crosshair, ChevronDown, CreditCard, Globe, Sparkles, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Reports",
    icon: Target,
    children: [
      { label: "Striking Distance", href: "/reports/striking-distance", icon: Crosshair },
      { label: "Recommendations", href: "/reports/recommendations", icon: Lightbulb },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "Sites", href: "/settings/sites", icon: Globe },
      { label: "Billing", href: "/settings/billing", icon: CreditCard },
    ],
  },
]

interface Usage {
  sitesUsed: number
  sitesLimit: number
  recsToday: number
  recsLimit: number
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(["Reports"])
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    fetch("/api/billing/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {})
  }, [])

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Logo size={28} />
        <span className="font-heading text-lg font-bold">GSCdaddy</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedSections.includes(item.label)
            const isChildActive = item.children.some((child) => pathname.startsWith(child.href))

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSection(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isChildActive && "text-sidebar-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          pathname.startsWith(child.href)
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/70"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usage counters */}
      {usage && (
        <div className="border-t border-sidebar-border px-4 py-3 space-y-2.5">
          <UsageCounter
            icon={Globe}
            label="Sites"
            used={usage.sitesUsed}
            limit={usage.sitesLimit}
          />
          <UsageCounter
            icon={Sparkles}
            label="AI recs today"
            used={usage.recsToday}
            limit={usage.recsLimit}
          />
          <Link
            href="/settings/billing"
            className="block text-center text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors"
          >
            Upgrade for more
          </Link>
        </div>
      )}
    </aside>
  )
}

function UsageCounter({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  used: number
  limit: number
}) {
  const isUnlimited = limit >= 999
  const remaining = isUnlimited ? null : limit - used
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-sidebar-foreground/60">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className="font-medium text-sidebar-foreground/80">
          {isUnlimited ? `${used}` : `${remaining} left`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-sidebar-accent">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isUnlimited
              ? "bg-sidebar-primary/40"
              : pct >= 90
                ? "bg-destructive"
                : pct >= 70
                  ? "bg-yellow-500"
                  : "bg-sidebar-primary"
          )}
          style={{ width: isUnlimited ? "5%" : `${pct}%` }}
        />
      </div>
    </div>
  )
}
