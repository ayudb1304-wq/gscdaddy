// Adds or removes a fictional demo site ("trailnotes.blog") on one user's account, for
// screenshots of the app. The data is invented; nothing touches other users' rows.
//
//   node --env-file=.env.local scripts/demo-site.mjs seed <user-id>
//   node --env-file=.env.local scripts/demo-site.mjs remove <user-id>
//
// Remove it before the daily sync (04:00 UTC): the sync would try to fetch Google data
// for a property the account doesn't own, and the recs job would spend AI credits on it.

import { createClient } from "@supabase/supabase-js"

const SITE_URL = "https://trailnotes.blog/"
const ORIGIN = "https://trailnotes.blog"
const [, , command, userId] = process.argv

if (!["seed", "remove"].includes(command) || !userId) {
  console.error("Usage: demo-site.mjs <seed|remove> <user-id>")
  process.exit(1)
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Deterministic pseudo-random so screenshots are repeatable.
let rngState = 42
const rand = () => ((rngState = (rngState * 16807) % 2147483647) - 1) / 2147483646
const jitter = (amount) => (rand() * 2 - 1) * amount

// position: where it sits now; drift: how much it improved over the 90 days (negative = better);
// impr: daily impressions. `fixedDaysAgo` marks keywords whose fix shipped, so they jump after.
const KEYWORDS = [
  // Striking distance (5–15)
  { q: "best ultralight tent 2026", page: "/gear/ultralight-tents", pos: 8.4, drift: -0.6, impr: 140 },
  { q: "how to waterproof hiking boots", page: "/guides/waterproof-boots", pos: 11.2, drift: -1.4, impr: 99 },
  { q: "beginner backpacking checklist", page: "/guides/first-trip", pos: 6.7, drift: -2.4, impr: 218, liftRecent: 1.5 },
  { q: "trekking poles vs no poles", page: "/gear/trekking-poles", pos: 13.9, drift: 0.4, impr: 59 },
  { q: "water filter for backpacking", page: "/gear/water-filters", pos: 9.8, drift: 1.6, impr: 71 },
  { q: "how to choose a sleeping bag", page: "/gear/sleeping-bags", pos: 7.3, drift: -0.8, impr: 122 },
  { q: "day hike packing list", page: "/guides/day-hike-packing-list", pos: 10.6, drift: -0.3, impr: 88 },
  { q: "how heavy should a backpack be", page: "/guides/pack-weight", pos: 12.4, drift: -0.9, impr: 64 },
  { q: "best hiking socks", page: "/gear/hiking-socks", pos: 14.6, drift: 0.2, impr: 77 },
  { q: "hiking for beginners", page: "/guides/hiking-for-beginners", pos: 9.1, drift: -1.1, impr: 190 },
  { q: "camp stove vs jetboil", page: "/gear/camp-stoves", pos: 6.1, drift: -0.5, impr: 46 },
  { q: "what to wear hiking in the rain", page: "/guides/rain-layers", pos: 11.8, drift: -0.4, impr: 52 },
  { q: "how to break in hiking boots", page: "/guides/waterproof-boots", pos: 8.9, drift: -0.2, impr: 38 },
  { q: "ultralight backpacking gear list", page: "/gear/ultralight-tents", pos: 13.1, drift: -0.7, impr: 83 },
  // Already ranking well (1–4)
  { q: "trailnotes", page: "/", pos: 1.1, drift: 0, impr: 64 },
  { q: "leave no trace principles", page: "/guides/leave-no-trace", pos: 3.2, drift: -0.4, impr: 160 },
  { q: "how to read a topo map", page: "/guides/topo-maps", pos: 2.6, drift: -0.3, impr: 112 },
  { q: "bear canister rules", page: "/guides/bear-canisters", pos: 4.1, drift: 0.2, impr: 74 },
  // Further back (16+)
  { q: "best hiking boots", page: "/gear/hiking-boots", pos: 24.5, drift: -2.1, impr: 340 },
  { q: "backpacking tent", page: "/gear/ultralight-tents", pos: 31.2, drift: -1.5, impr: 280 },
  { q: "hiking trails near me", page: "/", pos: 48.0, drift: 0.5, impr: 410 },
  { q: "how to purify water", page: "/gear/water-filters", pos: 19.4, drift: -0.6, impr: 120 },
  // Fixes that shipped (they jump after the fix date)
  { q: "how to pack a backpack", page: "/guides/how-to-pack-a-backpack", pos: 5.4, drift: 0, impr: 175, fixedDaysAgo: 24, before: 11.6, liftRecent: 1.7 },
  { q: "trail running vs hiking shoes", page: "/gear/trail-runners", pos: 6.9, drift: 0, impr: 96, fixedDaysAgo: 19, before: 12.3, liftRecent: 1.8 },
  { q: "how to prevent blisters hiking", page: "/guides/blisters", pos: 7.8, drift: 0, impr: 81, fixedDaysAgo: 14, before: 10.9 },
  { q: "hiking first aid kit list", page: "/guides/first-aid-kit", pos: 9.4, drift: 0, impr: 58, fixedDaysAgo: 9, before: 11.1 },
]

const CTR_BY_POS = (p) => (p < 2 ? 0.3 : p < 3 ? 0.17 : p < 4 ? 0.11 : p < 6 ? 0.07 : p < 8 ? 0.045 : p < 11 ? 0.025 : p < 16 ? 0.012 : 0.004)

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function buildRows(siteId) {
  const rows = []
  const today = new Date()
  for (let daysAgo = 92; daysAgo >= 2; daysAgo--) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - daysAgo)
    // No weekend dip: the Today page compares the last 2 days with the week before, and a
    // dip there makes every keyword look like it's falling.
    const weekendDip = 1
    for (const k of KEYWORDS) {
      let position
      if (k.fixedDaysAgo !== undefined) {
        // Flat before the fix, then a smooth climb over ~10 days to the new position.
        const t = Math.min(1, Math.max(0, (k.fixedDaysAgo - daysAgo) / 10))
        position = k.before + (k.pos - k.before) * t
      } else {
        // Linear drift toward today's position.
        position = k.pos - k.drift * (daysAgo / 90)
      }
      position = Math.max(1, position + jitter(position * 0.06))
      // A couple of recently fixed pages get a visible lift in the last two days ("movers").
      const lift = k.liftRecent && daysAgo <= 3 ? k.liftRecent : 1
      const impressions = Math.max(1, Math.round(k.impr * weekendDip * lift * (1 + jitter(0.12))))
      const clicks = Math.round(impressions * CTR_BY_POS(position) * (1 + jitter(0.25)))
      rows.push({
        site_id: siteId,
        date: isoDate(date),
        query: k.q,
        page: ORIGIN + k.page,
        clicks,
        impressions,
        ctr: impressions ? Number((clicks / impressions).toFixed(4)) : 0,
        position: Number(position.toFixed(2)),
      })
    }
  }
  return rows
}

