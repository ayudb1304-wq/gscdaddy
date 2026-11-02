"use client"

import { animate, motion, useInView, useReducedMotion } from "framer-motion"
import { Check, Clock, Lightbulb, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/*
 * Mock-ups of the app, drawn in HTML with the same tokens the app uses.
 * The data is an invented example site ("trailnotes.blog"), not a customer.
 */

const EASE = [0.22, 1, 0.36, 1] as const

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl bg-card shadow-[0_40px_90px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/10 dark:ring-white/10",
        className
      )}
    >
      <div className="flex h-9 items-center gap-1.5 border-b bg-muted/60 px-3">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="mx-auto truncate rounded-md bg-background px-3 py-0.5 text-[11px] text-muted-foreground ring-1 ring-black/5 dark:ring-white/10">
          {url}
        </span>
      </div>
      {children}
    </figure>
  )
}

function useCountUp(to: number, from: number, inView: boolean, decimals = 1) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : from)
  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(from, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [inView, from, to, reduce])
  return value.toFixed(decimals)
}

const STEPS = [
  {
    title: "Put the phrase in your title and H1",
    body: "Your title says “tents for thru-hikers”. Searchers type “ultralight tent”.",
  },
  {
    title: "Link to it from your 3 strongest gear pages",
    body: "/gear/sleeping-bags and two others get traffic but don't link here yet.",
  },
  {
    title: "Add a 2026 comparison table",
    body: "The pages above you compare weight, price and packed size side by side.",
  },
]

/** An AI action plan for one keyword, with steps ticking off one by one. */
export function ActionPlanMock({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const [done, setDone] = useState(reduce ? 1 : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const t = setTimeout(() => setDone(1), 1600)
    return () => clearTimeout(t)
  }, [inView, reduce])

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-card p-5 text-card-foreground shadow-[0_30px_70px_-30px_rgb(0_0_0/0.4)] ring-1 ring-black/5 dark:ring-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <Sparkles className="size-3.5 text-brand-strong" /> Action plan
          </p>
          <p className="mt-1 truncate font-heading text-lg font-semibold">best ultralight tent 2026</p>
        </div>
        <span className="shrink-0 rounded-lg bg-muted px-2 py-1 font-mono text-xs">#8.4</span>
      </div>
      <ol className="mt-4 space-y-2.5">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: EASE }}
            className={cn(
              "flex gap-3 rounded-xl p-3 transition-colors duration-500",
              i < done ? "bg-ok-soft" : "bg-muted/60"
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors duration-500",
                i < done ? "bg-ok text-white" : "bg-background ring-1 ring-border"
              )}
            >
              {i < done ? <Check className="size-3" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-medium", i < done && "line-through decoration-ok/60")}>
                {s.title}
              </span>
              <span className="block text-xs text-muted-foreground">{s.body}</span>
            </span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> About 35 minutes
        </span>
        <span className="font-medium text-brand-strong">Goal: page 2 → page 1</span>
      </div>
    </div>
  )
}

/** Fixes you shipped, and what happened to their positions afterwards. */
export function ShippedMock({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const before = useCountUp(11.2, 11.2, inView)
  const after = useCountUp(6.9, 11.2, inView)
  // A gentle downward (= improving) position line, drawn in on view.
  const path = "M4 18 C 40 20, 60 30, 90 34 S 150 52, 180 60 S 230 70, 276 74"

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-card p-5 text-card-foreground shadow-[0_30px_70px_-30px_rgb(0_0_0/0.4)] ring-1 ring-black/5 dark:ring-white/10",
        className
      )}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <Lightbulb className="size-3.5 text-brand-strong" /> Shipped fixes · 30 days
      </p>
      <div className="mt-2 flex items-end gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Avg. position before</p>
          <p className="font-mono text-2xl tabular-nums">{before}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">After</p>
          <p className="font-mono text-2xl text-ok tabular-nums">{after}</p>
        </div>
        <span className="mb-1 ml-auto rounded-full bg-ok-soft px-2.5 py-1 text-xs font-medium text-ok">
          4 fixes
        </span>
      </div>
      <svg viewBox="0 0 280 84" className="mt-3 h-20 w-full" aria-hidden="true">
        <line x1="0" y1="42" x2="280" y2="42" className="stroke-border" strokeDasharray="3 4" />
        <text x="276" y="38" textAnchor="end" className="fill-muted-foreground text-[9px]">
          page one starts at 10
        </text>
        <motion.path
          d={path}
          fill="none"
          className="stroke-ok"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.6, ease: EASE }}
          style={{ transform: "scaleY(-1)", transformOrigin: "center" }}
        />
      </svg>
    </div>
  )
}
