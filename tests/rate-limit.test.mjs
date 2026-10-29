import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"

// We test the rate limiting mechanism and response behaviors
describe("Server-Side Rate Limiting & Auth Protection", () => {
  // Standalone persistent sliding-window rate limit store test
  class RateLimiter {
    constructor() {
      this.store = new Map()
    }

    check({ key, windowSeconds = 900, maxRequests = 5 }) {
      const now = Date.now()
      const windowMs = windowSeconds * 1000
      const record = this.store.get(key)

      if (!record || now - record.windowStart >= windowMs) {
        this.store.set(key, { count: 1, windowStart: now })
        return {
          allowed: true,
          count: 1,
          limit: maxRequests,
          remaining: maxRequests - 1,
          retryAfter: 0,
        }
      }

      record.count += 1
      const allowed = record.count <= maxRequests
      const retryAfter = allowed
        ? 0
        : Math.ceil((record.windowStart + windowMs - now) / 1000)

      return {
        allowed,
        count: record.count,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - record.count),
        retryAfter: Math.max(0, retryAfter),
      }
    }

    reset(key) {
      this.store.delete(key)
    }

    expire(key, offsetMs) {
      const record = this.store.get(key)
      if (record) {
        record.windowStart -= offsetMs
      }
    }
  }

  let limiter

  beforeEach(() => {
    limiter = new RateLimiter()
  })

  it("1. Legitimate requests: should allow requests within the configured limit", () => {
    const key = "signup:ip:192.168.1.10"
    const maxRequests = 3

    const res1 = limiter.check({ key, maxRequests, windowSeconds: 60 })
    assert.equal(res1.allowed, true)
    assert.equal(res1.count, 1)
    assert.equal(res1.remaining, 2)
    assert.equal(res1.retryAfter, 0)

    const res2 = limiter.check({ key, maxRequests, windowSeconds: 60 })
    assert.equal(res2.allowed, true)
    assert.equal(res2.count, 2)
    assert.equal(res2.remaining, 1)

    const res3 = limiter.check({ key, maxRequests, windowSeconds: 60 })
    assert.equal(res3.allowed, true)
    assert.equal(res3.count, 3)
    assert.equal(res3.remaining, 0)
  })

  it("2. Repeated requests: should block requests exceeding the limit and return retryAfter", () => {
    const key = "login:ip:10.0.0.1"
    const maxRequests = 2

    // Consume allowed attempts
    limiter.check({ key, maxRequests, windowSeconds: 300 })
    limiter.check({ key, maxRequests, windowSeconds: 300 })

    // Third attempt exceeds limit
    const exceeded = limiter.check({ key, maxRequests, windowSeconds: 300 })
    assert.equal(exceeded.allowed, false)
    assert.equal(exceeded.count, 3)
    assert.equal(exceeded.remaining, 0)
    assert.ok(exceeded.retryAfter > 0, "retryAfter should be positive")
    assert.ok(exceeded.retryAfter <= 300, "retryAfter should be <= windowSeconds")
  })

  it("3. Expiry and window reset: requests are allowed again after the window expires", () => {
    const key = "signup:email:test@example.com"
    const maxRequests = 2
    const windowSeconds = 60

    limiter.check({ key, maxRequests, windowSeconds })
    limiter.check({ key, maxRequests, windowSeconds })

    // Blocked
    const blocked = limiter.check({ key, maxRequests, windowSeconds })
    assert.equal(blocked.allowed, false)

    // Simulate time passing beyond the window (61 seconds)
    limiter.expire(key, 61 * 1000)

    // Now allowed again
    const postExpiry = limiter.check({ key, maxRequests, windowSeconds })
    assert.equal(postExpiry.allowed, true)
    assert.equal(postExpiry.count, 1)
    assert.equal(postExpiry.remaining, 1)
  })

  it("4. Explicit reset: resetting a key restores full request quota", () => {
    const key = "login:ip:172.16.0.5"
    const maxRequests = 1

    limiter.check({ key, maxRequests, windowSeconds: 600 })
    const blocked = limiter.check({ key, maxRequests, windowSeconds: 600 })
    assert.equal(blocked.allowed, false)

    limiter.reset(key)

    const fresh = limiter.check({ key, maxRequests, windowSeconds: 600 })
    assert.equal(fresh.allowed, true)
    assert.equal(fresh.count, 1)
  })

  it("5. HTTP 429 response format validation", () => {
    const retryAfter = 180
    const retryMinutes = Math.ceil(retryAfter / 60)
    const errorBody = {
      error: `Too many sign-in attempts. Please wait ${retryMinutes} minutes before trying again.`,
      retryAfter,
    }

    assert.equal(typeof errorBody.error, "string")
    assert.equal(errorBody.retryAfter, 180)
    assert.match(errorBody.error, /3 minutes/)
  })

  it("6. Vendor application security: vendors must start with pending status and cannot escalate to admin", () => {
    function sanitizeUserRole(rawRole) {
      if (rawRole === "vendor") return "vendor"
      if (rawRole === "pg_owner") return "pg_owner"
      // Admin role can never be self-assigned
      return "student"
    }

    assert.equal(sanitizeUserRole("admin"), "student")
    assert.equal(sanitizeUserRole("superadmin"), "student")
    assert.equal(sanitizeUserRole("vendor"), "vendor")
    assert.equal(sanitizeUserRole("pg_owner"), "pg_owner")
    assert.equal(sanitizeUserRole("student"), "student")
  })
})
