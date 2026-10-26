"use client"

import React from "react"
import Link from "next/link"
import {
  Home,
  Utensils,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

export function SettlementJourney() {
  return (
    <section id="journey" className="scroll-mt-20 sm:scroll-mt-24 relative py-16 sm:py-24 bg-[#f8fafc] border-b border-slate-100 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#1f6fe5] bg-blue-50 border border-blue-100 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOW LOCANO WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#10233f] tracking-tight leading-[1.15]">
            Settling in Mangaluru <br className="hidden sm:inline" />
            <span className="text-[#1f6fe5]">in 3 Simple Steps.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            From stepping off the train to moving into your PG and locking your first meal pass — no broker hassles, no hidden charges.
          </p>
        </div>

        {/* 3 Storytelling Cards Centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch">
          {/* STEP 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="w-9 h-9 rounded-full bg-blue-100 text-[#1f6fe5] font-black text-sm flex items-center justify-center">
                  01
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1f6fe5] border border-blue-100 uppercase tracking-wider">
                  <Home className="w-3 h-3" />
                  <span>Student Stays</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#10233f] mb-2.5 leading-snug">
                Discover Verified PGs &amp; Hostels
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6">
                Search verified residences within walking distance of NITK, Yenepoya, KSHEMA, Aloysius, and Father Muller. Compare room sharing, monthly rent, and real photo galleries.
              </p>
              <ul className="space-y-2.5 mb-6 text-xs sm:text-[12.5px] text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real photos with zero stock images</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Wi-Fi, power backup &amp; study desks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Boys, Girls &amp; Co-ed listings</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/accommodation"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1f6fe5] hover:text-[#1856b8] transition-colors group"
              >
                <span>Browse Student PGs</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="w-9 h-9 rounded-full bg-orange-100 text-[#ea580c] font-black text-sm flex items-center justify-center">
                  02
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#ea580c] border border-orange-100 uppercase tracking-wider">
                  <Utensils className="w-3 h-3" />
                  <span>Food &amp; Mess</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#10233f] mb-2.5 leading-snug">
                Lock Daily Thalis &amp; Mess Passes
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6">
                Stop worrying about unhealthy eating out. Browse hygienic student messes, unlimited South &amp; North Indian thalis, and doorstep tiffin delivery services.
              </p>
              <ul className="space-y-2.5 mb-6 text-xs sm:text-[12.5px] text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Monthly passes with student pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pure Veg &amp; Veg/Non-Veg hygienic meals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Doorstep tiffin delivery to your stay</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/mess"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#ea580c] hover:text-orange-700 transition-colors group"
              >
                <span>Browse Student Messes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="w-9 h-9 rounded-full bg-slate-200 text-[#10233f] font-black text-sm flex items-center justify-center">
                  03
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#10233f] border border-slate-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Zero Brokerage</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#10233f] mb-2.5 leading-snug">
                Direct Landlord Connect &amp; ₹0 Fees
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6">
                Cut out the middlemen taking 1 month rent as commission. Connect directly via WhatsApp or phone call with verified owners, visit the property, and move in safely.
              </p>
              <ul className="space-y-2.5 mb-6 text-xs sm:text-[12.5px] text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Save ₹5,000 to ₹10,000 on broker fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct WhatsApp contact &amp; visit setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Transparent agreements &amp; protection</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/accommodation"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#10233f] hover:text-[#1f6fe5] transition-colors group"
              >
                <span>Find Your Space Today</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
