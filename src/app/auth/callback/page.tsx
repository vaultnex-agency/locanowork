"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get("code")
      const supabase = getSupabaseBrowserClient()

      if (code && supabase) {
        try {
          await supabase.auth.exchangeCodeForSession(code)
        } catch {
          // If code exchange fails or was already exchanged, continue to confirmed page
        }
      }

      // Preserve any query params and redirect to /auth/confirmed
      const queryString = searchParams.toString()
      const target = queryString ? `/auth/confirmed?${queryString}` : "/auth/confirmed"
      router.replace(target)
    }

    handleAuth()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
        <div className="w-10 h-10 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 mt-3">
          Verifying account confirmation...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-4 border-[#1f6fe5] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
