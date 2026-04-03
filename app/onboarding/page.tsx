"use client"

import { useState, useEffect, useCallback } from "react"
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
    setLoading(true)
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, permissionLevel }),
      })
      const json = await res.json()
      if (json.success) {
        // Trigger sync
        await fetch(`/api/sites/${json.data.id}/sync`, { method: "POST" })
        setStep(4)
        startSyncProgress()
      }
    } catch (e) {
      console.error("Failed to add site:", e)
    } finally {
      setLoading(false)
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

  function handleGoToDashboard() {
    router.push("/dashboard")
  }

  return (
    <div className="dark">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 py-6 font-heading text-xl font-bold">
          <Logo size={24} />
          GSCdaddy
        </div>

        {/* Wizard */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
          <ProgressBar currentStep={step} />

          {step === 2 && (
            <PersonaStep onSelect={handlePersonaSelect} loading={loading} />
          )}

          {step === 3 && !showSitePicker && (
            <PrimingStep onConnect={handleConnect} loading={loading} />
          )}

          {step === 3 && showSitePicker && (
            <SitePickerStep
              sites={availableSites}
              onSelect={handleSiteSelect}
              loading={loading}
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
      </div>
    </div>
  )
}
