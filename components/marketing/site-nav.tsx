"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export const SITE_NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Free tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
] as const

/** Floating pill navigation shared by every public page. */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 rounded-2xl px-3 pl-4 transition-all duration-500",
          "bg-background/80 ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10",
          scrolled && "bg-background/90 shadow-[0_12px_40px_-18px_rgb(0_0_0/0.35)]"
        )}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="GSCdaddy home">
          <Logo size={26} />
          <span className="font-heading text-lg font-bold tracking-tight">GSCdaddy</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {SITE_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle className="size-9 rounded-lg" />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-medium text-ink-foreground transition-transform active:scale-[0.98]"
          >
            Start free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="size-9" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-lg hover:bg-foreground/5"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-[1120px] rounded-2xl bg-background/95 p-3 ring-1 ring-black/5 backdrop-blur-xl md:hidden dark:ring-white/10"
          >
            <ul className="grid gap-1">
              {SITE_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base hover:bg-foreground/5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base hover:bg-foreground/5"
                >
                  Log in
                </Link>
              </li>
            </ul>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink text-sm font-medium text-ink-foreground"
            >
              Start free <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
