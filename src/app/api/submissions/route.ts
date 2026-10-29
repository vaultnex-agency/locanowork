import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    // Rate limiting: max 5 listing submissions per 15 min per IP
    const limit = await checkRateLimit({
      key: `submission:ip:${ip}`,
      windowSeconds: 900,
      maxRequests: 5,
    })

    if (!limit.allowed) {
      return createRateLimitResponse(
        limit.retryAfter,
        `Too many listing submission attempts. Please wait ${Math.ceil(limit.retryAfter / 60)} minutes before trying again.`
      )
    }

    const body = await req.json()
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database service not configured." },
        { status: 503 }
      )
    }

    // Verify session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit listings." },
        { status: 401 }
      )
    }

    // Insert pending listing
    const { data, error } = await supabase
      .from("accommodation_listings")
      .insert({
        ...body,
        owner_id: user.id,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
