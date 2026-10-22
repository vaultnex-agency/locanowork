"use client"

import React from "react"
import Link from "next/link"
import { Home, Utensils, Bus, Siren, ArrowRight } from "lucide-react"

export function HomeHero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-[#d7e7f6] overflow-hidden"
      style={{
        backgroundImage: "url('/hero-coast.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Light coastal gradient overlay ensuring high contrast while keeping coastal road and bus visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#dceaf7]/85 via-[#d7e7f6]/75 to-[#d7e7f6]/92 pointer-events-none" />

      {/* TOP CONTAINER */}
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Top left badge aligned with navbar height */}
        <div className="pt-2 sm:pt-3 mb-6 sm:mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#1f6fe5]" />
            <span className="text-[11px] sm:text-xs font-bold text-[#1f6fe5] tracking-wider uppercase">
              LOCANO · MANGALURU
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="max-w-4xl text-left">
          {/* Tagline */}
          <div className="text-xs sm:text-sm font-bold text-[#1f6fe5] tracking-wider uppercase mb-2 sm:mb-3">
            YOUR CITY. OUR GUIDE.
          </div>

          {/* Main Headline (3 lines matching reference) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[66px] font-extrabold tracking-tight text-[#10233f] leading-[1.1] mb-4 sm:mb-5">
            <div>Discover transport,</div>
            <div className="sm:whitespace-nowrap">accommodation and food</div>
            <div className="text-[#1f6fe5]">in one place.</div>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#334b6b] max-w-2xl font-normal leading-relaxed">
            Helping students and newcomers settle, commute, and live comfortably across Mangaluru.
          </p>
        </div>
      </div>

      {/* LOWER PART OF HERO: Three Service Cards */}
      <div className="relative z-10 max-w-6xl mx-auto w-full mt-8 sm:mt-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. ACCOMMODATION CARD */}
          <Link
            href="/accommodation"
            className="group block p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all shadow-md shadow-blue-950/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1f6fe5] flex items-center justify-center mb-5 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors shadow-2xs">
              <Home className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                Accommodation
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#e0efff] text-[#1f6fe5]">
                Available
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6">
              Explore student PGs, hostels, and shared stays near your college campus.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f6fe5] group-hover:translate-x-1 transition-transform">
              <span>Browse PGs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. FOOD & MESS CARD */}
          <Link
            href="/mess"
            aria-label="Explore Mangaluru student food and mess directory"
            className="group block p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all shadow-md shadow-blue-950/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mb-5 group-hover:bg-[#ea580c] group-hover:text-white transition-colors shadow-2xs">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#ea580c] transition-colors">
                Food &amp; Mess
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#c2410c]">
                Available
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6">
              Daily meals, monthly mess passes, and reliable student tiffin services.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] group-hover:translate-x-1 transition-transform">
              <span>Browse Messes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 3. TRANSPORT CARD */}
          <Link
            href="/transport"
            aria-label="Explore Mangaluru bus transport directory and routes"
            className="group relative block p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 active:scale-[0.99] touch-manipulation shadow-md shadow-blue-950/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-5 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors shadow-2xs">
              <Bus className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#7c3aed] transition-colors">
                Transport
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ede9fe] text-[#7c3aed]">
                Active
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6">
              Search bus routes, bus numbers, timings, and stop-to-stop rides across Mangaluru.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7c3aed] group-hover:translate-x-1 transition-transform">
              <span>Find Bus Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 4. EMERGENCY SERVICES CARD */}
          <Link
            href="/emergency"
            aria-label="View emergency services for Mangaluru"
            className="group block p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all shadow-md shadow-blue-950/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#dc2626] flex items-center justify-center mb-5 group-hover:bg-[#dc2626] group-hover:text-white transition-colors shadow-2xs">
              <Siren className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#dc2626] transition-colors">
                Emergency Services
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#dc2626]">
                Essential
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6">
              Find essential police, ambulance, fire, and women&apos;s helpline information.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc2626] group-hover:translate-x-1 transition-transform">
              <span>View Emergency Help</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

