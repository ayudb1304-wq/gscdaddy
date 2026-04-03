import { NextRequest, NextResponse } from "next/server"

const INDEXNOW_KEY = "63f303fd44293ae3d9e48879b618d67e"
const SITE_URL = "https://gscdaddy.com"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.INDEXNOW_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { urls } = await request.json()

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: "urls array is required" },
      { status: 400 }
    )
  }

  const absoluteUrls = urls.map((url: string) =>
    url.startsWith("http") ? url : `${SITE_URL}${url}`
  )

  const payload = {
    host: "gscdaddy.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: absoluteUrls,
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  })

  return NextResponse.json({
    success: response.ok,
    status: response.status,
    submitted: absoluteUrls,
  })
}
