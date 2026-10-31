"use client"

import React, { useState } from "react"
import { useModal } from "@/context/ModalContext"
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Building2,
  Utensils,
  Info,
  Lock,
  Mail,
  MailCheck,
  RefreshCw,
  Phone,
  User,
  Store,
  KeyRound,
} from "lucide-react"
import {
  signUpUser,
  signInUser,
  resendConfirmationEmail,
  sendPasswordResetEmail,
  AuthResponse,
} from "@/lib/supabase/auth"
import type { UserRole, VendorType } from "@/types/database"

interface AccountCardProps {
  initialMode?: "signin" | "signup" | "forgot"
  initialRole?: "student" | "vendor"
  onDone?: () => void
}

export function AccountCard({
  initialMode = "signin",
  initialRole = "student",
  onDone,
}: AccountCardProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(initialMode)
  const [role, setRole] = useState<UserRole>(initialRole)
  const [vendorType, setVendorType] = useState<VendorType>("pg_vendor")

  // Form Fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")

  // PG Vendor fields
  const [pgPropertyName, setPgPropertyName] = useState("")
  const [pgArea, setPgArea] = useState("")
  const [pgGender, setPgGender] = useState("Boys")

  // Food/Mess Vendor fields
  const [messName, setMessName] = useState("")
  const [messArea, setMessArea] = useState("")
  const [messCuisine, setMessCuisine] = useState("")

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [infoNotice, setInfoNotice] = useState("")
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  // Forgot Password state
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotResendStatus, setForgotResendStatus] = useState<string | null>(null)

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setError("")
    setInfoNotice("")
  }

  const handleModeChange = (newMode: "signin" | "signup" | "forgot") => {
    setAuthMode(newMode)
    setError("")
    setInfoNotice("")
    setAuthResult(null)
    setResendStatus(null)
    setForgotSent(false)
    setForgotResendStatus(null)
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfoNotice("")
    setForgotResendStatus(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    try {
      const res = await sendPasswordResetEmail(cleanEmail)
      if (res.success) {
        setForgotSent(true)
      } else {
        setError(res.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return
    setIsResending(true)
    setForgotResendStatus(null)
    try {
      const res = await sendPasswordResetEmail(cleanEmail)
      setForgotResendStatus(res.message)
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

      // Vendor-specific validation
      if (role === "vendor") {
        if (!businessName.trim()) {
          setError("Please enter your business name.")
          return
        }
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
          vendorType: role === "vendor" ? vendorType : undefined,
          businessName: role === "vendor" ? businessName.trim() : undefined,
          propertyName: role === "vendor" ? (isPgVendor ? pgPropertyName.trim() : messName.trim()) : undefined,
          pgPropertyName: role === "vendor" && isPgVendor ? pgPropertyName.trim() : undefined,
          pgArea: role === "vendor" && isPgVendor ? pgArea.trim() : undefined,
          pgGender: role === "vendor" && isPgVendor ? pgGender : undefined,
          messName: role === "vendor" && isFoodVendor ? messName.trim() : undefined,
          messArea: role === "vendor" && isFoodVendor ? messArea.trim() : undefined,
          messCuisine: role === "vendor" && isFoodVendor ? messCuisine.trim() : undefined,
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

  const isVendor = role === "vendor"
  const isPgVendor = isVendor && vendorType === "pg_vendor"
  const isFoodVendor = isVendor && vendorType === "food_mess_vendor"

  const getRoleLabel = () => {
    if (role === "vendor") {
      return vendorType === "food_mess_vendor" ? "Food/Mess Vendor" : "PG Vendor"
    }
    return "Student"
  }

  return (
    <div className="w-full">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-2.5">
          {authMode === "forgot" ? (
            <>
              <KeyRound className="w-3.5 h-3.5" />
              <span>LOCANO PASSWORD RECOVERY</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LOCANO AUTHENTICATION</span>
            </>
          )}
        </div>
        <h2 className="text-2xl font-bold text-[#10233f]">
          {authMode === "forgot"
            ? "Reset Your Password"
            : authMode === "signin"
            ? "Sign In to LOCANO"
            : "Create an Account"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {authMode === "forgot"
            ? `Enter the email associated with your ${role === "vendor" ? "vendor" : "student"} account and we'll send you a password reset link.`
            : authMode === "signin"
            ? "Access student housing, food passes, and vendor dashboard."
            : "Select whether you are a Student or a Vendor."}
        </p>
      </div>

      {/* SIGN IN / SIGN UP MODE TABS */}
      {authMode === "forgot" ? (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => handleModeChange("signin")}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1f6fe5] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      ) : (
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
      )}

      {/* ACCOUNT ROLE SELECTOR (STUDENT vs VENDOR) */}
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
            onClick={() => handleRoleChange("vendor")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              role === "vendor"
                ? "border-[#1f6fe5] bg-blue-50/70 text-[#10233f] shadow-xs ring-1 ring-[#1f6fe5]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-lg ${
                  role === "vendor" ? "bg-[#1f6fe5] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Store className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Vendor</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              List PG or mess services
            </p>
          </button>
        </div>
      </div>

      {/* VENDOR TYPE SELECTOR (PG Vendor vs Food/Mess Vendor) */}
      {isVendor && authMode === "signup" && !authResult?.success && (
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Vendor Type
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setVendorType("pg_vendor")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                vendorType === "pg_vendor"
                  ? "border-[#1f6fe5] bg-blue-50/70 text-[#10233f] shadow-xs ring-1 ring-[#1f6fe5]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`p-1.5 rounded-lg ${
                    vendorType === "pg_vendor"
                      ? "bg-[#1f6fe5] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">PG / Hostel</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                List accommodations &amp; rooms
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVendorType("food_mess_vendor")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                vendorType === "food_mess_vendor"
                  ? "border-[#1f6fe5] bg-blue-50/70 text-[#10233f] shadow-xs ring-1 ring-[#1f6fe5]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`p-1.5 rounded-lg ${
                    vendorType === "food_mess_vendor"
                      ? "bg-[#1f6fe5] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Food / Mess</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Sell monthly meal passes
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ADMIN VERIFICATION NOTICE */}
      {isVendor && authMode === "signup" && !authResult?.success && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Admin Verification Notice:</span> After registering, a Locano admin will review your vendor application. You cannot publish listings until your application is approved.
          </div>
        </div>
      )}

      {/* SUCCESS / FEEDBACK BANNER FOR SIGNUP/SIGNIN */}
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
                <li>Click the <span className="font-semibold text-[#1f6fe5]">&ldquo;Confirm your email&rdquo;</span> verification link.</li>
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

            {isVendor && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-left">
                <span className="font-bold">Note for Vendors:</span> A Locano admin will review your application after email confirmation. You will be notified once approved.
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

            <button
              type="button"
              onClick={onDone}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors cursor-pointer"
            >
              <span>Continue to LOCANO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )
      )}

      {/* CONFIGURATION / DEVELOPMENT NOTICE */}
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

      {/* FORGOT PASSWORD VIEW */}
      {authMode === "forgot" ? (
        forgotSent ? (
          <div className="space-y-4 mb-4 p-6 rounded-3xl bg-gradient-to-b from-blue-50/90 to-indigo-50/50 border border-blue-200 text-center shadow-xs animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-[#1f6fe5] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
              <MailCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#10233f]">
                Check Your Email
              </h3>
              <p className="text-xs text-slate-600">
                We have sent a password reset link to:
              </p>
              <div className="inline-block px-3.5 py-1 bg-white rounded-full border border-blue-200 text-xs font-bold text-[#1f6fe5] break-all shadow-2xs">
                {email.trim()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/95 border border-blue-100 text-left text-xs space-y-2">
              <p className="font-bold text-[#10233f] text-[11px] uppercase tracking-wider">
                Follow These Steps:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                <li>Check your inbox (and <span className="font-medium text-slate-800">Spam/Promotions</span> folder).</li>
                <li>Click the <span className="font-semibold text-[#1f6fe5]">&ldquo;Reset Password&rdquo;</span> link.</li>
                <li>Enter your new password and sign in.</li>
              </ol>
            </div>

            {forgotResendStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {forgotResendStatus}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className="w-full py-3 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isResending}
                onClick={handleResendForgotPassword}
                className="w-full py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Resending Link..." : "Didn't receive email? Resend link"}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={isVendor ? "vendor@business.com" : "student@college.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#1f6fe5] shrink-0" />
                <span>We will send a secure password reset link to this email address.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-full bg-[#1f6fe5] text-white font-bold text-xs sm:text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className="text-xs text-slate-500 hover:text-[#1f6fe5] font-semibold transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )
      ) : (
        /* STANDARD SIGN IN / SIGN UP FORM */
        (!authResult || (!authResult.success && !authResult.needsConfig)) && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {infoNotice && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{infoNotice}</span>
              </div>
            )}

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
                    placeholder={isVendor ? "e.g. Ramesh Bhat" : "e.g. Rohan Kamath"}
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
                  placeholder={isVendor ? "vendor@business.com" : "student@college.edu"}
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

            {/* Vendor Business Name (Sign Up, Vendor only) */}
            {authMode === "signup" && isVendor && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isPgVendor ? "e.g. Greenfield PG Properties" : "e.g. Amma's Kitchen Mess"}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
              </div>
            )}

            {/* PG Vendor specific fields */}
            {authMode === "signup" && isPgVendor && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property / PG Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Greenfield Boys PG"
                    value={pgPropertyName}
                    onChange={(e) => setPgPropertyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Area <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kadri"
                      value={pgArea}
                      onChange={(e) => setPgArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PG Type <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={pgGender}
                      onChange={(e) => setPgGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    >
                      <option value="Boys">Boys PG</option>
                      <option value="Girls">Girls PG</option>
                      <option value="Co-ed">Co-ed PG</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Food/Mess Vendor specific fields */}
            {authMode === "signup" && isFoodVendor && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mess / Kitchen Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amma's Mess & Tiffin"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Area <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Balmatta"
                      value={messArea}
                      onChange={(e) => setMessArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cuisine <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. South Indian"
                      value={messCuisine}
                      onChange={(e) => setMessCuisine(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                </div>
              </>
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
                    ? `Sign In as ${getRoleLabel()}`
                    : `Register as ${getRoleLabel()}`}
                </span>
              )}
            </button>

            {/* Forgot Password Link - Only shown in signin mode */}
            {authMode === "signin" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("forgot")}
                  className="text-xs text-slate-500 hover:text-[#1f6fe5] hover:underline font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        )
      )}

      {/* BOTTOM LINK */}
      {authMode === "forgot" ? (
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500 gap-1.5">
          <span>Remembered your password?</span>
          <button
            type="button"
            onClick={() => handleModeChange("signin")}
            className="text-[#1f6fe5] font-semibold hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </div>
      ) : (
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
      )}
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
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <AccountCard onDone={closeAccount} />
      </div>
    </div>
  )
}
