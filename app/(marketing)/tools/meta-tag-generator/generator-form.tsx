"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export function GeneratorForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [keywords, setKeywords] = useState("")
  const [author, setAuthor] = useState("")
  const [viewport, setViewport] = useState(true)
  const [charset, setCharset] = useState("utf-8")
  const [robotsIndex, setRobotsIndex] = useState(true)
  const [robotsFollow, setRobotsFollow] = useState(true)
  const [canonical, setCanonical] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  function generate() {
    const lines: string[] = []

    lines.push(`<meta charset="${charset}">`)

    if (viewport) {
      lines.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`)
    }

    if (title.trim()) {
      lines.push(`<title>${title.trim()}</title>`)
    }

    if (description.trim()) {
      lines.push(`<meta name="description" content="${description.trim()}">`)
    }

    if (keywords.trim()) {
      lines.push(`<meta name="keywords" content="${keywords.trim()}">`)
    }

    if (author.trim()) {
      lines.push(`<meta name="author" content="${author.trim()}">`)
    }

    const indexDirective = robotsIndex ? "index" : "noindex"
    const followDirective = robotsFollow ? "follow" : "nofollow"
    lines.push(`<meta name="robots" content="${indexDirective}, ${followDirective}">`)

    if (canonical.trim()) {
      lines.push(`<link rel="canonical" href="${canonical.trim()}">`)
    }

    setOutput(lines.join("\n"))
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function titleColor() {
    if (title.length === 0) return "text-muted-foreground"
    if (title.length <= 50) return "text-green-600 dark:text-green-400"
    if (title.length <= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  function descriptionColor() {
    if (description.length === 0) return "text-muted-foreground"
    if (description.length <= 140) return "text-green-600 dark:text-green-400"
    if (description.length <= 160) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5">
        {/* Title */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="title" className="block text-sm font-medium">
              Page title
            </label>
            <span className={`text-xs ${titleColor()}`}>
              {title.length}/60
            </span>
          </div>
          <input
            id="title"
            type="text"
            maxLength={100}
            placeholder="e.g. My Awesome Page | Brand Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="description" className="block text-sm font-medium">
              Meta description
            </label>
            <span className={`text-xs ${descriptionColor()}`}>
              {description.length}/160
            </span>
          </div>
          <textarea
            id="description"
            maxLength={300}
            placeholder="A brief summary of your page content for search engines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Keywords */}
        <div>
          <label htmlFor="keywords" className="mb-1.5 block text-sm font-medium">
            Keywords (comma-separated)
          </label>
          <input
            id="keywords"
            type="text"
            placeholder="e.g. seo, meta tags, search engine optimization"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="mb-1.5 block text-sm font-medium">
            Author
          </label>
          <input
            id="author"
            type="text"
            placeholder="e.g. John Doe"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Viewport & Charset row */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input
              id="viewport"
              type="checkbox"
              checked={viewport}
              onChange={(e) => setViewport(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <label htmlFor="viewport" className="text-sm font-medium">
              Include viewport meta tag
            </label>
          </div>

          <div>
            <label htmlFor="charset" className="mb-1.5 block text-sm font-medium">
              Charset
            </label>
            <select
              id="charset"
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="utf-8">UTF-8</option>
              <option value="iso-8859-1">ISO-8859-1</option>
            </select>
          </div>
        </div>

        {/* Robots directives */}
        <div>
          <p className="mb-1.5 text-sm font-medium">Robots directives</p>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <input
                id="robots-index"
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <label htmlFor="robots-index" className="text-sm">
                {robotsIndex ? "index" : "noindex"}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="robots-follow"
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) => setRobotsFollow(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <label htmlFor="robots-follow" className="text-sm">
                {robotsFollow ? "follow" : "nofollow"}
              </label>
            </div>
          </div>
        </div>

        {/* Canonical URL */}
        <div>
          <label htmlFor="canonical" className="mb-1.5 block text-sm font-medium">
            Canonical URL
          </label>
          <input
            id="canonical"
            type="url"
            placeholder="e.g. https://example.com/my-page"
            value={canonical}
            onChange={(e) => setCanonical(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <Button onClick={generate} size="lg" className="w-full sm:w-auto">
        Generate Meta Tags
      </Button>

      {/* Output */}
      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Generated meta tags</p>
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
          <pre className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto whitespace-pre">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
