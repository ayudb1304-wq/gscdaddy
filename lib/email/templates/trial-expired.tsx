import { Text, Section } from "@react-email/components"
import { EmailLayout, GreenButton, SushiSignoff, brand, APP_URL } from "./shared"

const SUBJECTS = [
  "Your trial just left the chat",
  "Read-only mode activated (but it doesn't have to be)",
  "Your keywords are frozen in time",
]

export function getTrialExpiredSubject() {
  return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
}

interface TrialExpiredProps {
  userName: string
  keywordsTracked: number
  recsGenerated: number
}

export function TrialExpiredEmail({ userName, keywordsTracked, recsGenerated }: TrialExpiredProps) {
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText="Your GSCdaddy trial ended today. Here's what happens next.">
      <Text style={headingStyle}>
        Hey {firstName}
      </Text>

      <Text style={bodyTextStyle}>
        Your GSCdaddy trial ended today. Your account is now in read-only mode.
      </Text>

      <Section style={changeBoxStyle}>
        <Text style={changeHeadingStyle}>What changed</Text>
        <Text style={listItemStyle}>No new data syncs from Google Search Console</Text>
        <Text style={listItemStyle}>No new AI recommendations</Text>
        <Text style={listItemStyle}>No CSV exports</Text>
        <Text style={listItemStyle}>Striking distance data frozen at last sync</Text>
      </Section>

      <Section style={safeBoxStyle}>
        <Text style={safeHeadingStyle}>What's still there</Text>
        <Text style={listItemStyle}>Your existing data is safe</Text>
        <Text style={listItemStyle}>You can still view past reports</Text>
        <Text style={listItemStyle}>Your {keywordsTracked.toLocaleString()} tracked keywords and {recsGenerated} recommendations are waiting</Text>
      </Section>

      <Text style={bodyTextStyle}>
        Everything you built during the trial is waiting. Upgrade to pick up where you left off.
      </Text>

      <GreenButton href={`${APP_URL}/settings/billing`}>Upgrade Now</GreenButton>

      <SushiSignoff message="Your keywords miss you already. — Sushi" />
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

const changeBoxStyle = {
  backgroundColor: "#FEF2F2",
  borderRadius: brand.radius,
  border: "1px solid #FECACA",
  padding: "20px 24px",
  margin: "24px 0",
}

const changeHeadingStyle = {
  fontFamily: brand.headingFont,
  fontSize: "14px",
  fontWeight: 600,
  color: "#DC2626",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const safeBoxStyle = {
  backgroundColor: brand.greenLight,
  borderRadius: brand.radius,
  border: "1px solid #BBF7D0",
  padding: "20px 24px",
  margin: "24px 0",
}

const safeHeadingStyle = {
  fontFamily: brand.headingFont,
  fontSize: "14px",
  fontWeight: 600,
  color: brand.green,
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const listItemStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "14px",
  color: brand.text,
  margin: "6px 0",
  paddingLeft: "16px",
}
