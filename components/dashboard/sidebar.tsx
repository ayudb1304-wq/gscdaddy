"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ChevronDown,
  CreditCard,
  Crosshair,
  Globe,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Sunrise,
  User,
  Wrench,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { TOOLS } from "@/lib/tools"
import { TOOL_ICONS } from "@/lib/tool-icons"
import { USAGE_CHANGED_EVENT } from "@/lib/usage-events"

type NavIcon = React.ComponentType<{ className?: string }>
type NavLink = { label: string; href: string; icon: NavIcon }

// Shorter labels so sidebar rows don't wrap. Public /tools cards keep the longer names.
const TOOL_SIDEBAR_LABELS: Record<string, string> = {
  "keyword-calculator": "Keyword Calculator",
  "serp-preview": "SERP Preview",
  "meta-tag-generator": "Meta Tags",
  "open-graph-generator": "Open Graph",
  "slug-generator": "Slug Generator",
  "robots-txt-generator": "Robots.txt",
  "keyword-density-checker": "Keyword Density",
  "readability-checker": "Readability",
}

const MAIN: NavLink[] = [
  { label: "Today", href: "/today", icon: Sunrise },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

const KEYWORDS: NavLink[] = [
  { label: "Striking distance", href: "/reports/striking-distance", icon: Crosshair },
  { label: "Recommendations", href: "/reports/recommendations", icon: Lightbulb },
]

const TOOL_LINKS: NavLink[] = [
  { label: "SEO Health Checker", href: "/app/tools/seo-health-checker", icon: HeartPulse },
  ...TOOLS.map((t) => ({
    label: TOOL_SIDEBAR_LABELS[t.slug] ?? t.name,
    href: `/app/tools/${t.slug}`,
    icon: TOOL_ICONS[t.icon],
  })),
]

const SETTINGS: NavLink[] = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Sites", href: "/settings/sites", icon: Globe },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
]

interface Usage {
  sitesUsed: number
  sitesLimit: number
  recsToday: number
  recsLimit: number
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = searchParams.get("siteId")
  const withSiteId = (href: string) => (siteId ? `${href}?siteId=${siteId}` : href)
  const [toolsOpen, setToolsOpen] = useState(pathname.startsWith("/app/tools"))
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"))
  const [usage, setUsage] = useState<Usage | null>(null)

  // Refetch whenever sites or recommendations change (and on returning to the
  // tab): this shell persists across pages, so a one-time fetch went stale.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetch("/api/billing/usage")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data && typeof data.sitesUsed === "number") setUsage(data)
        })
        .catch(() => {})
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") load()
    }
    load()
    window.addEventListener(USAGE_CHANGED_EVENT, load)
    window.addEventListener("gsc:sync-completed", load)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.removeEventListener(USAGE_CHANGED_EVENT, load)
      window.removeEventListener("gsc:sync-completed", load)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const item = (link: NavLink, nested = false) => (
    <li key={link.href}>
      <Link
        href={withSiteId(link.href)}
        aria-current={isActive(link.href) ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
          nested ? "h-8 text-[13px]" : "h-9",
          isActive(link.href)
            ? "bg-sidebar-accent font-medium text-sidebar-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-black/[0.05] dark:shadow-none dark:ring-white/[0.06]"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        <link.icon className={cn("shrink-0", nested ? "size-3.5" : "size-4", isActive(link.href) && "text-brand-strong")} />
        <span className="truncate">{link.label}</span>
      </Link>
    </li>
  )

  return (
    <aside className={cn("flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground", className)}>
      <Link href={withSiteId("/today")} className="flex h-16 items-center gap-2 px-5">
        <Logo size={26} />
        <span className="font-heading text-lg font-bold tracking-tight">GSCdaddy</span>
      </Link>

      <nav aria-label="App" className="flex-1 space-y-6 overflow-y-auto px-3 pt-2 pb-4">
        <ul className="space-y-0.5">{MAIN.map((l) => item(l))}</ul>

        <div>
          <p className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
            Keywords
          </p>
          <ul className="space-y-0.5">{KEYWORDS.map((l) => item(l))}</ul>
        </div>

        <Collapsible label="Free tools" icon={Wrench} open={toolsOpen} onToggle={() => setToolsOpen((v) => !v)}>
          {TOOL_LINKS.map((l) => item(l, true))}
        </Collapsible>

        <Collapsible label="Settings" icon={Settings} open={settingsOpen} onToggle={() => setSettingsOpen((v) => !v)}>
          {SETTINGS.map((l) => item(l, true))}
        </Collapsible>
      </nav>

      {usage && (usage.sitesUsed > 0 || usage.recsToday > 0) && (
        <div className="m-3 space-y-3 rounded-xl bg-sidebar-accent p-3 ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
          <UsageCounter icon={Globe} label="Sites" used={usage.sitesUsed} limit={usage.sitesLimit} />
          <UsageCounter icon={Sparkles} label="AI plans today" used={usage.recsToday} limit={usage.recsLimit} />
          {(usage.sitesUsed >= usage.sitesLimit || usage.recsToday >= usage.recsLimit) && (
            <Link
              href={withSiteId("/settings/billing")}
              className="block rounded-lg bg-ink py-1.5 text-center text-xs font-medium text-ink-foreground"
            >
              Upgrade for more
            </Link>
          )}
        </div>
      )}
    </aside>
  )
}

function Collapsible({
  label,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  label: string
  icon: NavIcon
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      >
        <Icon className="size-4" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-sidebar-border pl-2">{children}</ul>}
    </div>
  )
}

function UsageCounter({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: NavIcon
  label: string
  used: number
  limit: number
}) {
  const unlimited = limit >= 999
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-sidebar-foreground/60">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="font-medium tabular-nums">{unlimited ? used : `${used} / ${limit}`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            unlimited ? "bg-brand/40" : pct >= 90 ? "bg-critical" : pct >= 70 ? "bg-warning" : "bg-brand"
          )}
          style={{ width: unlimited ? "5%" : `${pct}%` }}
        />
      </div>
    </div>
  )
}
