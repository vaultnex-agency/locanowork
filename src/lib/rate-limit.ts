import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "./supabase/server"

export interface RateLimitOptions {
  key: string
  windowSeconds?: number
  maxRequests?: number
}

export interface RateLimitResult {
  allowed: boolean
  count: number
  limit: number
  remaining: number
  retryAfter: number
}

// In-memory fallback cache for environments where Supabase RPC is unavailable or in unit tests
const fallbackStore = new Map<string, { count: number; windowStart: number }>()

export async function checkRateLimit({
  key,
  windowSeconds = 900, // 15 minutes default
  maxRequests = 10,
}: RateLimitOptions): Promise<RateLimitResult> {
  // 1. Attempt persistent Supabase check_rate_limit RPC call
  try {
    const supabase = await getSupabaseServerClient()
    if (supabase) {
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_window_seconds: windowSeconds,
        p_max_requests: maxRequests,
      })

      if (!error && data && typeof data === "object") {
        const res = data as Record<string, unknown>
        return {
          allowed: Boolean(res.allowed),
          count: Number(res.count ?? 1),
          limit: Number(res.limit ?? maxRequests),
          remaining: Number(res.remaining ?? 0),
          retryAfter: Number(res.retry_after ?? 0),
        }
      }
    }
  } catch {
    // If Supabase call fails or migration not applied, proceed to fallback
  }

  // 2. Persistent fallback sliding-window counter
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = fallbackStore.get(key)

  if (!record || now - record.windowStart >= windowMs) {
    fallbackStore.set(key, { count: 1, windowStart: now })
    return {
      allowed: true,
      count: 1,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - 1),
      retryAfter: 0,
    }
  }

  record.count += 1
  const allowed = record.count <= maxRequests
  const retryAfter = allowed ? 0 : Math.ceil((record.windowStart + windowMs - now) / 1000)

  return {
    allowed,
    count: record.count,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    retryAfter: Math.max(0, retryAfter),
  }
}

export function resetRateLimit(key: string): void {
  fallbackStore.delete(key)
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  const cfIp = req.headers.get("cf-connecting-ip")
  if (cfIp) {
    return cfIp.trim()
  }
  return "127.0.0.1"
}

export function createRateLimitResponse(
  retryAfter: number,
  customMessage?: string
): NextResponse {
  const retryMinutes = Math.ceil(retryAfter / 60)
  const message =
    customMessage ||
    `Too many requests. Please wait ${retryMinutes > 1 ? `${retryMinutes} minutes` : `${retryAfter} seconds`} before trying again.`

  return NextResponse.json(
    {
      error: message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfter)),
        "X-RateLimit-Remaining": "0",
      },
    }
  )
}
