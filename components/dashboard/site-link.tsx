"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { ComponentProps } from "react"

/**
 * Link that keeps the currently selected site (?siteId=) when moving between
 * app pages. Plain links dropped it, so "View all" on site B opened site A.
 */
export function SiteLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const siteId = useSearchParams().get("siteId")
  let target = href
  if (siteId && !href.includes("siteId=")) {
    const [path, hash] = href.split("#")
    target = `${path}${path.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteId)}${hash ? `#${hash}` : ""}`
  }
  return <Link href={target} {...props} />
}
