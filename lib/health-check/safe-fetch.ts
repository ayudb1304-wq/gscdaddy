import { lookup } from "dns/promises"
import { isIP } from "net"

/**
 * SSRF guard for the public health-check crawler. Every URL (including each
 * redirect hop) must be http(s) on the default port and resolve only to public
 * IP addresses, so the crawler can't be pointed at localhost, the cloud metadata
 * endpoint (169.254.169.254) or private networks.
 */

const MAX_REDIRECTS = 5
export const MAX_BODY_BYTES = 5 * 1024 * 1024

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

function inCidr(ip: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask)
}

const BLOCKED_V4: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
]

export function isPublicIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) return !BLOCKED_V4.some(([base, bits]) => inCidr(ip, base, bits))
  if (version === 6) {
    const lower = ip.toLowerCase()
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPublicIp(mapped[1])
    if (lower === "::" || lower === "::1") return false
    // fc00::/7 unique local, fe80::/10 link local, ff00::/8 multicast
    if (/^f[cd]/.test(lower) || /^fe[89ab]/.test(lower) || lower.startsWith("ff")) return false
    return true
  }
  return false
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http(s) URLs are allowed")
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("Only ports 80 and 443 are allowed")
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed")

  const host = url.hostname.replace(/^\[|\]$/g, "")
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true })
  if (addresses.length === 0 || !addresses.every((a) => isPublicIp(a.address))) {
    throw new Error("That address isn't publicly reachable")
  }
  return url
}

/** fetch() that validates every redirect hop. The returned Response's `url` is the final URL. */
export async function safeFetch(raw: string, init: RequestInit = {}): Promise<Response> {
  let current = raw
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current)
    const res = await fetch(current, { ...init, redirect: "manual" })
    const location = res.headers.get("location")
    if (res.status >= 300 && res.status < 400 && location) {
      res.body?.cancel().catch(() => {})
      current = new URL(location, current).toString()
      continue
    }
    Object.defineProperty(res, "url", { value: current })
    return res
  }
  throw new Error("Too many redirects")
}

/** Read a response body as text, stopping at MAX_BODY_BYTES. */
export async function readTextCapped(res: Response, maxBytes = MAX_BODY_BYTES): Promise<string> {
  if (!res.body) return ""
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      chunks.push(value.subarray(0, value.byteLength - (total - maxBytes)))
      reader.cancel().catch(() => {})
      break
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString("utf8")
}
