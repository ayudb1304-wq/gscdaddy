"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChartDataPoint {
  date: string
  clicks: number
  impressions: number
  position: number
}

type Metric = "clicks" | "impressions" | "position"

const metrics: { key: Metric; label: string; color: string }[] = [
  { key: "clicks", label: "Clicks", color: "var(--chart-1)" },
  { key: "impressions", label: "Impressions", color: "var(--chart-2)" },
  { key: "position", label: "Position", color: "var(--chart-3)" },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function PerformanceChart({ data }: { data: ChartDataPoint[] }) {
  const [activeMetric, setActiveMetric] = useState<Metric>("clicks")

  const metric = metrics.find((m) => m.key === activeMetric)!

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Performance</CardTitle>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <Button
              key={m.key}
              variant={activeMetric === m.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveMetric(m.key)}
              className={cn("text-xs", activeMetric === m.key && "font-medium")}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No performance data found for this period. Google Search Console data can take 2-3 days to appear.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs"
                tick={{ fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "var(--color-muted-foreground)" }}
                reversed={activeMetric === "position"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => formatDate(String(label))}
              />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