const ACTIVE_RECS = [
  {
    type: "title_optimization",
    q: "best ultralight tent 2026",
    page: "/gear/ultralight-tents",
    pos: 8.4,
    gain: 210,
    priority: "high",
    text: "Searchers type “ultralight tent”, but your title leads with “tents for thru-hikers”. Matching the phrase in the title and H1 is the fastest lift here.",
    items: [
      "Change the title to “Best Ultralight Tents of 2026 (Tested on the Trail)” so it leads with the exact query.",
      "Rename the H1 to match, and keep “thru-hikers” in the first paragraph.",
      "Add a 2026 comparison table with weight, packed size and price: the three pages above you all have one.",
    ],
  },
  {
    type: "internal_linking",
    q: "how to waterproof hiking boots",
    page: "/guides/waterproof-boots",
    pos: 11.2,
    gain: 120,
    priority: "high",
    text: "This page sits just off page one and almost nothing on your site links to it. Three internal links from strong gear pages should push it up.",
    items: [
      "Link to it from /gear/hiking-boots with the anchor “how to waterproof hiking boots”.",
      "Add a link from /guides/rain-layers in the footwear section.",
      "Link from /guides/first-trip where you mention wet trails.",
    ],
  },
  {
    type: "content_expansion",
    q: "how to choose a sleeping bag",
    page: "/gear/sleeping-bags",
    pos: 7.3,
    gain: 95,
    priority: "medium",
    text: "The page covers temperature ratings but skips fill type and shape, which every page above you explains.",
    items: [
      "Add a section comparing down and synthetic fill, with a short table.",
      "Add a section on mummy vs. rectangular bags with one photo of each.",
      "Answer “what temperature rating do I need” in the first 100 words.",
    ],
  },
  {
    type: "content_refresh",
    q: "day hike packing list",
    page: "/guides/day-hike-packing-list",
    pos: 10.6,
    gain: 70,
    priority: "medium",
    text: "Last updated in 2024, and the pages above you mention 2026 gear. A refresh with a printable list should help.",
    items: [
      "Update gear picks that were discontinued and change the year in the title.",
      "Add a printable checklist at the top of the page.",
    ],
  },
  {
    type: "cannibalization_fix",
    q: "ultralight backpacking gear list",
    page: "/gear/ultralight-tents",
    pos: 13.1,
    gain: 55,
    priority: "medium",
    text: "Two of your pages compete for this query. Google keeps switching between them, so neither climbs.",
    items: [
      "Make /gear/ultralight-tents about tents only and remove the full gear list.",
      "Move the gear list to its own page and link to it from the tents page.",
    ],
  },
  {
    type: "quick_win",
    q: "camp stove vs jetboil",
    page: "/gear/camp-stoves",
    pos: 6.1,
    gain: 40,
    priority: "low",
    text: "You rank well but few people click. A clearer meta description should lift clicks without changing the page.",
    items: [
      "Rewrite the meta description to state the verdict: “Jetboil boils faster; a canister stove is lighter and cheaper.”",
      "Add FAQ schema for the three questions already on the page.",
    ],
  },
]

