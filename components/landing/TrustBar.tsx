import { Shield, Eye, Lock } from "lucide-react"
import { FadeInSection } from "./FadeInSection"

function TrustItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0 text-primary/70" />
      <span>{text}</span>
    </div>
  )
}

function TechLogo({ name }: { name: string }) {
  return (
    <span className="font-mono text-xs tracking-wider text-muted-foreground/60 uppercase">
      {name}
    </span>
  )
}

export function TrustBar() {
  return (
    <section className="border-y border-border bg-card/50">
      <FadeInSection>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-6 md:flex-row md:justify-between md:px-6">
          {/* Trust messaging */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <TrustItem icon={Eye} text="Read-only access" />
            <TrustItem icon={Shield} text="We never modify your site" />
            <TrustItem icon={Lock} text="Your data stays private" />
          </div>

          {/* Tech logos */}
          <div className="flex items-center gap-5">
            <span className="text-[10px] tracking-wider text-muted-foreground/40 uppercase">
              Powered by
            </span>
            <TechLogo name="Vercel" />
            <TechLogo name="Supabase" />
            <TechLogo name="Anthropic" />
          </div>
        </div>
      </FadeInSection>
    </section>
  )
}
