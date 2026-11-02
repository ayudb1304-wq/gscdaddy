"use client"

import Image from "next/image"
import Link from "next/link"
import { HeroVideo } from "./hero-video"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Lock, MousePointer2, ShieldCheck, Timer } from "lucide-react"
import { useRef } from "react"
import { ActionPlanMock, BrowserFrame } from "./app-mockups"
import { BlurInWords } from "./motion"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  // The sky drifts slower than the page; the product rises a little faster.
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -150])

  return (
    <section ref={ref} className="relative overflow-hidden rounded-tile" aria-labelledby="hero-title">
      {/* Backdrop: Higgsfield sky + hills still, then a slow loop on larger screens. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 -top-[18%] bottom-0 bg-[oklch(0.62_0.11_240)]"
        style={{ y: reduce ? 0 : skyY }}
      >
        <Image
          src="/marketing/hero-sky.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-bottom dark:brightness-[0.45] dark:saturate-[0.8]"
        />
        <HeroVideo
          src="/marketing/hero-loop.mp4"
          className="absolute inset-0 size-full object-cover object-bottom dark:brightness-[0.45] dark:saturate-[0.8]"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white/25 to-transparent dark:from-black/30"
      />

      <div className="relative mx-auto max-w-5xl px-5 pt-36 text-center md:pt-44">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-xs font-semibold tracking-[0.18em] text-[oklch(0.3_0.08_245)] uppercase dark:text-white/80"
        >
          Google Search Console tool
        </motion.p>

        <h1
          id="hero-title"
          className="mt-5 font-heading text-[2.9rem] leading-[0.98] font-semibold tracking-[-0.035em] text-[oklch(0.27_0.09_245)] sm:text-6xl md:text-[5.5rem] dark:text-white"
        >
          <BlurInWords text="You’re ranking #8." delay={0.1} wordClassName={(w) => (w === "#8." ? "text-white drop-shadow-[0_2px_12px_rgb(0_60_140/0.35)]" : undefined)} />
          <br />
          <BlurInWords text="Let’s fix that." delay={0.45} />
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[oklch(0.28_0.05_245)] md:text-xl dark:text-white/85"
        >
          GSCdaddy reads your Search Console data, finds the keywords sitting just off page one,
          and tells you exactly what to change on each page to move them up.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/login"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-[15px] font-medium text-ink-foreground shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)] transition-transform active:scale-[0.98]"
          >
            Find my keyword opportunities
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/seo-health-checker"
            className="inline-flex h-12 items-center rounded-xl bg-white/70 px-5 text-[15px] font-medium text-[oklch(0.25_0.05_245)] ring-1 ring-white/60 backdrop-blur transition-colors hover:bg-white/90 dark:bg-white/10 dark:text-white dark:ring-white/15"
          >
            Free SEO health check
          </Link>
        </motion.div>

        <motion.ul
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[oklch(0.3_0.05_245)] dark:text-white/75"
        >
          <li className="flex items-center gap-1.5">
            <Timer className="size-4" /> 14-day free trial
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" /> No credit card
          </li>
          <li className="flex items-center gap-1.5">
            <Lock className="size-4" /> Read-only Google access
          </li>
        </motion.ul>
      </div>

      {/* Product: a real capture of the app (demo site), with the next step acted out on top */}
      <div className="relative mx-auto mt-14 max-w-6xl px-4 pb-0 md:mt-20 md:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
          style={{ y: reduce ? 0 : frameY }}
        >
          <BrowserFrame url="gscdaddy.com/reports/striking-distance" className="translate-y-8 rounded-b-none">
            <div className="relative" style={{ aspectRatio: "3058 / 1568" }}>
              <Image
                src="/marketing/app-striking-distance.jpg"
                alt="GSCdaddy's striking distance report: keywords on positions 5 to 15, each with an opportunity score and estimated traffic gain"
                fill
                priority
                sizes="(max-width: 1280px) 94vw, 1120px"
                className="object-cover object-top"
              />
              {/* Highlight the top opportunity, as if the user is about to open it */}
              <motion.div
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 2.1, ease: EASE }}
                className="absolute rounded-lg bg-brand/10 ring-2 ring-brand shadow-[0_0_0_6px_rgb(120_190_20/0.15)]"
                style={{ left: "24.4%", top: "35.1%", width: "64.4%", height: "6.8%" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute hidden md:block"
                initial={reduce ? false : { left: "78%", top: "92%", opacity: 0 }}
                animate={{ left: "52%", top: "39.5%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, delay: 1.2, ease: EASE, opacity: { times: [0, 0.15, 0.85, 1], duration: 2.6, delay: 1.2 } }}
              >
                <MousePointer2 className="size-6 fill-black stroke-white drop-shadow" />
              </motion.div>
            </div>
          </BrowserFrame>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 80, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.1, delay: 2.4, ease: EASE }}
          style={{ y: reduce ? 0 : cardY }}
          className="absolute -right-1 bottom-6 hidden w-[340px] lg:block xl:-right-6"
        >
          <ActionPlanMock />
        </motion.div>
      </div>
    </section>
  )
}
