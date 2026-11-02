import { Skeleton } from "@/components/ui/skeleton"

export default function TodayLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading today">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  )
}
