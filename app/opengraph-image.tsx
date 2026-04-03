import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "GSCdaddy - Find Your Almost-Ranking Keywords"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #4ade80, #22c55e, #16a34a)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              G
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              GSCdaddy
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              maxWidth: "900px",
            }}
          >
            Find your almost-ranking keywords.{" "}
            <span style={{ color: "#4ade80" }}>Know exactly what to do next.</span>
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            Turn your Google Search Console data into actionable insights with AI-powered
            recommendations.
          </div>

          {/* Bottom bar with features */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "12px",
            }}
          >
            {["Striking Distance Keywords", "AI Action Plans", "Free to Start"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  color: "#d4d4d8",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "20px",
            color: "#71717a",
            fontWeight: 500,
          }}
        >
          gscdaddy.com
        </div>
      </div>
    ),
    { ...size }
  )
}
