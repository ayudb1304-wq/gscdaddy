import { Resend } from "resend"
import type { ReactElement } from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}): Promise<{ id: string } | null> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      react,
    })

    if (error) {
      console.error("Resend error:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("Failed to send email:", err)
    return null
  }
}
