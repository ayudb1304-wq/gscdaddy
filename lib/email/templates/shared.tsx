import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
  Font,
} from "@react-email/components"
import type { ReactNode } from "react"

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gscdaddy.com"

export const brand = {
  green: "#3EAF3E",
  greenLight: "#E8F5E8",
  text: "#1a1a1a",
  muted: "#737373",
  border: "#e5e5e5",
  bg: "#ffffff",
  bgOuter: "#f5f5f5",
  radius: "10px",
  headingFont: "'Oxanium', Arial, sans-serif",
  bodyFont: "'Inter', Arial, sans-serif",
  monoFont: "'JetBrains Mono', monospace",
} as const

export function EmailLayout({ children, previewText }: { children: ReactNode; previewText?: string }) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Oxanium"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Oxanium:wght@600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={bodyStyle}>
        {previewText && <Text style={{ display: "none" }}>{previewText}</Text>}
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Img
              src={`${APP_URL}/images/GSCDaddyLogo.png`}
              alt="GSCdaddy"
              width={150}
              height="auto"
              style={{ margin: "0 auto" }}
            />
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You're getting this because you signed up for{" "}
              <Link href={APP_URL} style={{ color: brand.green, textDecoration: "none" }}>
                GSCdaddy
              </Link>
              .
            </Text>
            <Text style={footerTextStyle}>
              <Link
                href={`${APP_URL}/settings/profile`}
                style={{ color: brand.muted, textDecoration: "underline" }}
              >
                Unsubscribe from emails
              </Link>
            </Text>
            <Text style={{ ...footerTextStyle, marginTop: "16px", fontSize: "11px" }}>
              Sent with love by Sushi
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function GreenButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: "32px auto" }}>
      <tr>
        <td
          style={{
            backgroundColor: brand.green,
            borderRadius: brand.radius,
            padding: "14px 32px",
            textAlign: "center" as const,
          }}
        >
          <Link
            href={href}
            style={{
              color: "#ffffff",
              fontFamily: brand.headingFont,
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {children}
          </Link>
        </td>
      </tr>
    </table>
  )
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <td style={statCardStyle}>
      <Text style={statValueStyle}>{value}</Text>
      <Text style={statLabelStyle}>{label}</Text>
    </td>
  )
}

export function SushiSignoff({ message }: { message: string }) {
  return (
    <Text style={{ fontFamily: brand.bodyFont, color: brand.muted, fontSize: "14px", marginTop: "32px", fontStyle: "italic" }}>
      {message}
    </Text>
  )
}

// Styles
const bodyStyle = {
  backgroundColor: brand.bgOuter,
  fontFamily: brand.bodyFont,
  margin: 0,
  padding: "40px 0",
}

const containerStyle = {
  backgroundColor: brand.bg,
  borderRadius: "12px",
  border: `1px solid ${brand.border}`,
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden" as const,
}

const headerStyle = {
  backgroundColor: brand.bg,
  padding: "32px 0 24px",
  textAlign: "center" as const,
}

const contentStyle = {
  padding: "0 40px 32px",
}

const hrStyle = {
  borderColor: brand.border,
  margin: "0 40px",
}

const footerStyle = {
  padding: "24px 40px 32px",
  textAlign: "center" as const,
}

const footerTextStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "12px",
  color: brand.muted,
  margin: "4px 0",
}

const statCardStyle = {
  backgroundColor: brand.bgOuter,
  borderRadius: brand.radius,
  border: `1px solid ${brand.border}`,
  padding: "16px 12px",
  textAlign: "center" as const,
  width: "33.33%",
}

const statValueStyle = {
  fontFamily: brand.headingFont,
  fontSize: "24px",
  fontWeight: 700,
  color: brand.text,
  margin: "0 0 4px",
}

const statLabelStyle = {
  fontFamily: brand.bodyFont,
  fontSize: "12px",
  color: brand.muted,
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}
