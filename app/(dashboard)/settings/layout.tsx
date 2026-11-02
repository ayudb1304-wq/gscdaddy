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
    <div className="max-w-4xl">
      <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">Settings</h1>
      <nav className="mt-6 inline-flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              pathname.startsWith(tab.href)
                ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  )
}
