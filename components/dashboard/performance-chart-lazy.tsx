"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Recharts is the heaviest client library on the dashboard; load it after the
 * rest of the page instead of in the main bundle.
 */
export const PerformanceChart = dynamic(
  () => import("./performance-chart").then((m) => m.PerformanceChart),
  { ssr: false, loading: () => <Skeleton className="h-[360px] w-full rounded-xl" /> }
)
