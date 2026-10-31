import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client"
import type { UserRole, VendorType } from "@/types/database"

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone: string
  role: UserRole
  vendorType?: VendorType
  propertyName?: string
  businessName?: string
  pgPropertyName?: string
  pgArea?: string
  pgGender?: string
  messName?: string
  messArea?: string
  messCuisine?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email?: string
    role?: UserRole
  } | null
  needsConfig?: boolean
  requiresEmailConfirmation?: boolean
}

export async function signUpUser(data: SignUpData): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      needsConfig: true,
      message:
        "Supabase credentials are not configured. To enable live registration, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database client is currently unavailable.",
    }
  }

  try {
    // 1. Enforce server-side rate limit & registration through API route
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (res.status === 429) {
          const errJson = await res.json().catch(() => ({}))
          return {
            success: false,
            message: errJson.error || "Too many signup attempts. Please try again later.",
          }
        }

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}))
          return {
            success: false,
            message: errJson.error || "Registration failed.",
          }
        }

        const json = await res.json()
        return {
          success: true,
          requiresEmailConfirmation: true,
          user: json.user,
          message: json.message,
        }
      } catch {
        // Fallback to browser client below
      }
    }

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/confirmed`
        : undefined

    const { data: authResult, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role,
          vendor_type: data.vendorType || null,
          property_name: data.pgPropertyName || data.propertyName || data.messName || null,
          business_name: data.businessName || data.propertyName || null,
          pg_property_name: data.pgPropertyName || data.propertyName || null,
          pg_area: data.pgArea || null,
          pg_gender_preference: data.pgGender || "Co-ed",
          mess_name: data.messName || data.businessName || null,
          mess_area: data.messArea || null,
          mess_cuisine: data.messCuisine || null,
        },
      },
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    // In Supabase, if email confirmation is enabled, session is null until user clicks the email link
    const requiresEmailConfirmation = !authResult.session

    return {
      success: true,
      requiresEmailConfirmation,
      user: {
        id: authResult.user?.id || "",
        email: authResult.user?.email || data.email,
        role: data.role,
      },
      message:
        data.role === "vendor"
          ? `Vendor account registered! Please check your email to confirm your account. Your ${data.vendorType === 'food_mess_vendor' ? 'Food/Mess' : 'PG'} vendor application will be reviewed by a Locano administrator.`
          : data.role === "pg_owner"
          ? "PG Owner account registered! Please check your email to confirm your account. A Locano administrator will also contact you manually for onboarding."
          : `Registration successful! We have sent a confirmation link to ${data.email}. You must check your email and click the confirmation link to activate your account before you can sign in.`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected registration error"
    return {
      success: false,
      message: msg,
    }
  }
}

export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return { success: false, message: "Database client is currently unavailable." }
  }

  try {
    const cleanEmail = email.trim().toLowerCase()
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/confirmed`
        : undefined

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: `A fresh confirmation email has been dispatched to ${cleanEmail}. Please check your inbox and Spam folder.`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to resend confirmation email"
    return { success: false, message: msg }
  }
}

export async function signInUser(data: SignInData): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      needsConfig: true,
      message:
        "Supabase credentials are not configured. To enable live login, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return {
      success: false,
      message: "Database client is currently unavailable.",
    }
  }

  try {
    // 1. Enforce server-side rate limit through API route
    if (typeof window !== "undefined") {
      try {
        const rateCheck = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        })

        if (rateCheck.status === 429) {
          const errJson = await rateCheck.json().catch(() => ({}))
          return {
            success: false,
            message: errJson.error || "Too many sign-in attempts. Please try again later.",
          }
        }
      } catch {
        // Fallback to browser client below
      }
    }

    const { data: authResult, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      let friendlyMessage = error.message
      if (error.message.toLowerCase().includes("email not confirmed")) {
        friendlyMessage = "Your email is not confirmed yet. Please check your email inbox (and Spam folder) for the verification link to confirm your account before signing in."
      }
      return {
        success: false,
        message: friendlyMessage,
      }
    }

    // Fetch authoritative role from database profiles table (cannot be overridden by client UI)
    let userRole: UserRole = (authResult.user?.user_metadata?.role as UserRole) || "student"
    if (authResult.user?.id) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authResult.user.id)
          .single()
        if (profile?.role) {
          userRole = profile.role as UserRole
        }
      } catch {
        // Fallback to auth metadata if profile query encounters temporary network issue
      }
    }

    // Securely record login event for admin notifications via security definer RPC
    try {
      await supabase.rpc("log_user_login")
    } catch {
      // Non-blocking for user experience
    }

    return {
      success: true,
      user: {
        id: authResult.user?.id || "",
        email: authResult.user?.email,
        role: userRole,
      },
      message: "Signed in successfully!",
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected login error"
    return {
      success: false,
      message: msg,
    }
  }
}

export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { success: true }

  const { error } = await supabase.auth.signOut()
  return { success: !error, error: error?.message }
}

export async function getCurrentUserProfile() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return null

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.user.id)
    .single()

  return profile || null
}


export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string; needsConfig?: boolean }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      needsConfig: true,
      message:
        "Supabase credentials are not configured. To enable password resets, configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return { success: false, message: "Database client is currently unavailable." }
  }

  try {
    const cleanEmail = email.trim().toLowerCase()
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox and Spam folder.`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to dispatch password reset email"
    return { success: false, message: msg }
  }
}

export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return { success: false, message: "Database client is currently unavailable." }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: "Your password has been successfully updated!",
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update password"
    return { success: false, message: msg }
  }
}
