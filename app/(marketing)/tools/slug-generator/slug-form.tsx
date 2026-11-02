"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "be", "was", "are",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "this",
  "that", "these", "those", "i", "you", "he", "she", "we", "they",
])

function generateSlug(
  text: string,
  separator: string,
  lowercase: boolean,
  removeStopWords: boolean,
  maxLength: number
): string {
  let slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()

  if (lowercase) slug = slug.toLowerCase()

  let words = slug.split(/\s+/).filter(Boolean)
  if (removeStopWords) {
    words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()))
  }

  slug = words.join(separator)

  // collapse repeated separators
  const sepEscaped = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  slug = slug.replace(new RegExp(`${sepEscaped}{2,}`, "g"), separator)

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${sepEscaped}$`), "")
  }

  return slug
}

export function SlugForm() {
  const [input, setInput] = useState("")
  const [separator, setSeparator] = useState("-")
  const [lowercase, setLowercase] = useState(true)
  const [removeStopWords, setRemoveStopWords] = useState(false)
  const [maxLength, setMaxLength] = useState("")
  const [bulk, setBulk] = useState(false)
  const [copied, setCopied] = useState(false)

  const lines = bulk ? input.split("\n").filter((l) => l.trim()) : [input]
  const slugs = lines.map((line) =>
    generateSlug(line, separator, lowercase, removeStopWords, parseInt(maxLength) || 0)
  )
  const output = slugs.filter(Boolean).join("\n")

  function handleCopy() {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setBulk(false)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !bulk ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Single
        </button>
        <button
          onClick={() => setBulk(true)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            bulk ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Bulk
        </button>
      </div>

      <div>
        <label htmlFor="slug-input" className="mb-1.5 block text-sm font-medium">
          {bulk ? "Titles (one per line)" : "Page title or text"}
        </label>
        {bulk ? (
          <textarea
            id="slug-input"
            rows={5}
            placeholder={"How to Improve Your SEO Rankings\nThe Complete Guide to Meta Tags\n10 Tips for Better URLs"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <input
            id="slug-input"
            type="text"
            placeholder="e.g. How to Improve Your SEO Rankings in 2026"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="separator" className="mb-1.5 block text-sm font-medium">
            Separator
          </label>
          <select
            id="separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
          </select>
        </div>

        <div>
          <label htmlFor="max-length" className="mb-1.5 block text-sm font-medium">
            Max length
          </label>
          <input
            id="max-length"
            type="number"
            min="0"
            placeholder="No limit"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <span className="text-sm">Lowercase</span>
        </label>

        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={removeStopWords}
            onChange={(e) => setRemoveStopWords(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <span className="text-sm">Remove stop words</span>
        </label>
      </div>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Generated slug{bulk && slugs.length > 1 ? "s" : ""}</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-1.5 size-3.5" /> : <Copy className="mr-1.5 size-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
