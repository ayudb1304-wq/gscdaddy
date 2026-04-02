/**
 * Simple token bucket rate limiter for GSC API calls.
 * GSC allows 20 QPS — this ensures we stay under that.
 */
export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number // tokens per ms

  constructor(requestsPerSecond: number = 20) {
    this.maxTokens = requestsPerSecond
    this.tokens = requestsPerSecond
    this.lastRefill = Date.now()
    this.refillRate = requestsPerSecond / 1000
  }

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }

  async waitForSlot(): Promise<void> {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }
    const waitMs = Math.ceil((1 - this.tokens) / this.refillRate)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens -= 1
  }
}
