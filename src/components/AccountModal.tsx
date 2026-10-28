"use client"

import React, { useState } from "react"
import { useModal } from "@/context/ModalContext"
import Link from "next/link"
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  Info,
  Lock,
  Mail,
  MailCheck,
  RefreshCw,
  Phone,
  User,
} from "lucide-react"
import { signUpUser, signInUser, resendConfirmationEmail, AuthResponse } from "@/lib/supabase/auth"
import type { UserRole } from "@/types/database"

interface AccountCardProps {
  initialMode?: "signin" | "signup"
  initialRole?: "student" | "pg_owner"
  onDone?: () => void
}

export function AccountCard({
  initialMode = "signin",
  initialRole = "student",
  onDone,
}: AccountCardProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode)
  const [role, setRole] = useState<UserRole>(initialRole)

  // Form Fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [propertyName, setPropertyName] = useState("")

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [infoNotice, setInfoNotice] = useState("")
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setError("")
    setInfoNotice("")
  }

  const handleModeChange = (newMode: "signin" | "signup") => {
    setAuthMode(newMode)
    setError("")
    setInfoNotice("")
    setAuthResult(null)
    setResendStatus(null)
  }

  const handleResendConfirmation = async () => {
    const targetEmail = authResult?.user?.email || email.trim()
    if (!targetEmail) return
    setIsResending(true)
    setResendStatus(null)
    try {
      const res = await resendConfirmationEmail(targetEmail)
      setResendStatus(res.message)
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfoNotice("")
    setAuthResult(null)

    // Validation
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    let cleanPhone = ""
    if (authMode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name.")
        return
      }

      cleanPhone = phone.trim().replace(/\D/g, "")
      if (!cleanPhone) {
        setError("Please enter your mobile phone number.")
        return
      }

      if (countryCode === "+91") {
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          setError("Please enter a valid 10-digit Indian mobile number.")
          return
        }
      } else if (cleanPhone.length < 6) {
        setError("Please enter a valid phone number.")
        return
      }
    }

    setIsLoading(true)

    try {
      if (authMode === "signup") {
        const fullPhoneNumber = `${countryCode} ${cleanPhone}`
        const res = await signUpUser({
          email: cleanEmail,
          password,
          fullName: fullName.trim(),
          phone: fullPhoneNumber,
          role,
          propertyName: role === "pg_owner" ? propertyName.trim() : undefined,
        })
        setAuthResult(res)
        if (!res.success && !res.needsConfig) {
          setError(res.message)
        }
      } else {
        const res = await signInUser({
          email: cleanEmail,
          password,
        })
        setAuthResult(res)
        if (res.success && res.user?.role) {
          // Immediately align UI with the authoritative database role
          setRole(res.user.role)
        }
        if (!res.success && !res.needsConfig) {
          setError(res.message)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isPgOwner = role === "pg_owner"

  return (
    <div className="w-full">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LOCANO AUTHENTICATION</span>
        </div>
        <h2 className="text-2xl font-bold text-[#10233f]">
          {authMode === "signin" ? "Sign In to LOCANO" : "Create an Account"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {authMode === "signin"
            ? "Access student housing, food passes, and owner dashboard."
            : "Select whether you are a Student or a PG Property Owner."}
        </p>
      </div>

      {/* SIGN IN / SIGN UP MODE TABS */}
      <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-600 mb-5">
        <button
          type="button"
          onClick={() => handleModeChange("signin")}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            authMode === "signin"
              ? "bg-white text-[#10233f] shadow-xs font-bold"
              : "hover:text-slate-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("signup")}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            authMode === "signup"
              ? "bg-white text-[#10233f] shadow-xs font-bold"
              : "hover:text-slate-900"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* ACCOUNT ROLE SELECTOR (STUDENT vs PG OWNER) */}
      <div className="mb-5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Select Account Option
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              role === "student"
                ? "border-[#1f6fe5] bg-blue-50/70 text-[#10233f] shadow-xs ring-1 ring-[#1f6fe5]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-lg ${
                  role === "student" ? "bg-[#1f6fe5] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Student</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Looking for PGs, mess &amp; transit
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("pg_owner")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              role === "pg_owner"
                ? "border-[#1f6fe5] bg-blue-50/70 text-[#10233f] shadow-xs ring-1 ring-[#1f6fe5]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-lg ${
                  role === "pg_owner" ? "bg-[#1f6fe5] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">PG Owner</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              List &amp; manage accommodations
            </p>
          </button>
        </div>
      </div>

      {/* EMAIL CONFIRMATION NOTICE IN REGISTER NOW AREA */}
      {authMode === "signup" && !authResult?.success && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200/90 text-blue-950 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#1f6fe5] text-white shrink-0 mt-0.5 shadow-xs">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#10233f] text-xs flex items-center gap-1.5">
                <span>Email Confirmation Required</span>
                <span className="text-[10px] font-semibold bg-blue-100 text-[#1f6fe5] px-1.5 py-0.5 rounded-full">
                  Important
                </span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                After you submit your registration, <strong className="text-[#10233f] font-semibold">you must check your mail inbox to confirm your account</strong> before you can sign in properly. A verification link will be sent to your email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PG OWNER NOTICE */}
      {isPgOwner && authMode === "signup" && !authResult?.success && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Admin Verification Notice:</span> After registering, a Locano admin will manually contact you. Submitted property listings remain pending until admin review and approval.
          </div>
        </div>
      )}

      {/* SUCCESS / FEEDBACK BANNER */}
      {authResult?.success && (
        authResult.requiresEmailConfirmation ? (
          <div className="space-y-4 mb-4 p-6 rounded-3xl bg-gradient-to-b from-blue-50/90 to-indigo-50/50 border border-blue-200 text-center shadow-xs animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-[#1f6fe5] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
              <MailCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#10233f]">
                Check Your Mail to Confirm
              </h3>
              <p className="text-xs text-slate-600">
                We have sent an account activation link to:
              </p>
              <div className="inline-block px-3.5 py-1 bg-white rounded-full border border-blue-200 text-xs font-bold text-[#1f6fe5] break-all shadow-2xs">
                {authResult.user?.email || email}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/95 border border-blue-100 text-left text-xs space-y-2">
              <p className="font-bold text-[#10233f] text-[11px] uppercase tracking-wider">
                Follow These Steps to Sign In:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                <li>Open your email inbox (and check <span className="font-medium text-slate-800">Spam or Promotions</span> if you don&apos;t see it within 2 minutes).</li>
                <li>Click the <span className="font-semibold text-[#1f6fe5]">“Confirm your email”</span> verification link.</li>
                <li>Once confirmed, return here and sign in with your email and password.</li>
              </ol>
            </div>

            {resendStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {resendStatus}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin")
                  setAuthResult(null)
                  setResendStatus(null)
                }}
                className="w-full py-3 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>I Confirmed My Email — Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isResending}
                onClick={handleResendConfirmation}
                className="w-full py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Resending Link..." : "Didn't receive email? Resend link"}</span>
              </button>
            </div>

            {isPgOwner && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-left">
                <span className="font-bold">Note for PG Owners:</span> A Locano admin will also contact you manually for property verification and onboarding.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-900">Success</p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {authResult.message}
                </p>
              </div>
            </div>

            {isPgOwner ? (
              <Link
                href="/pg-owner/submit"
                onClick={onDone}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors"
              >
                <span>Go to PG Listing Submission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onDone}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors cursor-pointer"
              >
                <span>Continue to LOCANO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      )}

      {/* CONFIGURATION / DEVELOPMENT NOTICE (NO FAKE SUCCESS) */}
      {authResult?.needsConfig && (
        <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#10233f] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#1f6fe5]">
            <Info className="w-4 h-4" />
            <span>Form Inputs Validated</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {authResult.message}
          </p>
          <div className="pt-1 text-[11px] text-slate-500 font-mono bg-white p-2 rounded-xl border border-slate-200">
            NEXT_PUBLIC_SUPABASE_URL<br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoNotice && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{infoNotice}</span>
        </div>
      )}

      {/* FORM */}
      {(!authResult || (!authResult.success && !authResult.needsConfig)) && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name (Sign Up only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={isPgOwner ? "e.g. Ramesh Bhat" : "e.g. Rohan Kamath"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={isPgOwner ? "owner@property.com" : "student@college.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
              />
            </div>
            {authMode === "signup" && (
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#1f6fe5] shrink-0" />
                <span>We&apos;ll send a verification link to this email to activate your account.</span>
              </p>
            )}
          </div>

          {/* Phone Number (Sign Up only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-2.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (AE)</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional PG/Property Name for PG Owners on Sign Up */}
          {authMode === "signup" && isPgOwner && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property or PG Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Greenfield Boys PG"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password {authMode === "signup" && <span className="text-slate-400 font-normal">(min. 8 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
              />
            </div>
          </div>

          {/* Email Confirmation Reminder before submitting */}
          {authMode === "signup" && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#1f6fe5] shrink-0" />
              <span>
                You will need to verify the email sent to your inbox before you can sign in.
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-full bg-[#1f6fe5] text-white font-bold text-xs sm:text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <span>
                {authMode === "signin"
                  ? `Sign In as ${isPgOwner ? "PG Owner" : "Student"}`
                  : `Register as ${isPgOwner ? "PG Owner" : "Student"}`}
              </span>
            )}
          </button>
        </form>
      )}

      {/* BOTTOM LINK */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          {authMode === "signin" ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button
          type="button"
          onClick={() => handleModeChange(authMode === "signin" ? "signup" : "signin")}
          className="text-[#1f6fe5] font-semibold hover:underline cursor-pointer"
        >
          {authMode === "signin" ? "Register now" : "Sign in here"}
        </button>
      </div>

      {/* PG OWNER SUBMIT LINK BANNER */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <Link
          href="/pg-owner/submit"
          onClick={onDone}
          className="text-xs font-medium text-slate-500 hover:text-[#1f6fe5] transition-colors inline-flex items-center gap-1"
        >
          <span>PG Owner? Submit your accommodation listing</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export function AccountModal() {
  const { isAccountOpen, closeAccount } = useModal()

  if (!isAccountOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAccount}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <AccountCard onDone={closeAccount} />
      </div>
    </div>
  )
}
