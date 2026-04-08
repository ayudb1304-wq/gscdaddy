"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone } from "lucide-react"

function charCountColor(current: number, limit: number): string {
  if (current > limit) return "text-red-500"
  if (current >= limit * 0.9) return "text-yellow-500"
  return "text-green-600 dark:text-green-400"
}

function truncate(text: string, limit: number): string {
  if (text.length > limit) return text.slice(0, limit) + "..."
  return text
}

export function SerpForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [view, setView] = useState<"desktop" | "mobile">("desktop")

  const displayUrl = url || "https://example.com/your-page"

  return (
    <div className="space-y-8">
      {/* Input fields */}
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title tag
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Best Running Shoes 2026 | Your Brand"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className={`mt-1 text-xs ${charCountColor(title.length, 60)}`}>
            {title.length}/60
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium"
          >
            Meta description
          </label>
          <textarea
            id="description"
            placeholder="e.g. Discover the top-rated running shoes for every budget. Compare features, comfort, and durability in our expert guide."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p
            className={`mt-1 text-xs ${charCountColor(description.length, 160)}`}
          >
            {description.length}/160
          </p>
        </div>

        <div>
          <label htmlFor="url" className="mb-1.5 block text-sm font-medium">
            Page URL
          </label>
          <input
            id="url"
            type="text"
            placeholder="e.g. https://example.com/best-running-shoes"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Desktop / Mobile toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "desktop" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("desktop")}
        >
          <Monitor className="mr-1.5 size-4" />
          Desktop
        </Button>
        <Button
          variant={view === "mobile" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("mobile")}
        >
          <Smartphone className="mr-1.5 size-4" />
          Mobile
        </Button>
      </div>

      {/* Google-styled preview */}
      <div
        className={`rounded-lg border bg-white p-5 dark:bg-[#202124] ${
          view === "mobile" ? "max-w-sm" : ""
        }`}
      >
        <p className="text-xs text-muted-foreground mb-3">
          {view === "desktop" ? "Desktop" : "Mobile"} preview
        </p>

        {/* URL line */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#006621] dark:text-[#bdc1c6] truncate text-sm">
            {displayUrl}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1 text-xl leading-snug cursor-pointer hover:underline text-[#1a0dab] dark:text-[#8ab4f8]">
          {title ? truncate(title, 60) : "Your Page Title Will Appear Here"}
        </h3>

        {/* Description */}
        <p className="mt-1 text-sm leading-relaxed text-[#545454] dark:text-[#bdc1c6]">
          {description
            ? truncate(description, 160)
            : "Your meta description will appear here. Write a compelling summary to encourage searchers to click through to your page."}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        This is an approximation. Google may display your snippet differently
        depending on the search query and device.
      </p>
    </div>
  )
}
