"use client"

import React, { useState } from "react"
import { useModal } from "@/context/ModalContext"
import Link from "next/link"
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"

const WAITLIST_KEY = "locano.waitlist"

export function AccountCard({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<"phone" | "email">("phone")
  const [countryCode, setCountryCode] = useState("+91")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [googleNotice, setGoogleNotice] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setStatusMessage("")
    setGoogleNotice("")

    // Validate Contact
    let contactKey = ""
    if (mode === "phone") {
      const cleanPhone = phone.trim().replace(/\D/g, "")
      if (!cleanPhone) {
        setError("Please enter your mobile phone number.")
        return
      }
      if (countryCode === "+91") {
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
          return
        }
      } else {
        if (cleanPhone.length < 6) {
          setError("Phone number must have at least 6 digits.")
          return
        }
      }
      contactKey = `${countryCode}${cleanPhone}`
    } else {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError("Please enter a valid email address.")
        return
      }
      contactKey = cleanEmail
    }

    // Validate Password (length at least 8)
    if (password.length < 8) {
      setError("Password length must be at least 8 characters.")
      return
    }

    // Immediately clear password from memory and form
    setPassword("")

    // Save only contact into localStorage
    try {
      const raw = localStorage.getItem(WAITLIST_KEY)
      const list: string[] = raw ? JSON.parse(raw) : []
      if (list.includes(contactKey)) {
        setStatusMessage("Sign-in starts when accounts open. You're already on the waitlist!")
        setIsSuccess(true)
      } else {
        list.push(contactKey)
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(list))
        setStatusMessage("You are on the waitlist! We'll notify you as soon as student accounts open.")
        setIsSuccess(true)
      }
    } catch {
      setStatusMessage("You are on the waitlist!")
      setIsSuccess(true)
    }
  }

  const handleGoogleClick = () => {
    setGoogleNotice("Google sign-in is not connected yet.")
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LOCANO STUDENT ACCOUNT</span>
        </div>
        <h2 className="text-2xl font-bold text-[#10233f]">
          {isSuccess ? "Welcome to LOCANO" : "Join the Waitlist"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Sign-in starts when full student services open. Transport search is always free and open.
        </p>
      </div>

      {statusMessage ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1f6fe5] shrink-0 mt-0.5" />
            <p className="text-sm text-[#10233f] font-medium leading-relaxed">
              {statusMessage}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/transport"
              onClick={onDone}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1f6fe5] text-white font-medium hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20"
            >
              <span>Explore Mangaluru Bus Routes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {googleNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{googleNotice}</span>
            </div>
          )}

          {/* Contact Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                mode === "phone" ? "bg-white text-[#10233f] shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Mobile Phone
            </button>
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                mode === "email" ? "bg-white text-[#10233f] shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Email Address
            </button>
          </div>

          {mode === "phone" ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (AE)</option>
                </select>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Note: Passwords are not saved or sent to any server.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-full bg-[#1f6fe5] text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
          >
            Join Student Waitlist
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-2.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.05 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>
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
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card"
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
