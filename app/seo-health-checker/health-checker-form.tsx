"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Shield,
  Smartphone,
  FileText,
  Zap,
  Code2,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CheckStatus = "pass" | "warning" | "fail"

interface CheckItem {
  label: string
  status: CheckStatus
  detail: string
}

interface CategoryScore {
  name: string
  slug: string
  score: number
  weight: number
  items: CheckItem[]
}

interface HealthResult {
  id: string | null
  domain: string
  url: string
  score: number
  results: {
    score: {
      overall: number
      categories: CategoryScore[]
    }
  }
  cached: boolean
  created_at: string
}

const STATUS_ICON = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
} as const

const STATUS_COLOR = {
  pass: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  fail: "text-red-600 dark:text-red-400",
} as const

const CATEGORY_ICON: Record<string, typeof Zap> = {
  performance: Zap,
  mobile: Smartphone,
  "on-page-seo": FileText,
  schema: Code2,
  security: Shield,
  indexability: Globe,
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = "text-red-500"
  if (score >= 80) color = "text-green-500"
  else if (score >= 50) color = "text-yellow-500"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-1000 ease-out", `stroke-current ${color}`)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-heading text-4xl font-bold", color)}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

function CategoryCard({
  category,
  isOpen,
  onToggle,
}: {
  category: CategoryScore
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = CATEGORY_ICON[category.slug] || Globe

  let scoreColor = "text-red-600 dark:text-red-400"
  if (category.score >= 80) scoreColor = "text-green-600 dark:text-green-400"
  else if (category.score >= 50) scoreColor = "text-yellow-600 dark:text-yellow-400"

  const passCount = category.items.filter((i) => i.status === "pass").length
  const totalCount = category.items.length

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={isOpen}
      >
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              {passCount}/{totalCount} checks passed
            </p>
          </div>
          <span className={cn("font-heading text-xl font-bold", scoreColor)}>
            {category.score}
          </span>
        </CardContent>
      </button>

      {isOpen && (
        <div className="border-t px-6 pb-4 pt-3">
          <ul className="space-y-2.5">
            {category.items.map((check, i) => {
              const StatusIcon = STATUS_ICON[check.status]
              return (
                <li key={i} className="flex gap-2.5 text-sm">
                  <StatusIcon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      STATUS_COLOR[check.status]
                    )}
                  />
                  <div>
                    <span className="font-medium">{check.label}</span>
                    <span className="text-muted-foreground"> — {check.detail}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Card>
  )
}

export function HealthCheckerForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HealthResult | null>(null)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const toggleCategory = useCallback((slug: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error?.message || "Something went wrong")
        return
      }

      setResult(data.data)

      // Open categories that have failures
      const failedCategories = new Set<string>()
      for (const cat of data.data.results.score.categories) {
        if (cat.items.some((item: CheckItem) => item.status === "fail")) {
          failedCategories.add(cat.slug)
        }
      }
      setOpenCategories(failedCategories)

      // Update URL for shareability (without full navigation)
      const domain = data.data.domain
      window.history.replaceState(null, "", `/seo-health-checker/${domain}`)
    } catch {
      setError("Failed to connect. Please check the URL and try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailReport(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !result?.id) return

    setEmailSending(true)
    setEmailError(null)

    try {
      const res = await fetch("/api/health-check/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), healthCheckId: result.id }),
      })

      const data = await res.json()
      if (!data.success) {
        setEmailError(data.error?.message || "Failed to send report")
        return
      }
      setEmailSent(true)
    } catch {
      setEmailError("Failed to send report. Please try again.")
    } finally {
      setEmailSending(false)
    }
  }

  const scoreData = result?.results?.score

  return (
    <div className="space-y-10">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your website URL (e.g. example.com)"
            className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading || !url.trim()} className="h-12 px-6">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Check SEO Health"
          )}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4 py-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <div>
            <p className="font-medium">Analyzing your website...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This typically takes 10-15 seconds. We are checking performance,
              mobile friendliness, on-page SEO, schema markup, security, and
              indexability.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {scoreData && result && (
        <div className="space-y-8">
          {/* Overall score */}
          <div className="flex flex-col items-center gap-4 text-center">
            <ScoreRing score={scoreData.overall} />
            <div>
              <h2 className="font-heading text-xl font-bold">
                SEO Health Score for{" "}
                <span className="text-primary">{result.domain}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {scoreData.overall >= 80
                  ? "Your site is in good shape. Check the details below for remaining improvements."
                  : scoreData.overall >= 50
                    ? "There is room for improvement. Focus on the failing checks below."
                    : "Your site needs significant SEO work. Start with the critical issues below."}
              </p>
              {result.cached && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Cached result from {new Date(result.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold">Detailed breakdown</h3>
            <div className="grid gap-3">
              {scoreData.categories.map((category) => (
                <CategoryCard
                  key={category.slug}
                  category={category}
                  isOpen={openCategories.has(category.slug)}
                  onToggle={() => toggleCategory(category.slug)}
                />
              ))}
            </div>
          </div>

          {/* Email report capture */}
          {result.id && (
            <section className="rounded-lg border bg-muted/30 p-6">
              {emailSent ? (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <p>
                    Report sent to <strong>{email}</strong>. Check your inbox.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-base font-semibold">
                    Get the full report in your inbox
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your email to receive a detailed breakdown with
                    actionable fixes for every issue.
                  </p>
                  <form
                    onSubmit={handleEmailReport}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={emailSending || !email.trim()}
                      size="sm"
                    >
                      {emailSending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Send Report"
                      )}
                    </Button>
                  </form>
                  {emailError && (
                    <p className="mt-2 text-xs text-red-600">{emailError}</p>
                  )}
                </>
              )}
            </section>
          )}

          {/* CTA to GSCdaddy */}
          <section className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center md:p-8">
            <h3 className="font-heading text-lg font-bold md:text-xl">
              Want to see your striking distance keywords?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              You have seen the surface-level SEO. Now see the keywords where you
              are almost ranking on page 1. Connect Google Search Console and
              GSCdaddy will find them automatically.
            </p>
            <a
              href="/login"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try GSCdaddy Free
              <ArrowRight className="size-4" />
            </a>
          </section>
        </div>
      )}
    </div>
  )
}
