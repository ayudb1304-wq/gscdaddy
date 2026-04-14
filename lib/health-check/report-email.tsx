import { Text, Link, Hr } from "@react-email/components"
import { EmailLayout, GreenButton, brand, APP_URL } from "@/lib/email/templates/shared"

interface CategorySummary {
  name: string
  score: number
  items: { label: string; status: "pass" | "warning" | "fail"; detail: string }[]
}

interface HealthReportEmailProps {
  domain: string
  score: number
  reportUrl: string
  categories: CategorySummary[]
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a"
  if (score >= 50) return "#ca8a04"
  return "#dc2626"
}

function statusSymbol(status: "pass" | "warning" | "fail"): string {
  if (status === "pass") return "\u2705"
  if (status === "warning") return "\u26a0\ufe0f"
  return "\u274c"
}

export function HealthReportEmail({
  domain,
  score,
  reportUrl,
  categories,
}: HealthReportEmailProps) {
  const failCount = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.status === "fail").length,
    0
  )
  const warnCount = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.status === "warning").length,
    0
  )

  return (
    <EmailLayout previewText={`Your SEO score: ${score}/100 for ${domain}`}>
      <Text style={heading}>
        Your SEO Health Score
      </Text>

      <table
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={{ margin: "24px auto", textAlign: "center" as const }}
      >
        <tr>
          <td
            style={{
              backgroundColor: brand.bgOuter,
              borderRadius: "16px",
              border: `2px solid ${scoreColor(score)}`,
              padding: "24px 40px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontFamily: brand.headingFont,
                fontSize: "48px",
                fontWeight: 700,
                color: scoreColor(score),
                margin: "0",
                lineHeight: "1",
              }}
            >
              {score}
            </Text>
            <Text
              style={{
                fontFamily: brand.bodyFont,
                fontSize: "13px",
                color: brand.muted,
                margin: "4px 0 0",
              }}
            >
              out of 100 for <strong>{domain}</strong>
            </Text>
          </td>
        </tr>
      </table>

      <Text style={paragraph}>
        {score >= 80
          ? `Great news! ${domain} has strong SEO fundamentals. Check the details below for the remaining improvements.`
          : score >= 50
            ? `${domain} has some SEO issues that need attention. We found ${failCount} critical issue${failCount !== 1 ? "s" : ""} and ${warnCount} warning${warnCount !== 1 ? "s" : ""}.`
            : `${domain} needs significant SEO work. We found ${failCount} critical issue${failCount !== 1 ? "s" : ""} that are likely hurting your rankings.`}
      </Text>

      <Hr style={{ borderColor: brand.border, margin: "24px 0" }} />

      {/* Category summaries */}
      {categories.map((cat) => (
        <div key={cat.name}>
          <Text style={categoryHeading}>
            {cat.name}{" "}
            <span style={{ color: scoreColor(cat.score) }}>
              {cat.score}/100
            </span>
          </Text>
          {cat.items
            .filter((item) => item.status !== "pass")
            .map((item, i) => (
              <Text key={i} style={checkItem}>
                {statusSymbol(item.status)} <strong>{item.label}</strong> — {item.detail}
              </Text>
            ))}
          {cat.items.every((item) => item.status === "pass") && (
            <Text style={checkItem}>
              {statusSymbol("pass")} All checks passed
            </Text>
          )}
        </div>
      ))}

      <Hr style={{ borderColor: brand.border, margin: "24px 0" }} />

      <GreenButton href={reportUrl}>View Full Report</GreenButton>

      <Text style={paragraph}>
        Want to go deeper? Connect your Google Search Console to GSCdaddy and
        discover the exact keywords where you are almost ranking on page 1.
      </Text>

      <GreenButton href={`${APP_URL}/login`}>Try GSCdaddy Free</GreenButton>

      <Text
        style={{
          fontFamily: brand.bodyFont,
          fontSize: "13px",
          color: brand.muted,
          marginTop: "32px",
        }}
      >
        — Ayush, Founder of GSCdaddy
      </Text>
    </EmailLayout>
  )
}

const heading = {
  fontFamily: brand.headingFont,
  fontSize: "22px",
  fontWeight: 700 as const,
  color: brand.text,
  marginBottom: "8px",
}

const paragraph = {
  fontFamily: brand.bodyFont,
  fontSize: "14px",
  lineHeight: "24px",
  color: brand.text,
  margin: "16px 0",
}

const categoryHeading = {
  fontFamily: brand.headingFont,
  fontSize: "16px",
  fontWeight: 600 as const,
  color: brand.text,
  margin: "20px 0 8px",
}

const checkItem = {
  fontFamily: brand.bodyFont,
  fontSize: "13px",
  lineHeight: "22px",
  color: brand.text,
  margin: "4px 0",
  paddingLeft: "4px",
}
