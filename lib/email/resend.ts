import { Resend } from "resend"
import { render } from "@react-email/components"
import type { ReactElement } from "react"
import { applyUnsubscribe } from "./unsubscribe"

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = "Sushi from GSCdaddy <sushi@gscdaddy.com>"

/**
 * Send an email. Pass `userId` for anything sent to an account holder: it fills
 * in their signed one-click unsubscribe link and the List-Unsubscribe headers.
 */
export async function sendEmail({
  to,
  subject,
  react,
  userId,
}: {
  to: string
  subject: string
  react: ReactElement
  userId?: string
}): Promise<{ id: string } | null> {
  try {
    const { html, headers } = applyUnsubscribe(await render(react), userId)
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html, headers })

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
