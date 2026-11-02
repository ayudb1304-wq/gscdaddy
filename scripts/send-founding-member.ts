import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { Resend } from "resend"
import { render } from "@react-email/components"
import { FoundingMemberEmail } from "../lib/email/templates/founding-member"
import { applyUnsubscribe } from "../lib/email/unsubscribe"
const fillUnsubscribe = (html: string) => applyUnsubscribe(html).html

const resend = new Resend(process.env.RESEND_API_KEY)
// Usage: npx tsx scripts/send-founding-member.ts <email> "<full name>"
// (Recipient details are passed in, not kept in the repo.)
const [TO, NAME] = process.argv.slice(2)
const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"
const SUBJECT = "You're officially a GSCdaddy Founding Member"

async function main() {
  if (!TO || !NAME || !TO.includes("@")) {
    console.error('Usage: npx tsx scripts/send-founding-member.ts <email> "<full name>"')
    process.exit(1)
  }
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env.local")
    process.exit(1)
  }

  console.log("Sending founding-member email to", TO)

  const html = fillUnsubscribe(await render(FoundingMemberEmail({ name: NAME })))

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: SUBJECT,
    html,
  })

  if (error) {
    console.error("Resend error:", error)
    process.exit(1)
  }

  console.log("Sent! ID:", data?.id)
}

main()
