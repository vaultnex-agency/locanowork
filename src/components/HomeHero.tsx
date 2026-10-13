"use client"

import React from "react"
import Link from "next/link"
import { Home, Utensils, Bus, ArrowRight, Sparkles } from "lucide-react"

export function HomeHero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-[#d7e7f6] overflow-hidden"
      style={{
        backgroundImage: "url('/hero-coast.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Light gradient overlay to ensure contrast and readability while keeping coast photo visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#d7e7f6]/92 via-[#d7e7f6]/80 to-[#d7e7f6]/95 pointer-events-none" />

      {/* TOP CONTENT: Hero Copy */}
      <div className="relative z-10 max-w-5xl mx-auto w-full pt-6 sm:pt-12 text-center sm:text-left">
        {/* Small label: LOCANO STUDENT PLATFORM */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs mb-6 animate-entrance">
          <span className="w-2 h-2 rounded-full bg-[#1f6fe5] animate-pulse" />
          <span className="text-xs font-bold text-[#1f6fe5] tracking-wider uppercase">
            LOCANO · MANGALURU
          </span>
        </div>

        {/* Approved Hero Message */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#10233f] leading-[1.08] mb-6 animate-entrance">
          <div>Discover transport,</div>
          <div>accommodation and food</div>
          <div className="text-[#1f6fe5]">in one place.</div>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#334b6b] max-w-2xl font-normal leading-relaxed animate-entrance">
          Helping students and newcomers settle, commute, and live comfortably across Mangaluru.
        </p>
      </div>

      {/* LOWER PART OF HERO: Three Service Cards */}
      <div className="relative z-10 max-w-5xl mx-auto w-full mt-10 sm:mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-entrance">
          {/* 1. ACCOMMODATION CARD */}
          <Link
            href="/accommodation"
            className="group block p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1f6fe5] flex items-center justify-center mb-4 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors shadow-2xs">
              <Home className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                Accommodation
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-[#1f6fe5]">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Explore student PGs, hostels, and shared stays near your college campus.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f6fe5] group-hover:translate-x-1 transition-transform">
              <span>Browse PGs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. FOOD & MESS CARD (Prepared destination for future module) */}
          <div className="block p-6 bg-white/85 backdrop-blur-md rounded-3xl border border-white/80 locano-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 shadow-2xs">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-lg font-bold text-[#10233f]">Food &amp; Mess</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Daily meals, monthly mess passes, and reliable student tiffin services.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>In active preparation</span>
            </div>
          </div>

          {/* 3. TRANSPORT CARD */}
          <Link
            href="/transport"
            aria-label="Explore Mangaluru bus transport directory and routes"
            className="group relative block p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 locano-card locano-card-interactive transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 active:scale-[0.99] touch-manipulation"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-4 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors shadow-2xs">
              <Bus className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-lg font-bold text-[#10233f] group-hover:text-[#7c3aed] transition-colors">
                Transport
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/70 text-[#7c3aed]">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Search bus routes, bus numbers, timings, and stop-to-stop rides across Mangaluru.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7c3aed] group-hover:translate-x-1 transition-transform">
              <span>Find Bus Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
