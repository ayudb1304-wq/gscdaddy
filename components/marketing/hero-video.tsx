"use client"

import { useEffect, useRef } from "react"

// The moving sky is decoration, not content. It loads after the page settles, only on larger
// screens, never with Save-Data, and never for people who ask for reduced motion.
export function HeroVideo({ src, className }: { src: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = video.current
    if (!el) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768 ||
      saveData
    ) {
      return
    }
    const onPlaying = () => (el.style.opacity = "1")
    const timer = window.setTimeout(() => {
      el.src = src
      el.addEventListener("playing", onPlaying, { once: true })
      void el.play().catch(() => undefined)
    }, 1200)
    return () => {
      window.clearTimeout(timer)
      el.removeEventListener("playing", onPlaying)
    }
  }, [src])

  return (
    <video
      ref={video}
      aria-hidden="true"
      muted
      loop
      playsInline
      preload="none"
      className={className}
      style={{ opacity: 0, transition: "opacity 1.2s ease" }}
    />
  )
}