const DONE_RECS = KEYWORDS.filter((k) => k.fixedDaysAgo !== undefined).map((k, i) => ({
  type: ["title_optimization", "internal_linking", "content_expansion", "quick_win"][i],
  q: k.q,
  page: k.page,
  pos: k.before,
  gain: [160, 110, 80, 50][i],
  priority: i < 2 ? "high" : "medium",
  text: "Shipped. We're tracking this page's position against where it was before the fix.",
  items: ["Shipped fix tracked from the day it was marked done."],
  fixedDaysAgo: k.fixedDaysAgo,
  before: k.before,
}))

async function findSite() {
  const { data, error } = await admin
    .from("sites")
    .select("id")
    .eq("user_id", userId)
    .eq("site_url", SITE_URL)
    .maybeSingle()
  if (error) throw error
  return data
}

async function remove() {
  const site = await findSite()
  if (!site) {
    console.log("No demo site on this account.")
    return
  }
  // gsc_data, recommendations and baselines cascade from sites.
  const { error } = await admin.from("sites").delete().eq("id", site.id)
  if (error) throw error
  await admin.rpc("refresh_striking_distance")
  console.log(`Removed demo site ${site.id} and all of its data.`)
}

async function seed() {
  const { data: user, error: userError } = await admin.from("users").select("id").eq("id", userId).maybeSingle()
  if (userError) throw userError
  if (!user) throw new Error(`No user ${userId}`)

  if (await findSite()) await remove()

  const { data: site, error } = await admin
    .from("sites")
    .insert({
      user_id: userId,
      site_url: SITE_URL,
      display_name: "trailnotes.blog",
      permission_level: "siteOwner",
      is_verified: true,
      sync_status: "completed",
      last_synced_at: new Date().toISOString(),
    })
    .select("id")
    .single()
  if (error) throw error
  console.log(`Created demo site ${site.id}`)

  const rows = buildRows(site.id)
  for (let i = 0; i < rows.length; i += 1000) {
    const { error: e } = await admin.from("gsc_data").insert(rows.slice(i, i + 1000))
    if (e) throw e
  }
  console.log(`Inserted ${rows.length} Search Console rows`)

  const now = Date.now()
  const recRows = [
    ...ACTIVE_RECS.map((r, i) => ({
      site_id: site.id,
      type: r.type,
      query: r.q,
      page: ORIGIN + r.page,
      current_position: r.pos,
      potential_position: Math.max(3, Math.round(r.pos / 2)),
      estimated_traffic_gain: r.gain,
      recommendation_text: r.text,
      action_items: r.items,
      priority: r.priority,
      is_completed: false,
      created_at: new Date(now - i * 3600_000).toISOString(),
      expires_at: new Date(now + 7 * 86400_000).toISOString(),
    })),
    ...DONE_RECS.map((r) => ({
      site_id: site.id,
      type: r.type,
      query: r.q,
      page: ORIGIN + r.page,
      current_position: r.pos,
      potential_position: Math.max(3, Math.round(r.pos / 2)),
      estimated_traffic_gain: r.gain,
      recommendation_text: r.text,
      action_items: r.items,
      priority: r.priority,
      is_completed: true,
      completed_at: new Date(now - r.fixedDaysAgo * 86400_000).toISOString(),
      created_at: new Date(now - (r.fixedDaysAgo + 3) * 86400_000).toISOString(),
      expires_at: new Date(now - (r.fixedDaysAgo - 4) * 86400_000).toISOString(),
    })),
  ]
  const { data: recs, error: recError } = await admin.from("recommendations").insert(recRows).select("id, query, page, completed_at, is_completed")
  if (recError) throw recError
  console.log(`Inserted ${recs.length} recommendations`)

  const baselines = recs
    .filter((r) => r.is_completed)
    .map((r) => {
      const done = DONE_RECS.find((d) => ORIGIN + d.page === r.page && d.q === r.query)
      const end = new Date(r.completed_at)
      end.setUTCDate(end.getUTCDate() - 1)
      const start = new Date(end)
      start.setUTCDate(start.getUTCDate() - 27)
      const kw = KEYWORDS.find((k) => k.q === r.query)
      return {
        recommendation_id: r.id,
        site_id: site.id,
        query: r.query,
        page: r.page,
        baseline_start: isoDate(start),
        baseline_end: isoDate(end),
        baseline_clicks: Math.round(kw.impr * 28 * CTR_BY_POS(done.before)),
        baseline_impressions: kw.impr * 28,
        baseline_avg_position: done.before,
        baseline_avg_ctr: CTR_BY_POS(done.before),
        completed_at: r.completed_at,
      }
    })
  const { error: baseError } = await admin.from("recommendation_baselines").insert(baselines)
  if (baseError) throw baseError
  console.log(`Inserted ${baselines.length} baselines`)

  const { error: refreshError } = await admin.rpc("refresh_striking_distance")
  if (refreshError) console.warn("Striking-distance view refresh failed:", refreshError.message)
  else console.log("Refreshed the striking-distance view")
}

;(command === "seed" ? seed() : remove()).catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
