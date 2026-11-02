"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: "div" | "li" | "section"
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

/** A tile that grows slightly into place as it enters the viewport. */
export function TileReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, scale: 0.97, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Headline that blurs in word by word on page load. */
export function BlurInWords({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string
  className?: string
  wordClassName?: (word: string, index: number) => string | undefined
  delay?: number
}) {
  const reduce = useReducedMotion()
  const words = text.split(" ")
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={cn("inline-block whitespace-pre", wordClassName?.(word, i))}
          // Transform only: the headline is the page's largest text, and words
          // rendered at opacity 0 / blurred until hydration delayed LCP.
          initial={reduce ? false : { y: "0.25em" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.08, ease: EASE }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * Paragraphs whose words light up as you scroll past them, like reading along.
 * Each item in `lines` is rendered as its own paragraph.
 */
export function ScrollWords({
  lines,
  className,
  lineClassName,
}: {
  lines: string[]
  className?: string
  lineClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  })

  const allWords = lines.flatMap((line, li) =>
    line.split(" ").map((word) => ({ word, li }))
  )
  const total = allWords.length
  let cursor = 0

  return (
    <div ref={ref} className={className}>
      {lines.map((line, li) => (
        <p key={li} className={lineClassName}>
          {line.split(" ").map((word, wi) => {
            const index = cursor++
            const start = index / total
            const end = start + 1 / total
            return (
              <Word
                key={`${li}-${wi}`}
                progress={scrollYProgress}
                range={[start, end]}
                reduce={!!reduce}
              >
                {word}
              </Word>
            )
          })}
        </p>
      ))}
    </div>
  )
}

function Word({
  children,
  progress,
  range,
  reduce,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  reduce: boolean
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <>
      <motion.span style={{ opacity: reduce ? 1 : opacity }}>{children}</motion.span>{" "}
    </>
  )
}

/** Moves its children vertically at a different speed from the page. */
export function Parallax({
  children,
  className,
  speed = 60,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  return (
    <motion.div ref={ref} className={className} style={{ y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  )
}

/** Children pop in one after another with a soft spring. */
export function Stagger({
  children,
  className,
  itemClassName,
  stagger = 0.07,
}: {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.ul
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children.map((child, i) => (
        <motion.li
          key={i}
          className={itemClassName}
          variants={{
            hidden: { opacity: 0, y: 18, scale: 0.92 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 22 },
            },
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}
