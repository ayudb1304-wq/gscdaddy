import { Text, Section, Hr } from "@react-email/components"
import { EmailLayout, GreenButton, StatCard, SushiSignoff, brand, APP_URL } from "./shared"

const SUBJECTS = [
  "Your keywords did things this week",
  "Weekly SERP check for {siteName}",
  "5 keywords that almost made page 1",
  "{siteName}'s search glow-up report",
  "Plot twist: your rankings changed",
]

export function getWeeklySummarySubject(siteName: string) {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
  return subject.replace("{siteName}", siteName)
}

interface Keyword {
  query: string
  position: number
  opportunityScore: number
  impressions: number
}

interface PositionMover {
  query: string
  direction: "up" | "down"
  change: number
  currentPosition: number
}

interface WeeklySummaryProps {
  userName: string
  siteName: string
  totalClicks: number
  totalImpressions: number
  avgPosition: number
  topKeywords: Keyword[]
  positionMovers: PositionMover[]
  recsCompletedCount: number
}

export function WeeklySummaryEmail({
  userName,
  siteName,
  totalClicks,
  totalImpressions,
  avgPosition,
  topKeywords,
  positionMovers,
  recsCompletedCount,
}: WeeklySummaryProps) {
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText={`${siteName}: ${totalClicks} clicks, ${totalImpressions.toLocaleString()} impressions this week`}>
      <Text style={headingStyle}>
        Hey {firstName}, here's your week in search
      </Text>

      <Text style={subtitleStyle}>
        {siteName} / Last 7 days
      </Text>

      {/* Traffic Snapshot */}
      <table cellPadding={0} cellSpacing={8} role="presentation" style={{ width: "100%", margin: "24px 0" }}>
        <tr>
          <StatCard label="Clicks" value={totalClicks.toLocaleString()} />
          <StatCard label="Impressions" value={totalImpressions.toLocaleString()} />
          <StatCard label="Avg Position" value={avgPosition.toFixed(1)} />
        </tr>
      </table>

      {/* Top Striking Distance Keywords */}
      {topKeywords.length > 0 && (
        <>
          <Text style={sectionHeadingStyle}>Top Striking Distance Keywords</Text>
          <table cellPadding={0} cellSpacing={0} role="presentation" style={tableStyle}>
            <tr>
              <th style={thStyle}>Keyword</th>
              <th style={{ ...thStyle, textAlign: "center" as const, width: "70px" }}>Position</th>
              <th style={{ ...thStyle, textAlign: "center" as const, width: "70px" }}>Score</th>
              <th style={{ ...thStyle, textAlign: "right" as const, width: "80px" }}>Impressions</th>
            </tr>
            {topKeywords.map((kw, i) => (
              <tr key={i}>
                <td style={tdStyle}>
                  <Text style={keywordTextStyle}>
                    {kw.query.length > 35 ? kw.query.slice(0, 35) + "..." : kw.query}
                  </Text>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" as const }}>
                  <Text style={positionBadgeStyle}>{kw.position.toFixed(1)}</Text>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" as const }}>
                  <Text style={scoreBadgeStyle}>{Math.round(kw.opportunityScore)}</Text>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" as const }}>
                  <Text style={impressionsTextStyle}>{kw.impressions.toLocaleString()}</Text>
                </td>
              </tr>
            ))}
          </table>
        </>
      )}

      {/* Position Movers */}
      {positionMovers.length > 0 && (
        <>
          <Hr style={{ borderColor: brand.border, margin: "28px 0" }} />
          <Text style={sectionHeadingStyle}>Position Movers</Text>
          <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", margin: "12px 0" }}>
            {positionMovers.map((mover, i) => (
              <tr key={i}>
                <td style={{ padding: "6px 0", width: "28px", verticalAlign: "middle" as const }}>
                  <Text style={{
                    ...moverArrowStyle,
                    color: mover.direction === "up" ? brand.green : "#DC2626",
                  }}>
                    {mover.direction === "up" ? "\u2191" : "\u2193"}
                  </Text>
                </td>
                <td style={{ padding: "6px 0", verticalAlign: "middle" as const }}>
                  <Text style={moverQueryStyle}>
                    {mover.query.length > 40 ? mover.query.slice(0, 40) + "..." : mover.query}
                  </Text>
                </td>
                <td style={{ padding: "6px 0", textAlign: "right" as const, verticalAlign: "middle" as const }}>
                  <Text style={{
                    ...moverChangeStyle,
                    color: mover.direction === "up" ? brand.green : "#DC2626",
                  }}>
                    {mover.direction === "up" ? "-" : "+"}{Math.abs(mover.change).toFixed(1)} pos
                  </Text>
                </td>
              </tr>
            ))}
          </table>
        </>
      )}

      {/* Recs Completed */}
      <Hr style={{ borderColor: brand.border, margin: "28px 0" }} />
      <Section style={recsBoxStyle}>
        <Text style={recsTextStyle}>
          {recsCompletedCount > 0
            ? `${recsCompletedCount} recommendation${recsCompletedCount === 1 ? "" : "s"} completed this week. Nice work.`
            : "No recommendations completed yet. Time to get moving?"
          }
        </Text>
      </Section>

      <GreenButton href={`${APP_URL}/dashboard`}>View Full Report</GreenButton>

      <SushiSignoff message="Keep climbing those SERPs. — Sushi" />
    </EmailLayout>
  )
}

// Styles
const headingStyle = {
  fontFamily: brand.headingFont,
  fontSize: "24px",
  fontWeight: 700,
  color: brand.text,
  margin: "0 0 4px",
}

const subtitleStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "13px",
  color: brand.muted,
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const sectionHeadingStyle = {
  fontFamily: brand.headingFont,
  fontSize: "16px",
  fontWeight: 600,
  color: brand.text,
  margin: "0 0 12px",
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  margin: "12px 0",
}

const thStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "11px",
  fontWeight: 600,
  color: brand.muted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  padding: "8px 6px",
  borderBottom: `2px solid ${brand.border}`,
  textAlign: "left" as const,
}

const tdStyle = {
  padding: "10px 6px",
  borderBottom: `1px solid ${brand.border}`,
  verticalAlign: "middle" as const,
}

const keywordTextStyle = {
  fontFamily: brand.monoFont,
  fontSize: "13px",
  color: brand.text,
  margin: 0,
}

const positionBadgeStyle = {
  fontFamily: brand.monoFont,
  fontSize: "13px",
  fontWeight: 600,
  color: brand.text,
  margin: 0,
}

const scoreBadgeStyle = {
  fontFamily: brand.monoFont,
  fontSize: "13px",
  fontWeight: 600,
  color: brand.green,
  margin: 0,
}

const impressionsTextStyle = {
  fontFamily: brand.monoFont,
  fontSize: "13px",
  color: brand.muted,
  margin: 0,
}

const moverArrowStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "18px",
  fontWeight: 700,
  margin: 0,
}

const moverQueryStyle = {
  fontFamily: brand.monoFont,
  fontSize: "13px",
  color: brand.text,
  margin: 0,
}

const moverChangeStyle = {
  fontFamily: brand.monoFont,
  fontSize: "12px",
  fontWeight: 600,
  margin: 0,
}

const recsBoxStyle = {
  backgroundColor: brand.greenLight,
  borderRadius: brand.radius,
  padding: "16px 20px",
  margin: "0 0 8px",
}

const recsTextStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "14px",
  color: brand.text,
  margin: 0,
}
