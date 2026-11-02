"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import {
  ProgressBar,
  PersonaStep,
  PrimingStep,
  SitePickerStep,
  CelebrationStep,
} from "@/components/onboarding/steps"

interface AvailableSite {
  siteUrl: string
  permissionLevel: string
  isAdded: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(2) // Start at 2 (step 1 is pre-checked)
  const [loading, setLoading] = useState(false)
  const [availableSites, setAvailableSites] = useState<AvailableSite[]>([])
  const [showSitePicker, setShowSitePicker] = useState(false)
  const [selectingUrl, setSelectingUrl] = useState<string | null>(null)
  const [siteError, setSiteError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"syncing" | "completed" | "timeout">("syncing")
  const [syncStage, setSyncStage] = useState(0)

  // ─── Step 2: Persona ────────────────────────────────
  async function handlePersonaSelect(persona: "blogger" | "consultant" | "agency") {
    setLoading(true)
    try {
      await fetch("/api/users/persona", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      })
      setStep(3)
    } catch (e) {
      console.error("Failed to save persona:", e)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 3: Connect GSC ────────────────────────────
  async function handleConnect() {
    setLoading(true)
    try {
      const res = await fetch("/api/sites/available")
      const json = await res.json()
      if (json.success) {
        setAvailableSites(json.data)
        setShowSitePicker(true)
      }
    } catch (e) {
      console.error("Failed to fetch sites:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSiteSelect(siteUrl: string, permissionLevel: string) {
    if (loading) return
    setLoading(true)
    setSelectingUrl(siteUrl)
    setSiteError(null)
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, permissionLevel }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        // Trigger sync
        await fetch(`/api/sites/${json.data.id}/sync`, { method: "POST" })
        setStep(4)
        startSyncProgress()
      } else {
        // Used to fail silently: the button just re-enabled.
        setSiteError(json?.error?.message || "Couldn't add that site. Try again.")
      }
    } catch (e) {
      console.error("Failed to add site:", e)
      setSiteError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setLoading(false)
      setSelectingUrl(null)
    }
  }

  // ─── Step 4: Sync progress simulation ───────────────
  const startSyncProgress = useCallback(() => {
    setSyncStatus("syncing")
    setSyncStage(0)

    // Advance stages over time
    const stages = [
      setTimeout(() => setSyncStage(1), 2000),
      setTimeout(() => setSyncStage(2), 5000),
      setTimeout(() => setSyncStage(3), 9000),
      setTimeout(() => {
        setSyncStage(4)
        setSyncStatus("completed")
      }, 13000),
    ]

    // Timeout fallback after 30s
    const timeout = setTimeout(() => {
      setSyncStatus((prev) => (prev === "syncing" ? "timeout" : prev))
    }, 30000)

    return () => {
      stages.forEach(clearTimeout)
      clearTimeout(timeout)
    }
  }, [])

  // Check real sync status periodically
  useEffect(() => {
    if (step !== 4 || syncStatus !== "syncing") return

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/sites")
        const json = await res.json()
        if (json.success && json.data.length > 0) {
          const site = json.data[0]
          if (site.sync_status === "completed") {
            setSyncStage(4)
            setSyncStatus("completed")
          }
        }
      } catch {
        // ignore
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [step, syncStatus])

  function handleSkip() {
    router.push("/today")
  }

  function handleGoToDashboard() {
    router.push("/today")
  }

  return (
    <div className="grid min-h-screen gap-3 bg-background p-3 text-foreground lg:grid-cols-[0.9fr_1.1fr]">
      {/* Left: the same sky as the homepage and login, with what happens next */}
      <aside className="relative hidden overflow-hidden rounded-tile lg:block">
        <Image
          src="/marketing/hero-sky.jpg"
          alt=""
          fill
          priority
          sizes="45vw"
          className="object-cover object-bottom dark:brightness-[0.45] dark:saturate-[0.8]"
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex w-fit items-center gap-2 rounded-xl bg-white/80 px-3 py-2 backdrop-blur">
            <Image src="/images/GSCDaddyLogo.png" alt="" width={24} height={24} priority />
            <span className="font-heading text-base font-bold text-[oklch(0.2_0.008_230)]">GSCdaddy</span>
          </div>
          <div className="max-w-sm pb-[22%]">
            <h2 className="font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-[oklch(0.27_0.09_245)] dark:text-white">
              Two minutes to your first keyword opportunities.
            </h2>
            <p className="mt-4 text-[15px] text-[oklch(0.28_0.05_245)] dark:text-white/85">
              Tell us who you are, pick a site from Search Console, and we&apos;ll pull your data while you
              grab a coffee.
            </p>
          </div>
        </div>
      </aside>

      {/* Right: the wizard */}
      <main className="flex flex-col">
        <div className="flex items-center justify-center gap-2 py-6 lg:hidden">
          <Logo size={26} />
          <span className="font-heading text-xl font-bold">GSCdaddy</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 lg:py-16">
          <ProgressBar currentStep={step} />

          {step === 2 && <PersonaStep onSelect={handlePersonaSelect} loading={loading} />}

          {step === 3 && !showSitePicker && (
            <PrimingStep onConnect={handleConnect} onSkip={handleSkip} loading={loading} />
          )}

          {step === 3 && showSitePicker && (
            <SitePickerStep
              sites={availableSites}
              onSelect={handleSiteSelect}
              onSkip={handleSkip}
              loading={loading}
              selectingUrl={selectingUrl}
              error={siteError}
            />
          )}

          {step === 4 && (
            <CelebrationStep
              syncStatus={syncStatus}
              syncStage={syncStage}
              onGoToDashboard={handleGoToDashboard}
            />
          )}
        </div>
      </main>
    </div>
  )
}
