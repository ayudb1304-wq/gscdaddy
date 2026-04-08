"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

interface ReadabilityResult {
  wordCount: number
  sentenceCount: number
  syllableCount: number
  avgWordsPerSentence: number
  avgSyllablesPerWord: number
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
}

// Simple syllable counting heuristic
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "")
  if (word.length <= 2) return 1

  // Remove silent e
  word = word.replace(/e$/, "")
  // Count vowel groups
  const matches = word.match(/[aeiouy]+/g)
  const count = matches ? matches.length : 1
  return Math.max(1, count)
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function getWords(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0)
}

function getComplexWordCount(words: string[]): number {
  return words.filter((w) => countSyllables(w) >= 3).length
}

function fleschReadingEaseLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Very Easy (5th grade)", color: "text-green-600 dark:text-green-400" }
  if (score >= 80) return { label: "Easy (6th grade)", color: "text-green-600 dark:text-green-400" }
  if (score >= 70) return { label: "Fairly Easy (7th grade)", color: "text-green-600 dark:text-green-400" }
  if (score >= 60) return { label: "Standard (8th-9th grade)", color: "text-green-600 dark:text-green-400" }
  if (score >= 50) return { label: "Fairly Difficult (10th-12th grade)", color: "text-yellow-600 dark:text-yellow-400" }
  if (score >= 30) return { label: "Difficult (College)", color: "text-red-600 dark:text-red-400" }
  return { label: "Very Confusing (College graduate)", color: "text-red-600 dark:text-red-400" }
}

function getRecommendations(result: ReadabilityResult): string[] {
  const recs: string[] = []
  if (result.avgWordsPerSentence > 20) {
    recs.push("Break up long sentences. Aim for an average of 15-20 words per sentence.")
  }
  if (result.avgSyllablesPerWord > 1.6) {
    recs.push("Use simpler words. Replace multi-syllable words with shorter alternatives where possible.")
  }
  if (result.fleschReadingEase < 60) {
    recs.push("Your content may be too complex for general audiences. Simplify your language for better engagement.")
  }
  if (result.gunningFog > 12) {
    recs.push("Your Gunning Fog score suggests college-level reading is needed. Consider simplifying for a wider audience.")
  }
  if (result.fleschKincaidGrade > 8) {
    recs.push("Aim for a grade level of 6-8 for web content. Use shorter paragraphs and subheadings.")
  }
  if (recs.length === 0) {
    recs.push("Your content is well-written and easy to read. Great job!")
  }
  return recs
}

export function ReadabilityForm() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<ReadabilityResult | null>(null)

  function check() {
    if (!text.trim()) return

    const words = getWords(text)
    const sentences = getSentences(text)
    const wordCount = words.length
    const sentenceCount = Math.max(sentences.length, 1)
    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)
    const complexWordCount = getComplexWordCount(words)

    const avgWordsPerSentence = wordCount / sentenceCount
    const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1)

    // Flesch Reading Ease = 206.835 - 1.015 * ASL - 84.6 * ASW
    const fleschReadingEase = Math.max(
      0,
      Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)
    )

    // Flesch-Kincaid Grade Level = 0.39 * ASL + 11.8 * ASW - 15.59
    const fleschKincaidGrade = Math.max(
      0,
      0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
    )

    // Gunning Fog = 0.4 * (ASL + percentage of complex words)
    const complexWordPercent = (complexWordCount / Math.max(wordCount, 1)) * 100
    const gunningFog = Math.max(0, 0.4 * (avgWordsPerSentence + complexWordPercent))

    setResult({
      wordCount,
      sentenceCount,
      syllableCount,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFog,
    })
  }

  const freLabel = result ? fleschReadingEaseLabel(result.fleschReadingEase) : null

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="readability-input" className="mb-1.5 block text-sm font-medium">
          Paste your content
        </label>
        <textarea
          id="readability-input"
          rows={8}
          placeholder="Paste your blog post, article, or page content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button onClick={check} size="lg" className="w-full sm:w-auto">
        <BookOpen className="mr-2 size-4" />
        Check readability
      </Button>

      {result && (
        <div className="space-y-8">
          {/* Main score gauge */}
          <div className="rounded-xl border p-6 text-center">
            <p className="text-sm text-muted-foreground">Flesch Reading Ease</p>
            <p className={`mt-1 font-heading text-5xl font-bold ${freLabel!.color}`}>
              {Math.round(result.fleschReadingEase)}
            </p>
            <p className={`mt-1 text-sm font-medium ${freLabel!.color}`}>
              {freLabel!.label}
            </p>
            {/* Visual gauge */}
            <div className="mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, result.fleschReadingEase)}%`,
                  background: result.fleschReadingEase >= 60
                    ? "linear-gradient(90deg, #22c55e, #4ade80)"
                    : result.fleschReadingEase >= 50
                    ? "linear-gradient(90deg, #eab308, #facc15)"
                    : "linear-gradient(90deg, #ef4444, #f87171)",
                }}
              />
            </div>
            <div className="mx-auto mt-1 flex max-w-xs justify-between text-[10px] text-muted-foreground">
              <span>Hard</span>
              <span>Easy</span>
            </div>
          </div>

          {/* Score cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Flesch-Kincaid Grade</p>
              <p className="mt-1 font-heading text-2xl font-bold">
                {result.fleschKincaidGrade.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.fleschKincaidGrade <= 8
                  ? "Good for web content"
                  : result.fleschKincaidGrade <= 12
                  ? "High school level"
                  : "College level — consider simplifying"}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Gunning Fog Index</p>
              <p className="mt-1 font-heading text-2xl font-bold">
                {result.gunningFog.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.gunningFog <= 10
                  ? "Easy to understand"
                  : result.gunningFog <= 14
                  ? "Needs some education"
                  : "Very complex — simplify"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="font-heading text-lg font-bold">{result.wordCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Sentences</p>
              <p className="font-heading text-lg font-bold">{result.sentenceCount}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg words/sentence</p>
              <p className="font-heading text-lg font-bold">{result.avgWordsPerSentence.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg syllables/word</p>
              <p className="font-heading text-lg font-bold">{result.avgSyllablesPerWord.toFixed(2)}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recommendations</h3>
            <ul className="space-y-2">
              {getRecommendations(result).map((rec, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-primary">&#10003;</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
