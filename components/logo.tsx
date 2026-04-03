"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 24 }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Before mount, show the dark logo (works for both SSR and initial render)
  const src = mounted && resolvedTheme === "dark"
    ? "/images/GSCDaddyLogo_LightMode.png"
    : "/images/GSCDaddyLogo.png"

  return (
    <Image
      key={src}
      src={src}
      alt="GSCdaddy"
      width={size}
      height={size}
      priority
      className={cn("shrink-0", className)}
    />
  )
}
