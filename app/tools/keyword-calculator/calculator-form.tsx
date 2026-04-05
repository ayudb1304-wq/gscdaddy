"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, TrendingUp } from "lucide-react"

// Industry-average CTR benchmarks by Google position
const CTR_BENCHMARKS: Record<number, number> = {
  1: 0.28,
  2: 0.15,
  3: 0.11,
  4: 0.08,
  5: 0.065,
  6: 0.047,
  7: 0.035,
  8: 0.025,
  9: 0.019,
  10: 0.015,
  11: 0.012,
  12: 0.01,
  13: 0.008,
  14: 0.007,
  15: 0.006,
  16: 0.005,
  17: 0.004,
  18: 0.004,
  19: 0.003,
  20: 0.003,
}

function getExpectedCtr(position: number): number {
  const floored = Math.min(Math.max(Math.round(position), 1), 20)
  return CTR_BENCHMARKS[floored] || 0.003
}

interface Result {
  currentClicks: number
  projections: { position: number; ctr: number; clicks: number; gain: number }[]
}

export function CalculatorForm() {
  const [position, setPosition] = useState("")
  const [impressions, setImpressions] = useState("")
  const [ctr, setCtr] = useState("")
  const [result, setResult] = useState<Result | null>(null)

  function calculate() {
    const pos = parseFloat(position)
    const imp = parseInt(impressions, 10)
    const currentCtr = parseFloat(ctr) / 100

    if (!pos || !imp || isNaN(currentCtr)) return

    const currentClicks = Math.round(imp * currentCtr)

    const targets = [1, 3, 5].filter((t) => t < Math.round(pos))
    const projections = targets.map((targetPos) => {
      const expectedCtr = getExpectedCtr(targetPos)
      const projectedClicks = Math.round(imp * expectedCtr)
      return {
        position: targetPos,
        ctr: expectedCtr * 100,
        clicks: projectedClicks,
        gain: projectedClicks - currentClicks,
      }
    })

    setResult({ currentClicks, projections })
  }

  return (
    <div className="space-y-8">
      {/* Input fields */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="position"
            className="mb-1.5 block text-sm font-medium"
          >
            Current position
          </label>
          <input
            id="position"
            type="number"
            min="1"
            max="100"
            step="0.1"
            placeholder="e.g. 8.5"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label
            htmlFor="impressions"
            className="mb-1.5 block text-sm font-medium"
          >
            Monthly impressions
          </label>
          <input
            id="impressions"
            type="number"
            min="0"
            placeholder="e.g. 2400"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="ctr" className="mb-1.5 block text-sm font-medium">
            Current CTR (%)
          </label>
          <input
            id="ctr"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 1.2"
            value={ctr}
            onChange={(e) => setCtr(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <Button onClick={calculate} size="lg" className="w-full sm:w-auto">
        <TrendingUp className="mr-2 size-4" />
        Calculate opportunity
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Current estimated clicks
            </p>
            <p className="mt-1 font-heading text-2xl font-bold">
              {result.currentClicks.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                clicks/month
              </span>
            </p>
          </div>

          {result.projections.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {result.projections.map((proj) => (
                <Card key={proj.position}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Position {proj.position}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ~{proj.ctr.toFixed(1)}% CTR
                      </span>
                    </div>
                    <p className="mt-2 font-heading text-2xl font-bold">
                      {proj.clicks.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      clicks/month
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <ArrowUp className="size-3.5" />
                      +{proj.gain.toLocaleString()} clicks
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are already at or near position 1. Not much room to improve.
            </p>
          )}

          {result.projections.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Based on industry-average CTR benchmarks. Actual results vary by
              niche, intent, and snippet quality.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
