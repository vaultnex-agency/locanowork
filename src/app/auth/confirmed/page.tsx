"use client"

import React, { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Home, LogIn } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      const errorParam = searchParams.get("error_description") || searchParams.get("error")
      if (errorParam) {
        if (isMounted) {
          setErrorMsg(errorParam)
          setIsVerifying(false)
        }
        return
      }

      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        if (isMounted) setIsVerifying(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user && isMounted) {
          setUserEmail(data.session.user.email || null)
        }
      } catch {
        // Non-blocking
      } finally {
        if (isMounted) {
          setIsVerifying(false)
        }
      }
    }

    checkSession()

    const supabase = getSupabaseBrowserClient()
    const authListener = supabase?.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setUserEmail(session.user.email || null)
      }
      if (isMounted) setIsVerifying(false)
    })

    return () => {
      isMounted = false
      authListener?.data.subscription.unsubscribe()
    }
  }, [searchParams])

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl locano-card text-center">
      {/* BRAND BADGE */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-5">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>EMAIL VERIFICATION</span>
      </div>

      {isVerifying ? (
        <div className="py-8 space-y-3">
          <div className="w-12 h-12 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Confirming your account verification...
          </p>
        </div>
      ) : errorMsg ? (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#10233f]">
              Verification Notice
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {errorMsg}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              What to do next:
            </p>
            <p className="text-[11px] leading-relaxed">
              If you have already confirmed your account previously, you can proceed directly to sign in.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-full bg-[#10233f] text-white text-xs sm:text-sm font-bold hover:bg-[#1f6fe5] transition-colors shadow-md shadow-slate-900/10 inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Sign In</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-[#10233f]">
              Email Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your email has been successfully verified. You can now sign in to your LOCANO account.
            </p>
            {userEmail && (
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {userEmail}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-[#10233f] text-xs">
              Welcome to LOCANO
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your account is ready. Sign in to browse verified student accommodations, book food passes, and connect with trusted PG owners.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-full bg-[#10233f] text-white text-xs sm:text-sm font-bold hover:bg-[#1f6fe5] transition-colors shadow-lg shadow-blue-500/15 inline-flex items-center justify-center gap-2"
            >
              <span>Sign In to LOCANO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Browse PGs without Signing In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
            <div className="w-10 h-10 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500 mt-3">Loading confirmation...</p>
          </div>
        }
      >
        <ConfirmedContent />
      </Suspense>
    </div>
  )
}
