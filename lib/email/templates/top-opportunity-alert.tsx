import { Text, Link } from "@react-email/components"
import { EmailLayout, GreenButton, StatCard, brand, APP_URL } from "./shared"

interface TopOpportunityAlertProps {
  userName: string
  siteName: string
  topKeyword: string
  currentPosition: number
  potentialPosition: number
  estimatedTrafficGain: number
  totalRecommendations: number
  topRecommendationText: string
}

const subjects = [
  (site: string, gain: number, _total: number) =>
    `+${gain} clicks a month are waiting on ${site}`,
  (site: string, _gain: number, _total: number) =>
    `Your ${site} data has a number I did not expect`,
  (site: string, gain: number, _total: number) =>
    `One move on ${site} could bring ${gain} more clicks`,
  (site: string, _gain: number, total: number) =>
    `${site} has ${total} recommendations you have not opened yet`,
  (site: string, _gain: number, _total: number) =>
    `I would act on this ${site} opportunity today`,
]

export function getTopOpportunityAlertSubject(
  siteName: string,
  estimatedTrafficGain: number,
  totalRecommendations: number
): string {
  const fn = subjects[Math.floor(Math.random() * subjects.length)]
  return fn(siteName, estimatedTrafficGain, totalRecommendations)
}

export function TopOpportunityAlertEmail({
  userName,
  siteName,
  topKeyword,
  currentPosition,
  potentialPosition,
  estimatedTrafficGain,
  totalRecommendations,
  topRecommendationText,
}: TopOpportunityAlertProps) {
  const firstName = userName?.split(" ")[0] || "there"
  const annualGain = estimatedTrafficGain * 12
  const roundedCurrent = Math.round(currentPosition * 10) / 10
  const roundedPotential = Math.round(potentialPosition)

  // Truncate the AI recommendation to fit the email nicely
  const previewText =
    topRecommendationText.length > 200
      ? topRecommendationText.slice(0, 200).trim() + "..."
      : topRecommendationText

  return (
    <EmailLayout
      previewText={`Your top opportunity on ${siteName} could bring +${estimatedTrafficGain} clicks per month. The AI recommendation is ready in your dashboard.`}
    >
      <Text
        style={{
          fontFamily: brand.headingFont,
          fontSize: "22px",
          fontWeight: 700,
          color: brand.text,
          marginBottom: "8px",
        }}
      >
        Hey {firstName},
      </Text>

      <Text style={paragraph}>
        I was looking through your {siteName} recommendations this morning, and one
        of them made me stop scrolling.
      </Text>

      <Text style={paragraph}>
        You have <strong>{totalRecommendations} recommendations</strong> sitting
        in your dashboard right now. Each one is a specific, AI-generated action
        plan based on keywords your site is already ranking for. But one of them
        is bigger than the rest.
      </Text>

      {/* Highlight card for top opportunity */}
      <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", margin: "24px 0" }}>
        <tr>
          <td style={highlightCardStyle}>
            <Text
              style={{
                fontFamily: brand.monoFont,
                fontSize: "16px",
                fontWeight: 600,
                color: brand.green,
                margin: "0 0 12px",
              }}
            >
              &ldquo;{topKeyword}&rdquo;
            </Text>
            <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
              <tr>
                <StatCard label="Position now" value={roundedCurrent.toString()} />
                <td style={{ width: "8px" }} />
                <StatCard label="Target" value={roundedPotential.toString()} />
                <td style={{ width: "8px" }} />
                <StatCard label="Clicks/mo" value={`+${estimatedTrafficGain}`} />
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <Text style={paragraph}>
        Right now this keyword is sitting at position {roundedCurrent}, which is
        close enough to page 1 that a small improvement could bring you{" "}
        <strong>{estimatedTrafficGain} extra clicks per month</strong>. Over a
        year that is roughly {annualGain.toLocaleString()} extra visitors, without
        writing a single new blog post.
      </Text>

      <Text style={paragraph}>
        The recommendation engine already looked at this page and wrote you a
        specific action plan. It is not generic advice. Here is the short version:
      </Text>

      <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", margin: "16px 0" }}>
        <tr>
          <td style={quoteCardStyle}>
            <Text
              style={{
                fontFamily: brand.bodyFont,
                fontSize: "14px",
                lineHeight: "22px",
                color: brand.text,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {previewText}
            </Text>
          </td>
        </tr>
      </table>

      <GreenButton href={`${APP_URL}/reports/recommendations`}>
        See all {totalRecommendations} recommendations
      </GreenButton>

      <Text style={paragraph}>
        You can scan the full list in about two minutes. Most of them take under
        30 minutes of actual work to implement, and they are sorted by impact so
        you can pick the biggest one first.
      </Text>

      <Text style={paragraph}>
        If you have questions about anything in the report, reply to this email.
        It lands in my personal inbox.
      </Text>

      <Text style={paragraph}>Ayush</Text>

      <Text
        style={{
          fontFamily: brand.bodyFont,
          fontSize: "13px",
          color: brand.muted,
          margin: "2px 0 0",
        }}
      >
        Founder, GSCdaddy
      </Text>
      <Text
        style={{
          fontFamily: brand.bodyFont,
          fontSize: "13px",
          color: brand.muted,
          margin: "2px 0 0",
        }}
      >
        <Link
          href="https://x.com/ayu_theindiedev"
          style={{ color: brand.green, textDecoration: "none" }}
        >
          @ayu_theindiedev
        </Link>
      </Text>
    </EmailLayout>
  )
}

const paragraph = {
  fontFamily: brand.bodyFont,
  fontSize: "14px",
  lineHeight: "24px",
  color: brand.text,
  margin: "16px 0",
}

const highlightCardStyle = {
  backgroundColor: "#f0faf0",
  border: `1px solid ${brand.green}`,
  borderRadius: brand.radius,
  padding: "20px",
}

const quoteCardStyle = {
  backgroundColor: brand.bgOuter,
  borderLeft: `3px solid ${brand.green}`,
  borderRadius: "6px",
  padding: "16px 20px",
}
