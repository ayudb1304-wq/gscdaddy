import { timingSafeEqual } from "crypto"

/**
 * Constant-time check of an `Authorization: Bearer <secret>` header.
 * Fails closed: if the secret env var is unset, nothing is authorized
 * (previously an unset secret made "Bearer undefined" a valid header).
 */
export function isAuthorizedBearer(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || !authHeader) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(authHeader)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
