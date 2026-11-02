// Generates the marketing artwork with the Higgsfield API and saves it to public/marketing/.
//
//   node --env-file=.env.local scripts/generate-marketing-art.mjs            # all images
//   node --env-file=.env.local scripts/generate-marketing-art.mjs hero-sky   # one image
//
// Needs HIGGSFIELD_API_KEY ("<key id>:<secret>") in .env.local. Existing files are skipped
// unless you pass --force. API shape follows github.com/higgsfield-ai/higgsfield-client.

import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

const BASE = "https://api.higgsfield.ai"
const OUT_DIR = path.join(process.cwd(), "public", "marketing")
const KEY = process.env.HIGGSFIELD_API_KEY

const HALFTONE =
  "black and white halftone newspaper print photograph, visible coarse print dots, isolated object centered on a plain warm off-white paper background, soft shadow, high contrast, collage cut-out style, no text, no logos"

export const JOBS = {
  "hero-sky": {
    model: "higgsfield-ai/soul/standard",
    args: {
      prompt:
        "Wide cinematic landscape photograph: a bright soft-blue sky filled with fluffy white cumulus clouds taking up most of the frame, and at the very bottom three gentle layered rolling hills in fresh lime green and deep green, smooth curved ridgelines like paper cut-outs, airy morning light, calm, optimistic, lots of empty sky for text, no people, no buildings, no text",
      resolution: "1080p",
      aspect_ratio: "16:9",
    },
  },
  // Image-to-video: pass the public URL of the generated hero image as HERO_IMAGE_URL.
  "hero-loop": {
    model: "kling-video/v2.5-turbo/pro/image-to-video",
    args: {
      prompt:
        "Static locked-off camera. Clouds drift slowly to the right across the sky, soft wind ripples gently through the grass on the green hills. Calm, slow, seamless ambient motion. No camera movement.",
      negative_prompt: "camera shake, zoom, pan, people, birds, text, fast motion",
      duration: 5,
      get image_url() {
        return process.env.HERO_IMAGE_URL
      },
    },
  },
  "obj-magnifier": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `A vintage brass magnifying glass. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
  "obj-compass": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `An antique pocket compass with the lid open. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
  "obj-telescope": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `A large antique brass telescope on a short tripod filling most of the frame, no border, no frame. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
  "obj-ladder": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `A short wooden step ladder. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
  "obj-target": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `An archery target with one arrow stuck just outside the bullseye. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
  "obj-stopwatch": {
    model: "higgsfield-ai/soul/standard",
    args: { prompt: `A large vintage mechanical stopwatch filling most of the frame, seen straight on, no border, no frame, no photo print edge. ${HALFTONE}`, resolution: "1080p", aspect_ratio: "1:1" },
  },
}

function headers() {
  return {
    Authorization: `Key ${KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "gscdaddy-marketing-art/1.0",
  }
}

async function submit(job) {
  const res = await fetch(`${BASE}/${job.model}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(job.args),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`submit failed (${res.status}): ${text.slice(0, 400)}`)
  return JSON.parse(text)
}

async function waitFor(statusUrl, label) {
  const started = Date.now()
  for (;;) {
    const res = await fetch(statusUrl, { headers: headers() })
    const text = await res.text()
    if (!res.ok) throw new Error(`status failed (${res.status}): ${text.slice(0, 400)}`)
    const data = JSON.parse(text)
    if (data.status === "completed") return data
    if (["failed", "nsfw", "canceled", "cancelled"].includes(data.status)) {
      throw new Error(`${label}: ${data.status} ${JSON.stringify(data).slice(0, 300)}`)
    }
    if (Date.now() - started > 10 * 60_000) throw new Error(`${label}: timed out`)
    await new Promise((r) => setTimeout(r, 3000))
  }
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function run(name, job, force) {
  const already = await Promise.all(["jpg", "png", "mp4"].map((e) => exists(path.join(OUT_DIR, `${name}.${e}`))))
  if (!force && already.some(Boolean)) {
    console.log(`skip ${name} (exists)`)
    return
  }
  const sub = await submit(job)
  console.log(`queued ${name} → ${sub.request_id}`)
  const result = await waitFor(sub.status_url, name)
  const url = result.images?.[0]?.url ?? result.video?.url ?? result.videos?.[0]?.url
  console.log(`${name} output: ${url}`)
  if (!url) throw new Error(`${name}: no output url in ${JSON.stringify(result).slice(0, 300)}`)
  const file = await fetch(url)
  if (!file.ok) throw new Error(`${name}: download failed ${file.status}`)
  const type = file.headers.get("content-type") ?? ""
  const ext = type.includes("video") ? "mp4" : type.includes("png") ? "png" : "jpg"
  const outPath = path.join(OUT_DIR, `${name}.${ext}`)
  await writeFile(outPath, Buffer.from(await file.arrayBuffer()))
  console.log(`saved ${path.relative(process.cwd(), outPath)}`)
}

async function main() {
  if (!KEY || !KEY.includes(":")) {
    console.error("Set HIGGSFIELD_API_KEY=<key id>:<secret> in .env.local")
    process.exit(1)
  }
  await mkdir(OUT_DIR, { recursive: true })
  const force = process.argv.includes("--force")
  const names = process.argv.slice(2).filter((a) => !a.startsWith("--"))
  const selected = names.length ? names : Object.keys(JOBS)
  const results = await Promise.allSettled(selected.map((n) => run(n, JOBS[n], force)))
  let failed = 0
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      failed++
      console.error(`✗ ${selected[i]}: ${r.reason?.message ?? r.reason}`)
    }
  })
  if (failed) process.exit(1)
}

main()
