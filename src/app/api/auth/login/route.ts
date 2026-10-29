import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    // 1. IP rate limiting (max 10 login attempts per 15 min per IP)
    const ipLimit = await checkRateLimit({
      key: `login:ip:${ip}`,
      windowSeconds: 900,
      maxRequests: 10,
    })

    if (!ipLimit.allowed) {
      return createRateLimitResponse(
        ipLimit.retryAfter,
        `Too many login attempts from this network. Please wait ${Math.ceil(ipLimit.retryAfter / 60)} minutes before trying again.`
      )
    }

    // 2. Email rate limiting (max 5 failed attempts per 15 min per email)
    const emailKey = `login:email:${email.toLowerCase().trim()}`
    const emailLimit = await checkRateLimit({
      key: emailKey,
      windowSeconds: 900,
      maxRequests: 5,
    })

    if (!emailLimit.allowed) {
      return createRateLimitResponse(
        emailLimit.retryAfter,
        `Too many sign-in attempts for this account. Please wait ${Math.ceil(emailLimit.retryAfter / 60)} minutes before trying again.`
      )
    }

    // 3. Supabase Auth Sign In
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database service not configured." },
        { status: 503 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // 4. Fetch profile to get role
    let role = "student"
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profile?.role) {
        role = profile.role
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
      message: "Sign in successful.",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
