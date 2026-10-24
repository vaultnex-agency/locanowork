import type { Metadata } from "next"
import Link from "next/link"
import { AccountCard } from "@/components/AccountModal"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Student or PG Owner account on LOCANO.",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 locano-card shadow-xl">
          <AccountCard initialMode="signup" />
        </div>
      </div>
    </div>
  )
}
