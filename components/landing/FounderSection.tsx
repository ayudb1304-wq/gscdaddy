"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { FOUNDER } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function FounderSection() {
  const { resolvedTheme } = useTheme()
  const badgeTheme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="mx-auto max-w-xl text-center">
            <Image
              src="/images/founder-portrait.jpg"
              alt={FOUNDER.name}
              width={160}
              height={160}
              className="mx-auto mb-6 size-40 rounded-full border border-border object-cover"
            />

            <blockquote className="text-xl font-medium leading-relaxed md:text-2xl">
              &ldquo;{FOUNDER.quote}&rdquo;
            </blockquote>

            <div className="mt-8 space-y-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {FOUNDER.bio}
            </div>

            <div className="mt-6">
              <p className="font-medium">{FOUNDER.name}</p>
              <p className="text-sm text-muted-foreground">{FOUNDER.title}</p>
              <a
                href="https://x.com/ayu_theindiedev?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="X (Twitter)"
              >
                <XIcon className="size-3.5" />
                <span>@ayu_theindiedev</span>
              </a>
            </div>

            <div className="mt-6 flex justify-center">
              <a
                href="https://trustmrr.com/startup/gscdaddy"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block"
              >
                <img
                  src={`https://trustmrr.com/api/embed/gscdaddy?format=svg&theme=${badgeTheme === "dark" ? "light" : "dark"}`}
                  alt="TrustMRR verified revenue badge"
                  width={220}
                  height={90}
                />
                <img
                  src={badgeTheme === "dark"
                    ? "/images/GSCDaddyLogo.png"
                    : "/images/GSCDaddyLogo_LightMode.png"}
                  alt="GSCdaddy logo"
                  width={48}
                  height={48}
                  className="absolute left-[15px] top-[21px] size-[48px] rounded-[8px] object-cover"
                />
              </a>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
