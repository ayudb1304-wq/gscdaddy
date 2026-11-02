"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

interface NgramResult {
  phrase: string
  count: number
  density: number
}

interface AnalysisResult {
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  unigrams: NgramResult[]
  bigrams: NgramResult[]
  trigrams: NgramResult[]
  targetDensity: number | null
}

const COMMON_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him",
  "know", "take", "people", "into", "year", "your", "good", "some",
  "could", "them", "see", "other", "than", "then", "now", "look",
  "only", "come", "its", "over", "think", "also", "back", "after",
  "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "are", "was", "were", "been", "being", "has", "had", "did",
  "does", "am",
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0)
}

function getNgrams(words: string[], n: number, filterCommon: boolean): NgramResult[] {
  if (words.length < n) return []
  const counts = new Map<string, number>()
  const totalWords = words.length

  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n)
    if (filterCommon && n === 1 && COMMON_WORDS.has(ngram[0])) continue
    const phrase = ngram.join(" ")
    counts.set(phrase, (counts.get(phrase) || 0) + 1)
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({
      phrase,
      count,
      density: (count / totalWords) * 100,
    }))
}

function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g)
  return matches ? matches.length : text.trim() ? 1 : 0
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (text.trim() ? 1 : 0)
}

function densityColor(density: number): string {
  if (density <= 3) return "text-green-600 dark:text-green-400"
  if (density <= 4) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export function DensityForm() {
  const [text, setText] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)

  function analyze() {
    if (!text.trim()) return
    const words = tokenize(text)
    const wordCount = words.length
    const sentenceCount = countSentences(text)
    const paragraphCount = countParagraphs(text)

    const unigrams = getNgrams(words, 1, true)
    const bigrams = getNgrams(words, 2, false)
    const trigrams = getNgrams(words, 3, false)

    let targetDensity: number | null = null
    if (targetKeyword.trim()) {
      const kw = targetKeyword.trim().toLowerCase()
      const kwWords = kw.split(/\s+/)
      let count = 0
      for (let i = 0; i <= words.length - kwWords.length; i++) {
        if (words.slice(i, i + kwWords.length).join(" ") === kw) count++
      }
      targetDensity = wordCount > 0 ? (count / wordCount) * 100 : 0
    }

    setResult({ wordCount, sentenceCount, paragraphCount, unigrams, bigrams, trigrams, targetDensity })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="content-input" className="mb-1.5 block text-sm font-medium">
          Paste your content
        </label>
        <textarea
          id="content-input"
          rows={8}
          placeholder="Paste your blog post, article, or page content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="target-kw" className="mb-1.5 block text-sm font-medium">
          Target keyword <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="target-kw"
          type="text"
          placeholder="e.g. keyword density checker"
          value={targetKeyword}
          onChange={(e) => setTargetKeyword(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-sm"
        />
      </div>

      <Button onClick={analyze} size="lg" className="w-full sm:w-auto">
        <BarChart3 className="mr-2 size-4" />
        Analyze content
      </Button>

      {result && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="mt-1 font-heading text-2xl font-bold">{result.wordCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Sentences</p>
              <p className="mt-1 font-heading text-2xl font-bold">{result.sentenceCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Paragraphs</p>
              <p className="mt-1 font-heading text-2xl font-bold">{result.paragraphCount.toLocaleString()}</p>
            </div>
          </div>

          {/* Target keyword density */}
          {result.targetDensity !== null && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Target keyword density: <span className="font-medium text-foreground">&quot;{targetKeyword}&quot;</span>
              </p>
              <p className={`mt-1 font-heading text-2xl font-bold ${densityColor(result.targetDensity)}`}>
                {result.targetDensity.toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.targetDensity <= 3 ? "Good — within recommended range" : result.targetDensity <= 4 ? "Borderline — consider reducing usage" : "High — may appear as keyword stuffing"}
              </p>
            </div>
          )}

          {/* Ngram tables */}
          <NgramTable title="Top single words" data={result.unigrams} />
          <NgramTable title="Top 2-word phrases" data={result.bigrams} />
          <NgramTable title="Top 3-word phrases" data={result.trigrams} />
        </div>
      )}
    </div>
  )
}

function NgramTable({ title, data }: { title: string; data: NgramResult[] }) {
  if (data.length === 0) return null

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Phrase</th>
              <th className="px-4 py-2 text-right font-medium">Count</th>
              <th className="px-4 py-2 text-right font-medium">Density</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.phrase} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{row.phrase}</td>
                <td className="px-4 py-2 text-right">{row.count}</td>
                <td className={`px-4 py-2 text-right font-medium ${densityColor(row.density)}`}>
                  {row.density.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
