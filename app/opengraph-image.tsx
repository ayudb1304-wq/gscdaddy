import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "GSCdaddy - Find Your Almost-Ranking Keywords"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const [logoData, caveatFont] = await Promise.all([
    readFile(join(process.cwd(), "public/images/GSCDaddyLogo_LightMode.png")),
    fetch("https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap")
      .then((res) => res.text())
      .then((css) => {
        const url = css.match(/src: url\((.+?)\)/)?.[1]
        return url ? fetch(url).then((r) => r.arrayBuffer()) : null
      }),
  ])
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radar graphic */}
        <svg
          viewBox="0 0 600 600"
          style={{
            position: "absolute",
            right: "-80px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "550px",
            height: "550px",
            opacity: 0.08,
          }}
        >
          <circle cx="300" cy="300" r="280" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="210" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="140" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="70" stroke="white" strokeWidth="1" fill="none" />
          <line x1="300" y1="16" x2="300" y2="584" stroke="white" strokeWidth="0.5" />
          <line x1="16" y1="300" x2="584" y2="300" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Green accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #4ade80, #16a34a, #4ade80)",
          }}
        />

        {/* Top: Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoBase64} alt="" width={52} height={52} />
          <span
            style={{
              fontSize: "30px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            GSCdaddy
          </span>
        </div>

        {/* Middle: Headline + subtext */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "820px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "54px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-2px",
            }}
          >
            <span style={{ color: "#ffffff" }}>Find your <span style={{ fontFamily: "Caveat" }}>almost-ranking</span></span>
            <span style={{ color: "#ffffff" }}>
              keywords.{" "}
              <span style={{ color: "#4ade80" }}>Act on them.</span>
            </span>
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#737373",
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Google Search Console analytics with AI-powered action plans to push your pages to page 1.
          </div>
        </div>

        {/* Bottom: Feature pills + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            {["Striking Distance Keywords", "AI Recommendations", "Free 14-Day Trial"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "16px",
                    color: "#a3a3a3",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "100px",
                    padding: "8px 18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#4ade80",
                    }}
                  />
                  {item}
                </div>
              )
            )}
          </div>

          <div
            style={{
              fontSize: "18px",
              color: "#525252",
              fontWeight: 500,
            }}
          >
            gscdaddy.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: caveatFont
        ? [{ name: "Caveat", data: caveatFont, weight: 700 as const }]
        : [],
    }
  )
}
