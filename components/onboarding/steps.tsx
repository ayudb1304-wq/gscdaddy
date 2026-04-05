"use client"

import React from "react"
import { Check, Pen, Users, Building2, Shield, Lock, RefreshCw, Globe, Loader2, Target, Sparkles, Mail, BarChart3, FileDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Progress Bar ────────────────────────────────────────────────

const STEP_LABELS = ["Account created", "Tell us about you", "Connect GSC", "You're all set"]

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const isLastStep = currentStep >= STEP_LABELS.length
  const totalConnectors = STEP_LABELS.length - 1

  return (
    <div className="mx-auto mb-10 w-full max-w-lg px-4">
      {/* Circles row */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const isComplete = currentStep > stepNum
          const isCurrent = currentStep === stepNum
          const isFilled = isComplete || (isLastStep && stepNum === STEP_LABELS.length)
          const isConnectorFilled = currentStep > stepNum + 1 || (isLastStep && i < totalConnectors)

          return (
            <React.Fragment key={i}>
              {/* Circle + label column */}
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                    isFilled
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isFilled ? <Check className="size-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isFilled || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < totalConnectors && (
                <div className="mb-5 h-0.5 flex-1 bg-border">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      isConnectorFilled ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Persona Selection ───────────────────────────────────

const PERSONAS = [
  {
    id: "blogger" as const,
    title: "Indie Blogger",
    description: "I want to grow my blog's organic traffic",
    icon: Pen,
  },
  {
    id: "consultant" as const,
    title: "SEO Consultant",
    description: "I manage SEO for clients",
    icon: Users,
  },
  {
    id: "agency" as const,
    title: "Small Agency",
    description: "I manage multiple client sites",
    icon: Building2,
  },
]

export function PersonaStep({
  onSelect,
  loading,
}: {
  onSelect: (persona: "blogger" | "consultant" | "agency") => void
  loading: boolean
}) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">What best describes you?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We'll tailor your experience based on your role.
      </p>

      <div className="mt-8 grid gap-4">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelect(persona.id)}
            disabled={loading}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:ring-1 hover:ring-primary/20 disabled:opacity-50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <persona.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{persona.title}</p>
              <p className="text-sm text-muted-foreground">{persona.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3a: Pre-Permission Priming ─────────────────────────────

const TRIAL_FEATURES = [
  { icon: Target, label: "Striking Distance Keywords" },
  { icon: Sparkles, label: "AI Recommendations" },
  { icon: BarChart3, label: "Performance Dashboard" },
  { icon: Mail, label: "Weekly Email Summary" },
  { icon: FileDown, label: "CSV Exports" },
  { icon: TrendingUp, label: "Opportunity Scoring" },
]

export function PrimingStep({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">
        Your 14-day trial includes everything
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect your Google Search Console to get started. You immediately get:
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TRIAL_FEATURES.map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm"
          >
            <feature.icon className="size-4 shrink-0 text-primary" />
            <span className="leading-tight">{feature.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 shrink-0 text-primary" />
          <span><strong className="text-foreground">Read-only access</strong> — we never modify your data or settings</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 shrink-0 text-primary" />
          <span>Your data is encrypted and never sold</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="size-3.5 shrink-0 text-primary" />
          <span>Disconnect anytime from Settings</span>
        </div>
      </div>

      <Button
        onClick={onConnect}
        disabled={loading}
        size="lg"
        className="mt-6 h-12 w-full text-sm font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading your sites...
          </>
        ) : (
          "Connect Google Search Console"
        )}
      </Button>

      <p className="mt-3 text-xs text-muted-foreground">
        Free for 14 days. No credit card required.
      </p>
    </div>
  )
}

// ─── Step 3b: Site Picker ────────────────────────────────────────

interface AvailableSite {
  siteUrl: string
  permissionLevel: string
  isAdded: boolean
}

export function SitePickerStep({
  sites,
  onSelect,
  loading,
}: {
  sites: AvailableSite[]
  onSelect: (siteUrl: string, permissionLevel: string) => void
  loading: boolean
}) {
  if (sites.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold">No sites found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find any Google Search Console properties linked to your account.
          Make sure you've verified at least one site in Google Search Console.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
            Open Google Search Console
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Choose your site</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start with your main site - you can add more later.
      </p>

      <div className="mt-8 grid gap-3">
        {sites.map((site) => {
          const displayUrl = site.siteUrl
            .replace(/^(sc-domain:|https?:\/\/)/, "")
            .replace(/\/$/, "")
          const isDomain = site.siteUrl.startsWith("sc-domain:")

          return (
            <button
              key={site.siteUrl}
              onClick={() => onSelect(site.siteUrl, site.permissionLevel)}
              disabled={loading || site.isAdded}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-card p-4 text-left transition-all",
                site.isAdded
                  ? "border-border opacity-50"
                  : "border-border hover:border-primary/40 hover:ring-1 hover:ring-primary/20"
              )}
            >
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{displayUrl}</p>
                  <p className="text-xs text-muted-foreground">
                    {isDomain ? "Domain property" : "URL prefix"} · {site.permissionLevel}
                  </p>
                </div>
              </div>
              {site.isAdded && (
                <span className="text-xs text-muted-foreground">Already added</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 4: Celebration ─────────────────────────────────────────

const SYNC_STAGES = [
  "Connecting to Google...",
  "Finding your data...",
  "Pulling keyword data...",
  "Building your dashboard...",
]

export function CelebrationStep({
  syncStatus,
  syncStage,
  onGoToDashboard,
}: {
  syncStatus: "syncing" | "completed" | "timeout"
  syncStage: number
  onGoToDashboard: () => void
}) {
  if (syncStatus === "syncing") {
    return (
      <div className="mx-auto max-w-md text-center">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Setting up your dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">This usually takes 2-5 minutes.</p>

        <div className="mt-8 space-y-3">
          {SYNC_STAGES.map((stage, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {i < syncStage ? (
                <Check className="size-4 text-primary" />
              ) : i === syncStage ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <div className="size-4 rounded-full border border-border" />
              )}
              <span className={i <= syncStage ? "text-foreground" : "text-muted-foreground"}>
                {stage}
              </span>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-8" onClick={onGoToDashboard}>
          Go to dashboard anyway
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-4 text-5xl">🎉</div>
      <h1 className="font-heading text-2xl font-bold md:text-3xl">You're all set!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {syncStatus === "completed"
          ? "Your dashboard is ready with your keyword data."
          : "Your data is still syncing. We'll have it ready for you shortly."}
      </p>

      <Button size="lg" className="mt-8 h-12 px-8 text-sm font-semibold" onClick={onGoToDashboard}>
        Go to Dashboard
      </Button>
    </div>
  )
}
