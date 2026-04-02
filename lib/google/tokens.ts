import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return Buffer.from(key, "hex")
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: base64(iv + tag + ciphertext)
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decrypt(encoded: string): string {
  const buf = Buffer.from(encoded, "base64")
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext) + decipher.final("utf8")
}

export async function storeTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
) {
  const admin = createAdminClient()
  await admin
    .from("users")
    .update({
      google_access_token: encrypt(accessToken),
      google_refresh_token: encrypt(refreshToken),
      google_token_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
}

export async function getDecryptedTokens(userId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("users")
    .select("google_access_token, google_refresh_token, google_token_expires_at")
    .eq("id", userId)
    .single()

  if (error || !data?.google_access_token || !data?.google_refresh_token) {
    return null
  }

  return {
    accessToken: decrypt(data.google_access_token),
    refreshToken: decrypt(data.google_refresh_token),
    expiresAt: new Date(data.google_token_expires_at),
  }
}

export async function refreshGoogleToken(userId: string): Promise<string | null> {
  const tokens = await getDecryptedTokens(userId)
  if (!tokens) return null

  // If token is still valid (more than 5 min remaining), return it
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000)
  if (tokens.expiresAt > fiveMinFromNow) {
    return tokens.accessToken
  }

  // Refresh the token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    console.error("Failed to refresh Google token:", await response.text())
    return null
  }

  const data = await response.json()
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000)

  await storeTokens(
    userId,
    data.access_token,
    tokens.refreshToken, // refresh token doesn't change
    newExpiresAt
  )

  return data.access_token
}

/**
 * Get a valid Google access token for a user, refreshing if needed.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const token = await refreshGoogleToken(userId)
  if (!token) {
    throw new Error("Unable to get valid Google access token. User may need to re-authenticate.")
  }
  return token
}
