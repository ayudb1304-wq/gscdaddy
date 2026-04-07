import { Text, Link } from "@react-email/components"
import { EmailLayout, GreenButton, StatCard, brand, APP_URL } from "./shared"

interface NudgeRecommendationsProps {
  userName: string
  siteName: string
  topKeyword: string
  topKeywordPosition: number
  topKeywordImpressions: number
  totalOpportunities: number
}

const subjects = [
  (site: string) => `Your ${site} data found something you should see`,
  (site: string) => `${site} has keywords waiting for you`,
  (_site: string) => `We ran the numbers. You are leaving clicks on the table.`,
  (site: string) => `There is a report sitting in your ${site} dashboard`,
  (_site: string) => `Quick question about your striking distance keywords`,
]

export function getNudgeRecommendationsSubject(siteName: string): string {
  const fn = subjects[Math.floor(Math.random() * subjects.length)]
  return fn(siteName)
}

export function NudgeRecommendationsEmail({
  userName,
  siteName,
  topKeyword,
  topKeywordPosition,
  topKeywordImpressions,
  totalOpportunities,
}: NudgeRecommendationsProps) {
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText={`"${topKeyword}" is sitting at position ${Math.round(topKeywordPosition)} with ${topKeywordImpressions.toLocaleString()} impressions. You have not generated recommendations yet.`}>
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
        I noticed something while your {siteName} data was syncing.
      </Text>

      <Text style={paragraph}>
        Your site has <strong>{totalOpportunities} keywords</strong> sitting in
        striking distance (positions 5 to 15). These are real keywords that real
        people are searching for, and your site is showing up. But you have not
        generated recommendations for them yet.
      </Text>

      <Text style={paragraph}>
        One of them caught my eye:
      </Text>

      {/* Highlight card for top keyword */}
      <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", margin: "24px 0" }}>
        <tr>
          <td style={highlightCardStyle}>
            <Text style={{
              fontFamily: brand.monoFont,
              fontSize: "16px",
              fontWeight: 600,
              color: brand.green,
              margin: "0 0 12px",
            }}>
              &ldquo;{topKeyword}&rdquo;
            </Text>
            <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%" }}>
              <tr>
                <StatCard label="Position" value={Math.round(topKeywordPosition).toString()} />
                <td style={{ width: "8px" }} />
                <StatCard label="Impressions" value={topKeywordImpressions.toLocaleString()} />
                <td style={{ width: "8px" }} />
                <StatCard label="Status" value="No action yet" />
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <Text style={paragraph}>
        {topKeywordImpressions.toLocaleString()} people searched for this in the last 28 days
        and your page appeared at position {Math.round(topKeywordPosition)}. That is close
        enough to page 1 that a few changes to your title tag and content could move it up
        and start capturing real clicks.
      </Text>

      <Text style={paragraph}>
        But I cannot tell you exactly what to change until you hit the generate button.
        The recommendations engine looks at your specific pages, your specific competitors
        in those positions, and gives you a short list of concrete fixes. Not generic SEO
        advice. Actual things to do on actual pages.
      </Text>

      <GreenButton href={`${APP_URL}/reports/recommendations`}>
        Generate your recommendations
      </GreenButton>

      <Text style={paragraph}>
        It takes about 30 seconds. And you might be surprised what it finds.
      </Text>

      <Text style={paragraph}>
        If you have questions about anything in the report, reply to this email. It
        lands in my personal inbox.
      </Text>

      <Text style={paragraph}>
        Ayush
      </Text>

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
        <Link href="https://x.com/ayu_theindiedev" style={{ color: brand.green, textDecoration: "none" }}>
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
