import { cn } from "@/lib/utils"

export type TileTone =
  | "sky"
  | "peach"
  | "sand"
  | "lilac"
  | "sage"
  | "rose"
  | "cream"
  | "lime"
  | "mist"
  | "plain"

const TONES: Record<TileTone, string> = {
  sky: "bg-tile-sky",
  peach: "bg-tile-peach",
  sand: "bg-tile-sand",
  lilac: "bg-tile-lilac",
  sage: "bg-tile-sage",
  rose: "bg-tile-rose",
  cream: "bg-tile-cream",
  lime: "bg-tile-lime",
  mist: "bg-tile-mist",
  plain: "bg-card ring-1 ring-black/5 dark:ring-white/10",
}

/** A rounded pastel surface. Marketing sections are built from these. */
export function Tile({
  tone = "plain",
  className,
  children,
  id,
  as: Comp = "section",
  ...rest
}: {
  tone?: TileTone
  className?: string
  children: React.ReactNode
  id?: string
  as?: "section" | "div" | "article"
} & React.AriaAttributes) {
  return (
    <Comp
      id={id}
      className={cn("relative overflow-hidden rounded-tile", TONES[tone], className)}
      {...rest}
    >
      {children}
    </Comp>
  )
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold tracking-[0.14em] uppercase text-foreground/70", className)}>
      {children}
    </p>
  )
}

export function SectionTitle({
  children,
  className,
  as: Comp = "h2",
}: {
  children: React.ReactNode
  className?: string
  as?: "h2" | "h3"
}) {
  return (
    <Comp
      className={cn(
        "font-heading text-[2rem] leading-[1.08] font-semibold tracking-[-0.02em] md:text-5xl",
        className
      )}
    >
      {children}
    </Comp>
  )
}
