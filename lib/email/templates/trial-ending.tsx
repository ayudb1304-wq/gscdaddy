import { Text, Section } from "@react-email/components"
import { EmailLayout, GreenButton, StatCard, SushiSignoff, brand, APP_URL } from "./shared"

const SUBJECTS = [
  "3 days left to keep your SEO superpowers",
  "Your trial's about to ghost you",
  "Tick tock: your striking distance data needs you",
]

export function getTrialEndingSubject() {
  return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
}

interface TrialEndingProps {
  userName: string
  daysLeft: number
  trialEndDate: string
  keywordsTracked: number
  recsGenerated: number
  sitesConnected: number
}

export function TrialEndingEmail({
  userName,
  daysLeft,
  trialEndDate,
  keywordsTracked,
  recsGenerated,
  sitesConnected,
}: TrialEndingProps) {
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText={`${daysLeft} days left on your GSCdaddy trial. Here's what you've built.`}>
      <Text style={headingStyle}>
        Hey {firstName}, quick heads up
      </Text>

      <Text style={bodyTextStyle}>
        Your GSCdaddy trial wraps up on <strong>{trialEndDate}</strong>.
        Here's what you've built so far:
      </Text>

      {/* Accomplishment stats */}
      <table cellPadding={0} cellSpacing={8} role="presentation" style={{ width: "100%", margin: "24px 0" }}>
        <tr>
          <StatCard label="Keywords Tracked" value={keywordsTracked.toLocaleString()} />
          <StatCard label="Recs Generated" value={recsGenerated} />
          <StatCard label="Sites Connected" value={sitesConnected} />
        </tr>
      </table>

      <Section style={warningBoxStyle}>
        <Text style={warningTextStyle}>
          After the trial, you'll switch to read-only mode. No new recommendations, no fresh data syncs.
          All your existing data stays safe though.
        </Text>
      </Section>

      <Text style={bodyTextStyle}>
        Upgrading takes 30 seconds and keeps everything running.
      </Text>

      <GreenButton href={`${APP_URL}/settings/billing`}>Pick a Plan</GreenButton>

      <SushiSignoff message="No pressure. But your keywords won't optimize themselves. — Sushi" />
    </EmailLayout>
  )
}

const headingStyle = {
  fontFamily: brand.headingFont,
  fontSize: "24px",
  fontWeight: 700,
  color: brand.text,
  margin: "0 0 16px",
}

const bodyTextStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "15px",
  color: brand.text,
  lineHeight: "1.6",
  margin: "16px 0",
}

const warningBoxStyle = {
  backgroundColor: "#FFFBEB",
  borderRadius: brand.radius,
  border: "1px solid #FDE68A",
  padding: "16px 20px",
  margin: "24px 0",
}

const warningTextStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "14px",
  color: "#92400E",
  lineHeight: "1.6",
  margin: 0,
}
