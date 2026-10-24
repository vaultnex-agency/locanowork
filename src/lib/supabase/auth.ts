import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client"
import type { UserRole } from "@/types/database"

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone: string
  role: UserRole
  propertyName?: string
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
    const { data: authResult, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role,
          property_name: data.propertyName || null,
        },
      },
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    const roleName = data.role === "pg_owner" ? "PG Owner" : "Student"
    return {
      success: true,
      user: {
        id: authResult.user?.id || "",
        email: authResult.user?.email,
        role: data.role,
      },
      message:
        data.role === "pg_owner"
          ? "PG Owner account registered! A Locano administrator will contact you manually for onboarding. You can now submit your PG details."
          : `Welcome to LOCANO! Your ${roleName} account was successfully created.`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected registration error"
    return {
      success: false,
      message: msg,
    }
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
    const { data: authResult, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        success: false,
        message: error.message,
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
