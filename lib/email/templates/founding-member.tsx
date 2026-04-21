import { Text, Link } from "@react-email/components"
import { EmailLayout, GreenButton, brand, APP_URL } from "./shared"

export function FoundingMemberEmail({ name }: { name?: string }) {
  const firstName = name?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText="You're officially a GSCdaddy Founding Member.">
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
        Quick note from Ayush, the founder (and still only employee) of GSCdaddy.
      </Text>

      <Text style={paragraph}>
        I just bumped your account up to the <strong>Pro plan</strong>, on the house,
        and tagged you as one of our <strong>Founding Members</strong>. That means:
      </Text>

      <Text style={paragraph}>
        <strong>Pro features unlocked.</strong> Up to 5 sites, 25 AI recommendations
        per day, decay alerts, CSV exports, and priority support.
      </Text>

      <Text style={paragraph}>
        <strong>Founding Member status.</strong> You're in the room early. I'll be
        leaning on folks like you for feedback as we figure out what to build next.
      </Text>

      <Text style={paragraph}>
        <strong>Direct line to me.</strong> If something breaks, feels clunky, or you
        want a feature, just hit reply. Your email comes straight to my inbox.
      </Text>

      <Text style={paragraph}>
        No catch, no expiry, no hidden asterisk. Just a thank-you for being one of the
        early believers.
      </Text>

      <GreenButton href={`${APP_URL}/dashboard`}>Go to your dashboard</GreenButton>

      <Text style={paragraph}>
        Thanks for being here early. It genuinely means a lot.
      </Text>

      <Text style={paragraph}>Happy ranking,</Text>

      <Text
        style={{
          fontFamily: brand.bodyFont,
          fontSize: "14px",
          color: brand.text,
          fontWeight: 600,
          margin: "4px 0 0",
        }}
      >
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
