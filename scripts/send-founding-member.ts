import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { Resend } from "resend"
import { render } from "@react-email/components"
import { FoundingMemberEmail } from "../lib/email/templates/founding-member"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "sorixx222@gmail.com"
const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"
const SUBJECT = "You're officially a GSCdaddy Founding Member"
const NAME = "Soraia Barroso"

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env.local")
    process.exit(1)
  }

  console.log("Sending founding-member email to", TO)

  const html = await render(FoundingMemberEmail({ name: NAME }))

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
