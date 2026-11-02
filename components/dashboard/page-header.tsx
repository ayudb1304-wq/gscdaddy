import { cn } from "@/lib/utils"

/** Title block at the top of every app page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{eyebrow}</p>
        )}
        <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-[2.25rem]">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
