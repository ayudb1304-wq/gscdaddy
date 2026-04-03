"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Sites", href: "/settings/sites" },
  { label: "Billing", href: "/settings/billing" },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      <nav className="mt-4 flex gap-1 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors -mb-px",
              pathname.startsWith(tab.href)
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  )
}
