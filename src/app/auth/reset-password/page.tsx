"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { updateUserPassword } from "@/lib/supabase/auth"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isCheckingLink, setIsCheckingLink] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Form states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifyRecoverySession = async () => {
      // 1. Check for error parameters in URL (e.g. expired link)
      const errorParam =
        searchParams.get("error_description") || searchParams.get("error")
      if (errorParam) {
        if (isMounted) {
          setAuthError(errorParam)
          setIsCheckingLink(false)
        }
        return
      }

      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        if (isMounted) {
          setAuthError("Database connection is currently unavailable.")
          setIsCheckingLink(false)
        }
        return
      }

      // 2. If PKCE code is in search parameters, exchange it for session
      const code = searchParams.get("code")
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code)
        } catch {
          // May already be exchanged; proceed to verify session below
        }
      }

      // 3. Check for existing session
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user && isMounted) {
          setHasValidSession(true)
          setUserEmail(sessionData.session.user.email || null)
        }
      } catch {
        // Fallback to authStateChange listener below
      } finally {
        if (isMounted) {
          setIsCheckingLink(false)
        }
      }
    }

    verifyRecoverySession()

    const supabase = getSupabaseBrowserClient()
    const { data: authListener } = supabase?.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN" ||
          session?.user
        ) {
          if (isMounted) {
            setHasValidSession(true)
            if (session?.user?.email) setUserEmail(session.user.email)
            setIsCheckingLink(false)
          }
        }
      }
    ) ?? { data: { subscription: { unsubscribe: () => {} } } }

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await updateUserPassword(newPassword)
      if (res.success) {
        setIsSuccess(true)
      } else {
        setFormError(res.message)
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password."
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl locano-card">
        {/* BRAND BADGE */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LOCANO SECURITY</span>
          </div>
          <h1 className="text-2xl font-bold text-[#10233f]">
            {isSuccess ? "Password Updated" : "Set New Password"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isSuccess
              ? "Your account password has been successfully reset."
              : "Choose a new strong password for your LOCANO account."}
          </p>
          {userEmail && (
            <div className="mt-2.5">
              <span className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {userEmail}
              </span>
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {isCheckingLink && (
          <div className="py-8 space-y-3 text-center">
            <div className="w-10 h-10 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Verifying your password reset link...
            </p>
          </div>
        )}

        {/* ERROR / EXPIRED LINK STATE */}
        {!isCheckingLink && (authError || !hasValidSession) && !isSuccess && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#10233f]">
                Reset Link Expired or Invalid
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {authError ||
                  "This password reset link has expired or has already been used. Please request a new one from the sign-in page."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 rounded-full bg-[#10233f] text-white text-xs sm:text-sm font-bold hover:bg-[#1f6fe5] transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {isSuccess && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs text-left space-y-1">
              <p className="font-bold">Password Reset Complete</p>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                You can now log in securely with your updated password on both student and vendor portals.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-3 rounded-full bg-[#1f6fe5] text-white font-bold text-xs sm:text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In with New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* RESET PASSWORD FORM */}
        {!isCheckingLink && hasValidSession && !isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password <span className="text-slate-400 font-normal">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-full bg-[#1f6fe5] text-white font-bold text-xs sm:text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>

            {/* Cancel / Back Link */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-[#1f6fe5] font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
