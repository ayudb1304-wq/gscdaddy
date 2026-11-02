import Link from "next/link"
import { cn } from "@/lib/utils"

export type MarqueeItem = {
  label: string
  href?: string
  icon: React.ReactNode
  /** Tailwind background class for the icon square */
  swatch: string
}

/**
 * An endless horizontal row. The list is rendered twice so the loop is seamless;
 * the second copy is hidden from screen readers.
 */
export function Marquee({
  items,
  reverse = false,
  duration = 45,
  className,
}: {
  items: MarqueeItem[]
  reverse?: boolean
  duration?: number
  className?: string
}) {
  return (
    <div className={cn("group mask-fade-x overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-3 group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex gap-3" aria-hidden={copy === 1 || undefined}>
            {items.map((item) => (
              <li key={`${copy}-${item.label}`}>
                <Chip item={item} tabbable={copy === 0} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function Chip({ item, tabbable }: { item: MarqueeItem; tabbable: boolean }) {
  const inner = (
    <>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-foreground", item.swatch)}>
        {item.icon}
      </span>
      <span className="pr-3 text-[15px] font-medium whitespace-nowrap">{item.label}</span>
    </>
  )
  const cls =
    "flex items-center gap-3 rounded-2xl bg-card p-2 shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 dark:ring-white/10"
  return item.href ? (
    <Link href={item.href} className={cls} tabIndex={tabbable ? undefined : -1}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
