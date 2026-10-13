"use client"

import React, { useState } from "react"
import { AlertCircle, X, Send } from "lucide-react"

export function EnquiryPreviewButton({ listingName }: { listingName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 px-6 rounded-full bg-[#1f6fe5] hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        <span>Enquire Now (Preview Only)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>INTERFACE DEMONSTRATION</span>
              </div>
              <h3 className="text-xl font-bold text-[#10233f]">
                Preview Enquiry Action
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Property: <span className="font-semibold text-slate-700">{listingName}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>This is a fictional demo listing.</strong> In the production platform, submitting an enquiry will:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>Verify your student phone number</li>
                <li>Generate a unique reference tracking ID</li>
                <li>Unlock the verified property owner’s direct contact and exact map pin</li>
              </ul>
              <p className="text-[11px] text-slate-400 pt-1">
                Real database submission and booking are disabled in this phase.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#10233f] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
