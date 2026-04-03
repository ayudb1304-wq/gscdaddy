import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { BUILD_IN_PUBLIC_TWEETS } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function TweetCard({
  text,
  date,
  likes,
  replies,
  url,
}: {
  text: string
  date: string
  likes: number
  replies: number
  url: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/founder-portrait.jpg"
            alt="Ayush"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold">Ayush</p>
            <p className="text-xs text-muted-foreground">@ayu_theindiedev</p>
          </div>
        </div>
        <XIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      {/* Tweet body */}
      <div className="mt-4 text-sm leading-relaxed whitespace-pre-line">
        {text}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ReplyIcon className="size-3.5" />
            {replies}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HeartIcon className="size-3.5" />
            {likes}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{date}</span>
          <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </a>
  )
}

export function BuildInPublic() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Building in public</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight md:text-4xl">
              Follow the journey
            </h2>
            <p className="mt-4 text-muted-foreground">
              Real progress, real numbers, no filters. I share everything
              about building GSCdaddy on X.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BUILD_IN_PUBLIC_TWEETS.map((tweet, i) => (
              <TweetCard key={i} {...tweet} />
            ))}
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="mt-8 text-center">
            <a
              href="https://x.com/ayu_theindiedev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-4" />
              Follow @ayu_theindiedev for daily updates
            </a>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
