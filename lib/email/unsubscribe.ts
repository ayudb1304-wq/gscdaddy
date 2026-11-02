import { createHmac, timingSafeEqual } from "crypto"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gscdaddy.com"

/** Placeholder the shared email footer renders; replaced per recipient at send time. */
export const UNSUBSCRIBE_PLACEHOLDER = "__GSCDADDY_UNSUBSCRIBE_URL__"

function secret(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error("ENCRYPTION_KEY is required to sign unsubscribe links")
  return key
}

export function unsubscribeToken(userId: string): string {
  return createHmac("sha256", secret()).update(`unsubscribe:${userId}`).digest("base64url")
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  if (!userId || !token) return false
  const expected = Buffer.from(unsubscribeToken(userId))
  const actual = Buffer.from(token)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function unsubscribeUrl(userId: string): string {
  const params = new URLSearchParams({ u: userId, t: unsubscribeToken(userId) })
  return `${APP_URL}/unsubscribe?${params}`
}

/**
 * Fill in the footer link and build RFC 8058 one-click headers (Gmail/Yahoo
 * show an "Unsubscribe" button and require this for bulk senders). Without a
 * userId (e.g. health-check leads) the link falls back to the settings page.
 */
export function applyUnsubscribe(html: string, userId?: string) {
  if (!userId) {
    return { html: html.split(UNSUBSCRIBE_PLACEHOLDER).join(`${APP_URL}/settings/profile`), headers: undefined }
  }
  const url = unsubscribeUrl(userId)
  const params = new URLSearchParams({ u: userId, t: unsubscribeToken(userId) })
  return {
    html: html.split(UNSUBSCRIBE_PLACEHOLDER).join(url),
    headers: {
      "List-Unsubscribe": `<${APP_URL}/api/unsubscribe?${params}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  }
}
