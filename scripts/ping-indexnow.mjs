/**
 * Post-build script: pings IndexNow with all sitemap URLs.
 * Runs automatically after every `next build` via the postbuild npm script.
 * Only executes in production (Vercel deploys set VERCEL_ENV=production).
 */

const INDEXNOW_KEY = "63f303fd44293ae3d9e48879b618d67e"
const SITE_URL = "https://gscdaddy.com"

async function main() {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    console.log("[IndexNow] Skipping — not a production deploy")
    return
  }

  // Fetch the live sitemap to get all URLs
  let urls
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`)
    const xml = await res.text()
    urls = [...xml.matchAll(/<loc>(.+?)<\/loc>/g)].map((m) => m[1])
  } catch {
    console.log("[IndexNow] Could not fetch sitemap, falling back to known URLs")
    urls = [SITE_URL]
  }

  if (urls.length === 0) {
    console.log("[IndexNow] No URLs found in sitemap")
    return
  }

  const payload = {
    host: "gscdaddy.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    })
    console.log(`[IndexNow] Pinged ${urls.length} URLs — status ${res.status}`)
  } catch (err) {
    console.log(`[IndexNow] Ping failed: ${err.message}`)
  }
}

main()
