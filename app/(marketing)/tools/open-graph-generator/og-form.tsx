"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const OG_TYPES = ["website", "article", "product", "profile"] as const
const TWITTER_CARD_TYPES = ["summary", "summary_large_image"] as const

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url || "example.com"
  }
}

export function OgForm() {
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogType, setOgType] = useState<string>("website")
  const [ogUrl, setOgUrl] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [siteName, setSiteName] = useState("")
  const [twitterCard, setTwitterCard] = useState<string>("summary_large_image")
  const [twitterHandle, setTwitterHandle] = useState("")

  const [generatedTags, setGeneratedTags] = useState("")
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  function generateTags() {
    const lines: string[] = []

    if (ogTitle) lines.push(`<meta property="og:title" content="${ogTitle}" />`)
    if (ogDescription) lines.push(`<meta property="og:description" content="${ogDescription}" />`)
    lines.push(`<meta property="og:type" content="${ogType}" />`)
    if (ogUrl) lines.push(`<meta property="og:url" content="${ogUrl}" />`)
    if (ogImage) lines.push(`<meta property="og:image" content="${ogImage}" />`)
    if (siteName) lines.push(`<meta property="og:site_name" content="${siteName}" />`)

    lines.push("")
    lines.push(`<meta name="twitter:card" content="${twitterCard}" />`)
    if (ogTitle) lines.push(`<meta name="twitter:title" content="${ogTitle}" />`)
    if (ogDescription) lines.push(`<meta name="twitter:description" content="${ogDescription}" />`)
    if (ogImage) lines.push(`<meta name="twitter:image" content="${ogImage}" />`)
    if (twitterHandle) {
      const handle = twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`
      lines.push(`<meta name="twitter:site" content="${handle}" />`)
      lines.push(`<meta name="twitter:creator" content="${handle}" />`)
    }

    setGeneratedTags(lines.join("\n"))
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(generatedTags)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
  const selectClass = inputClass

  return (
    <div className="space-y-10">
      {/* Form fields */}
      <div className="space-y-5">
        <div>
          <label htmlFor="og-title" className="mb-1.5 block text-sm font-medium">
            OG Title
          </label>
          <input
            id="og-title"
            type="text"
            placeholder="Your page title"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="og-description" className="mb-1.5 block text-sm font-medium">
            OG Description
          </label>
          <textarea
            id="og-description"
            placeholder="A brief description of your page content"
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="og-type" className="mb-1.5 block text-sm font-medium">
              OG Type
            </label>
            <select
              id="og-type"
              value={ogType}
              onChange={(e) => setOgType(e.target.value)}
              className={selectClass}
            >
              {OG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="twitter-card" className="mb-1.5 block text-sm font-medium">
              Twitter Card Type
            </label>
            <select
              id="twitter-card"
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value)}
              className={selectClass}
            >
              {TWITTER_CARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="og-url" className="mb-1.5 block text-sm font-medium">
            OG URL
          </label>
          <input
            id="og-url"
            type="url"
            placeholder="https://example.com/page"
            value={ogUrl}
            onChange={(e) => setOgUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="og-image" className="mb-1.5 block text-sm font-medium">
            OG Image URL
          </label>
          <input
            id="og-image"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={ogImage}
            onChange={(e) => {
              setOgImage(e.target.value)
              setImageError(false)
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Recommended size: 1200 x 630 px
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="site-name" className="mb-1.5 block text-sm font-medium">
              Site Name
            </label>
            <input
              id="site-name"
              type="text"
              placeholder="My Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="twitter-handle" className="mb-1.5 block text-sm font-medium">
              Twitter Handle
            </label>
            <input
              id="twitter-handle"
              type="text"
              placeholder="@username"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Social card preview */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Social Card Preview</h2>
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          <div className="relative aspect-[1.91/1] w-full bg-muted">
            {ogImage && !imageError ? (
              <img
                src={ogImage}
                alt="OG preview"
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {ogImage && imageError ? "Image failed to load" : "No image provided"}
              </div>
            )}
          </div>
          <div className="space-y-1 p-3">
            <p className="text-xs text-muted-foreground">
              {extractDomain(ogUrl)}
            </p>
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {ogTitle || "Page Title"}
            </p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {ogDescription || "Page description will appear here."}
            </p>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <Button onClick={generateTags} size="lg" className="w-full sm:w-auto">
        Generate Tags
      </Button>

      {/* Output */}
      {generatedTags && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Generated Meta Tags</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
            <code>{generatedTags}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
