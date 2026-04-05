import { Text, Link } from "@react-email/components"
import { EmailLayout, GreenButton, brand, APP_URL } from "./shared"

export function WelcomeEmail({ name }: { name: string }) {
  const firstName = name?.split(" ")[0] || "there"

  return (
    <EmailLayout previewText="Welcome to GSCdaddy. Your SEO data has stories to tell.">
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
        Welcome to GSCdaddy. I am Ayush, the founder (and only employee). I built this
        because I was tired of staring at my own Google Search Console data and not
        knowing what to actually do with it.
      </Text>

      <Text style={paragraph}>
        Your 14-day free trial is now active. Here is what you can do right now:
      </Text>

      <Text style={paragraph}>
        <strong>1. Connect your Google Search Console</strong> (if you have not already).
        We only request read-only access. We never modify anything.
      </Text>

      <Text style={paragraph}>
        <strong>2. Check your Striking Distance Keywords.</strong> These are the keywords
        where you rank positions 5-15. They are your biggest quick wins.
      </Text>

      <Text style={paragraph}>
        <strong>3. Generate AI Recommendations.</strong> Hit the generate button and get
        specific action items for each keyword. Not generic advice, but exactly what
        to change on your pages.
      </Text>

      <GreenButton href={`${APP_URL}/dashboard`}>Go to your dashboard</GreenButton>

      <Text style={paragraph}>
        If you have any questions, reply directly to this email. It comes straight to
        my inbox. Not a support queue, not a ticketing system. Just me, reading your email
        and replying personally.
      </Text>

      <Text style={paragraph}>
        Happy ranking,
      </Text>

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
