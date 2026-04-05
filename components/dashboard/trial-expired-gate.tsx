import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Clock, Target, Sparkles, BarChart3, ArrowRight } from "lucide-react"

export function TrialExpiredGate() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
        <Clock className="size-8 text-muted-foreground" />
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold md:text-3xl">
        Your free trial has ended
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Your 14-day trial is over, but your data is safe. Upgrade to pick up
        right where you left off.
      </p>

      <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
          <Target className="size-5 text-primary" />
          <p className="text-xs font-medium">Striking Distance</p>
          <p className="text-[11px] text-muted-foreground">Keywords waiting for you</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
          <Sparkles className="size-5 text-primary" />
          <p className="text-xs font-medium">AI Recommendations</p>
          <p className="text-[11px] text-muted-foreground">Ready to generate</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
          <BarChart3 className="size-5 text-primary" />
          <p className="text-xs font-medium">Your Data</p>
          <p className="text-[11px] text-muted-foreground">Safe and waiting</p>
        </div>
      </div>

      <div className="mt-8">
        <Button size="lg" className="h-12 px-8" asChild>
          <Link href="/settings/billing">
            View plans and upgrade
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Plans start at $19/month. Cancel anytime.
      </p>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Logo size={16} />
        <span>Questions? Reply to your welcome email or DM @ayu_theindiedev</span>
      </div>
    </div>
  )
}
