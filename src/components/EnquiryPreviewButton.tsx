"use client"

import React, { useState } from "react"
import { AlertCircle, X, Send, CheckCircle2, Loader2 } from "lucide-react"
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
  const isMess = category === "mess"

  const defaultButtonLabel = isMess
    ? "Register Interest (Preview)"
    : "I'm Interested (Preview)"

  async function handleConfirmInterest() {
    setModalState("submitting")
    setErrorMsg("")

    // If Supabase isn't configured yet, still show success — useful during dev
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 600))
      setModalState("success")
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setModalState("success") // degrade gracefully
      return
    }

    // Check if user is signed in — enquiry needs user_id for the RLS policy
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg("Please sign in first to register your interest.")
      setModalState("error")
      return
    }

    const { error } = await supabase.from("admin_notifications").insert({
      notification_type: "enquiry_created",
      user_id: user.id,
      listing_id: listingId ?? null,
      title: isMess
        ? `Mess Enquiry — ${listingName}`
        : `Accommodation Enquiry — ${listingName}`,
      message: `A student expressed interest in "${listingName}" (${category}).`,
      metadata: {
        listing_name: listingName,
        listing_id: listingId ?? null,
        category,
        student_email: user.email ?? null,
      },
    })

    if (error) {
      console.error("Enquiry notification error:", error.message)
      setErrorMsg("Something went wrong. Please try again.")
      setModalState("error")
      return
    }

    setModalState("success")
  }

  function handleClose() {
    setIsOpen(false)
    // Reset state after animation out
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — hidden while submitting */}
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
                  <h3 className="text-xl font-bold text-[#10233f]">Interest Registered!</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We&apos;ve noted your interest in{" "}
                    <span className="font-semibold text-slate-700">{listingName}</span>.
                    The Locano team will follow up with verified contact details soon.
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
              <>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 mb-3">
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isMess ? "MESS ENQUIRY" : "ACCOMMODATION ENQUIRY"}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#10233f]">Register Your Interest</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMess ? "Mess: " : "Property: "}
                    <span className="font-semibold text-slate-700">{listingName}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>What happens next?</strong> The Locano team will review your
                    interest and share the verified owner contact and exact location.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                    {isMess ? (
                      <>
                        <li>Trial meal pass or subscription details</li>
                        <li>Mess manager&apos;s direct WhatsApp contact</li>
                        <li>Exact map location</li>
                      </>
                    ) : (
                      <>
                        <li>Verified property owner&apos;s direct contact</li>
                        <li>Exact map pin and visit scheduling</li>
                        <li>A unique reference tracking ID</li>
                      </>
                    )}
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Live booking is not yet enabled. This registers your intent with the Locano team.
                  </p>
                </div>

                {/* ERROR MESSAGE */}
                {modalState === "error" && errorMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={handleConfirmInterest}
                    disabled={modalState === "submitting"}
                    className="w-full py-3 rounded-full bg-[#1f6fe5] text-white text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {modalState === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Yes, I&apos;m Interested</span>
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
