"use client"

import React, { useState } from "react"
import Link from "next/link"
import { LocationSearch } from "./LocationSearch"
import { BusNumberSearch } from "./BusNumberSearch"
import { suggestedJourneys } from "@/data/buses"
import { MapPin, Bus, Compass } from "lucide-react"

export function TransportHero() {
  const [activeTab, setActiveTab] = useState<"location" | "bus">("location")

  return (
    <section
      id="transport-hero"
      className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-[#d7e7f6] overflow-hidden"
      style={{
        backgroundImage: "url('/hero-coast.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Light gradient overlay to ensure contrast and readability while keeping coast photo visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#d7e7f6]/90 via-[#d7e7f6]/75 to-[#d7e7f6]/95 pointer-events-none" />

      {/* TOP CONTENT: Hero Copy */}
      <div className="relative z-10 max-w-5xl mx-auto w-full pt-8 sm:pt-14 text-center sm:text-left">
        {/* Small label: LOCANO TRANSPORT */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs mb-6 animate-entrance">
          <span className="w-2 h-2 rounded-full bg-[#1f6fe5] animate-pulse" />
          <span className="text-xs font-bold text-[#1f6fe5] tracking-wider uppercase">
            LOCANO TRANSPORT
          </span>
        </div>

        {/* Title lines: Find Your Bus. / Reach Anywhere / in Mangaluru. */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#10233f] leading-[1.08] mb-6 animate-entrance">
          <div>Find Your Bus.</div>
          <div>Reach Anywhere</div>
          <div className="text-[#1f6fe5]">in Mangaluru.</div>
        </h1>

        {/* Line under the title */}
        <p className="text-base sm:text-xl text-[#334b6b] max-w-2xl font-normal leading-relaxed animate-entrance">
          Search bus routes, bus numbers and real-time updates in seconds.
        </p>
      </div>

      {/* LOWER PART OF HERO: Search Bar & Suggested Journeys */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mt-10 sm:mt-16">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border border-white/80 locano-card animate-entrance">
          {/* TAB SELECTOR */}
          <div className="flex p-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 mb-5 max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "location"
                  ? "bg-white text-[#1f6fe5] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>By Route Stops</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bus")}
              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "bus"
                  ? "bg-white text-[#1f6fe5] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Bus Number</span>
            </button>
          </div>

          {activeTab === "location" ? (
            <LocationSearch showRecents={true} />
          ) : (
            <BusNumberSearch />
          )}
        </div>

        {/* POPULAR / SUGGESTED JOURNEYS */}
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
          <span className="text-slate-600 font-semibold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#1f6fe5]" />
            <span>Popular student rides:</span>
          </span>
          {suggestedJourneys.slice(0, 4).map((item) => (
            <Link
              key={`${item.fromId}-${item.toId}`}
              href={`/transport/route/${item.fromId}-to-${item.toId}`}
              className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 text-[#10233f] hover:text-[#1f6fe5] transition-all shadow-2xs font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
