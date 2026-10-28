"use client"

import React, { useState, useEffect } from "react"
import { AlertCircle, X, Send, CheckCircle2, Loader2, Phone, Mail, User } from "lucide-react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

interface EnquiryPreviewButtonProps {
  listingName: string
  listingId?: string
  category?: "accommodation" | "mess"
  buttonText?: string
}

type ModalState = "idle" | "submitting" | "success" | "error"

export function EnquiryPreviewButton({
  listingName,
  listingId,
  category = "accommodation",
  buttonText,
}: EnquiryPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalState, setModalState] = useState<ModalState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  // Form Fields
  const [studentName, setStudentName] = useState("")
  const [studentPhone, setStudentPhone] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const isMess = category === "mess"
  const defaultButtonLabel = isMess ? "Register Interest" : "I'm Interested"

  // Prefill if student is already logged in
  useEffect(() => {
    if (isOpen) {
      const supabase = getSupabaseBrowserClient()
      if (supabase) {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (user) {
            setCurrentUserId(user.id)
            setStudentEmail(user.email || "")
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, phone")
                .eq("id", user.id)
                .single()

              if (profile) {
                if (profile.full_name && !studentName) setStudentName(profile.full_name)
                if (profile.phone && !studentPhone) setStudentPhone(profile.phone)
              }
            } catch {
              // Ignore profile fetch error if offline or new
            }
          }
        })
      }
    }
  }, [isOpen, studentName, studentPhone])

  async function handleSubmitEnquiry(e: React.FormEvent) {
    e.preventDefault()
    setModalState("submitting")
    setErrorMsg("")

    const cleanPhone = studentPhone.trim()
    const cleanEmail = studentEmail.trim().toLowerCase()
    const cleanName = studentName.trim()

    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number so the team can reach you.")
      setModalState("error")
      return
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.")
      setModalState("error")
      return
    }

    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 600))
      setModalState("success")
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setModalState("success")
      return
    }

    const { error } = await supabase.from("admin_notifications").insert({
      notification_type: "enquiry_created",
      user_id: currentUserId,
      listing_id: listingId ?? null,
      title: isMess ? `Mess Enquiry — ${listingName}` : `Accommodation Enquiry — ${listingName}`,
      message: `${cleanName || "A student"} (${cleanPhone}, ${cleanEmail}) expressed interest in "${listingName}" (${category}).`,
      metadata: {
        student_name: cleanName,
        student_phone: cleanPhone,
        student_email: cleanEmail,
        phone: cleanPhone,
        email: cleanEmail,
        listing_name: listingName,
        listing_id: listingId ?? null,
        category,
      },
    })

    if (error) {
      console.error("Enquiry notification error:", error.message)
      setErrorMsg(error.message || "Something went wrong. Please try again.")
      setModalState("error")
      return
    }

    setModalState("success")
  }

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => {
      setModalState("idle")
      setErrorMsg("")
    }, 300)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 px-6 rounded-full bg-[#1f6fe5] hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        <span>{buttonText || defaultButtonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card"
            onClick={(e) => e.stopPropagation()}
          >
            {modalState !== "submitting" && (
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* SUCCESS STATE */}
            {modalState === "success" ? (
              <div className="text-center py-4 space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#10233f]">Enquiry Sent!</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We&apos;ve registered your interest for{" "}
                    <span className="font-semibold text-slate-700">{listingName}</span>.
                    The team will contact you at{" "}
                    <span className="font-semibold text-slate-700">{studentPhone}</span> shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-full bg-[#10233f] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry}>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 mb-2">
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isMess ? "MESS ENQUIRY" : "ACCOMMODATION ENQUIRY"}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#10233f]">Register Your Interest</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isMess ? "Mess: " : "Property: "}
                    <span className="font-semibold text-slate-700">{listingName}</span>
                  </p>
                </div>

                <div className="space-y-3 my-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (Calls / WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="+91 98451 23456"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="rahul.sharma@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <button
                    type="submit"
                    disabled={modalState === "submitting"}
                    className="w-full py-3 rounded-full bg-[#1f6fe5] text-white text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {modalState === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Enquiry…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Enquiry to Property Team</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={modalState === "submitting"}
                    className="w-full py-2.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
