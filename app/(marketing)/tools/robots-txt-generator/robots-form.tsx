"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Plus, Trash2, Download } from "lucide-react"

interface Rule {
  id: string
  userAgent: string
  type: "Allow" | "Disallow"
  path: string
}

const PRESETS: Record<string, { rules: Omit<Rule, "id">[]; sitemapUrl: string; crawlDelay: string }> = {
  "allow-all": {
    rules: [{ userAgent: "*", type: "Allow", path: "/" }],
    sitemapUrl: "",
    crawlDelay: "",
  },
  "block-all": {
    rules: [{ userAgent: "*", type: "Disallow", path: "/" }],
    sitemapUrl: "",
    crawlDelay: "",
  },
  "block-ai-bots": {
    rules: [
      { userAgent: "*", type: "Allow", path: "/" },
      { userAgent: "GPTBot", type: "Disallow", path: "/" },
      { userAgent: "Google-Extended", type: "Disallow", path: "/" },
      { userAgent: "CCBot", type: "Disallow", path: "/" },
      { userAgent: "ChatGPT-User", type: "Disallow", path: "/" },
      { userAgent: "anthropic-ai", type: "Disallow", path: "/" },
    ],
    sitemapUrl: "",
    crawlDelay: "",
  },
  "standard-blog": {
    rules: [
      { userAgent: "*", type: "Allow", path: "/" },
      { userAgent: "*", type: "Disallow", path: "/api/" },
      { userAgent: "*", type: "Disallow", path: "/admin/" },
      { userAgent: "*", type: "Disallow", path: "/_next/" },
    ],
    sitemapUrl: "",
    crawlDelay: "",
  },
}

let nextId = 1
function makeId() {
  return String(nextId++)
}

function addIds(rules: Omit<Rule, "id">[]): Rule[] {
  return rules.map((r) => ({ ...r, id: makeId() }))
}

export function RobotsForm() {
  const [rules, setRules] = useState<Rule[]>(addIds(PRESETS["allow-all"].rules))
  const [sitemapUrl, setSitemapUrl] = useState("")
  const [crawlDelay, setCrawlDelay] = useState("")
  const [copied, setCopied] = useState(false)

  function applyPreset(key: string) {
    const preset = PRESETS[key]
    setRules(addIds(preset.rules))
    if (preset.crawlDelay) setCrawlDelay(preset.crawlDelay)
  }

  function addRule() {
    setRules([...rules, { id: makeId(), userAgent: "*", type: "Disallow", path: "" }])
  }

  function removeRule(id: string) {
    setRules(rules.filter((r) => r.id !== id))
  }

  function updateRule(id: string, field: keyof Omit<Rule, "id">, value: string) {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function generateOutput(): string {
    // Group rules by user-agent
    const groups = new Map<string, { type: string; path: string }[]>()
    for (const rule of rules) {
      const agent = rule.userAgent || "*"
      if (!groups.has(agent)) groups.set(agent, [])
      groups.get(agent)!.push({ type: rule.type, path: rule.path })
    }

    const lines: string[] = []
    for (const [agent, agentRules] of groups) {
      lines.push(`User-agent: ${agent}`)
      if (crawlDelay && agent === "*") {
        lines.push(`Crawl-delay: ${crawlDelay}`)
      }
      for (const r of agentRules) {
        if (r.path) lines.push(`${r.type}: ${r.path}`)
      }
      lines.push("")
    }

    if (sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`)
    }

    return lines.join("\n").trim()
  }

  const output = generateOutput()

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "robots.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Start from a preset</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              {key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Rules</label>
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-2">
            <select
              value={rule.userAgent}
              onChange={(e) => updateRule(rule.id, "userAgent", e.target.value)}
              className="h-10 w-36 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="*">* (All bots)</option>
              <option value="Googlebot">Googlebot</option>
              <option value="Bingbot">Bingbot</option>
              <option value="GPTBot">GPTBot</option>
              <option value="Google-Extended">Google-Extended</option>
              <option value="CCBot">CCBot</option>
              <option value="ChatGPT-User">ChatGPT-User</option>
              <option value="anthropic-ai">anthropic-ai</option>
            </select>
            <select
              value={rule.type}
              onChange={(e) => updateRule(rule.id, "type", e.target.value as "Allow" | "Disallow")}
              className="h-10 w-28 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Allow">Allow</option>
              <option value="Disallow">Disallow</option>
            </select>
            <input
              type="text"
              placeholder="/path/"
              value={rule.path}
              onChange={(e) => updateRule(rule.id, "path", e.target.value)}
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => removeRule(rule.id)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="mr-1.5 size-3.5" />
          Add rule
        </Button>
      </div>

      {/* Sitemap + Crawl delay */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sitemap-url" className="mb-1.5 block text-sm font-medium">
            Sitemap URL
          </label>
          <input
            id="sitemap-url"
            type="url"
            placeholder="https://yoursite.com/sitemap.xml"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="crawl-delay" className="mb-1.5 block text-sm font-medium">
            Crawl-delay (seconds)
          </label>
          <input
            id="crawl-delay"
            type="number"
            min="0"
            placeholder="Optional"
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Generated robots.txt</label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="mr-1.5 size-3.5" /> : <Copy className="mr-1.5 size-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 size-3.5" />
                Download
              </Button>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm whitespace-pre">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
