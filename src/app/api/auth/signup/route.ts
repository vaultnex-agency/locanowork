import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { UserRole, VendorType } from "@/types/database"

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const body = await req.json()
    const {
      email,
      password,
      fullName,
      phone,
      role = "student",
      vendorType,
      propertyName,
      businessName,
      pgArea,
      pgGender,
      messArea,
      messCuisine,
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    // 1. IP-level rate limiting (max 5 signups per 15 min per IP)
    const ipLimit = await checkRateLimit({
      key: `signup:ip:${ip}`,
      windowSeconds: 900,
      maxRequests: 5,
    })

    if (!ipLimit.allowed) {
      return createRateLimitResponse(
        ipLimit.retryAfter,
        `Too many registration attempts from this network. Please wait ${Math.ceil(ipLimit.retryAfter / 60)} minutes before trying again.`
      )
    }

    // 2. Email-level rate limiting (max 3 attempts per 15 min per email)
    const emailKey = `signup:email:${email.toLowerCase().trim()}`
    const emailLimit = await checkRateLimit({
      key: emailKey,
      windowSeconds: 900,
      maxRequests: 3,
    })

    if (!emailLimit.allowed) {
      return createRateLimitResponse(
        emailLimit.retryAfter,
        `Too many registration attempts for this email address. Please try again later.`
      )
    }

    // 3. Supabase Auth Signup
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database service not configured." },
        { status: 503 }
      )
    }

    const validRole: UserRole = role === "vendor" ? "vendor" : role === "pg_owner" ? "pg_owner" : "student"
    const validVendorType: VendorType | null =
      validRole === "vendor" && (vendorType === "food_mess_vendor" || vendorType === "pg_vendor")
        ? vendorType
        : null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const redirectUrl = `${siteUrl}/auth/callback`

    const { data: authResult, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email.split("@")[0],
          phone: phone || "",
          role: validRole,
          vendor_type: validVendorType,
          property_name: propertyName || null,
          business_name: businessName || null,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authResult.user?.id

    // 4. If vendor, insert initial pending application record
    if (validRole === "vendor" && userId && validVendorType) {
      try {
        await supabase.from("vendor_applications").insert({
          user_id: userId,
          vendor_type: validVendorType,
          status: "pending",
          business_name: businessName || propertyName || fullName || "Vendor Business",
          business_phone: phone || "",
          pg_property_name: validVendorType === "pg_vendor" ? (propertyName || businessName || null) : null,
          pg_area: validVendorType === "pg_vendor" ? (pgArea || null) : null,
          pg_gender_preference: validVendorType === "pg_vendor" ? (pgGender || "Co-ed") : null,
          mess_name: validVendorType === "food_mess_vendor" ? (businessName || propertyName || null) : null,
          mess_area: validVendorType === "food_mess_vendor" ? (messArea || null) : null,
          mess_cuisine: validVendorType === "food_mess_vendor" ? (messCuisine || null) : null,
        })
      } catch (appErr) {
        console.error("Vendor application record creation note:", appErr)
      }
    }

    const message =
      validRole === "vendor"
        ? `Vendor account registered! Please check your email to confirm your account. Your ${validVendorType === "food_mess_vendor" ? "Food/Mess" : "PG"} vendor application will be reviewed by a Locano administrator.`
        : validRole === "pg_owner"
        ? "PG Owner account registered! Please check your email to confirm your account. A Locano administrator will contact you for onboarding."
        : `Registration successful! We have sent a confirmation link to ${email}. Please check your email.`

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email,
          role: validRole,
        },
        message,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
