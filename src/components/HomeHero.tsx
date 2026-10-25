"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useModal } from "@/context/ModalContext"
import {
  parseSearchQuery,
  getLiveSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/search/query-parser"
import {
  Search,
  ArrowRight,
  Home,
  Utensils,
  Bus,
  Siren,
  ChevronRight,
  Star,
  MapPin,
  Check,
  X,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Four Service Cards – strictly preserving existing routes          */
/* ------------------------------------------------------------------ */
const services = [
  {
    title: "Accommodation",
    subtitle: "PGs, Hostels & Flats",
    href: "/accommodation",
    icon: Home,
    iconBg: "bg-blue-50 text-[#1f6fe5] border-blue-100",
  },
  {
    title: "Food & Mess",
    subtitle: "Mess, Hotels & Cafes",
    href: "/mess",
    icon: Utensils,
    iconBg: "bg-orange-50 text-[#ea580c] border-orange-100",
  },
  {
    title: "Transport",
    subtitle: "Routes, Timings & Stops",
    href: "/transport",
    icon: Bus,
    iconBg: "bg-purple-50 text-[#7c3aed] border-purple-100",
  },
  {
    title: "Essential Services",
    subtitle: "Nearby Help & Services",
    href: "/emergency",
    icon: Siren,
    iconBg: "bg-rose-50 text-[#e11d48] border-rose-100",
  },
] as const

const badges = [
  {
    label: "100+ Verified PGs",
    icon: (
      <div className="w-4 h-4 rounded bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-xs">
        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
      </div>
    ),
  },
  {
    label: "Zero Brokerage",
    icon: <Star className="w-4 h-4 text-[#fbbf24] fill-[#fbbf24] shrink-0" />,
  },
  {
    label: "Settling is Simple",
    icon: <MapPin className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8] shrink-0" />,
  },
  {
    label: "Safe & Secure",
    icon: (
      <div className="w-4 h-4 rounded-full bg-[#0284c7] flex items-center justify-center text-white shrink-0 shadow-xs">
        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
      </div>
    ),
  },
] as const

/* ================================================================== */
/*  HomeHero – Exactly matching the reference image                   */
/* ================================================================== */
export function HomeHero() {
  const router = useRouter()
  const { openSearch } = useModal()

  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Derived suggestions computed directly during render
  const suggestions: SearchSuggestion[] =
    query.trim().length >= 2 ? getLiveSearchSuggestions(query) : []

  // Dismiss suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      openSearch("location")
      return
    }

    const parsed = parseSearchQuery(query)
    setIsOpen(false)
    router.push(parsed.targetUrl)
  }

  const handleSelectSuggestion = (url: string) => {
    setIsOpen(false)
    router.push(url)
  }

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900"
      style={{
        backgroundImage: "url('/hero-sunset.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      {/* Cinematic dark sunset gradient overlay for crystal clear contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10, 20, 45, 0.40) 0%, rgba(10, 20, 45, 0.22) 35%, rgba(10, 20, 45, 0.38) 100%)",
        }}
      />

      {/* Warm ambient center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(255, 180, 80, 0.12) 0%, transparent 60%)",
        }}
      />

      {/* MAIN HERO CONTENT */}
      <div className="relative z-30 max-w-5xl mx-auto w-full flex flex-col items-center justify-center text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-[68px] lg:text-[76px] font-black tracking-tight leading-[1.06] drop-shadow-md mb-3.5 sm:mb-4">
          <span className="text-white block drop-shadow-lg">Settling</span>
          <span className="text-[#56caf8] block mt-1 sm:mt-1.5 drop-shadow-lg">Made Simple.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/95 text-xs sm:text-base md:text-[17px] font-medium max-w-xl sm:max-w-2xl mx-auto leading-relaxed drop-shadow-md mb-4 sm:mb-5 px-2">
          Discover verified student PGs in Mangalore with real-time availability, zero brokerage, and direct landlord booking.
        </p>

        {/* Badges / Pill Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-7 sm:mb-8 text-xs sm:text-[13.5px] font-medium text-white px-2">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 drop-shadow-md"
            >
              {badge.icon}
              <span className="text-white drop-shadow-sm">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Universal Search Bar */}
        <div ref={containerRef} className="relative max-w-3xl w-full mx-auto mb-5 sm:mb-6 z-30">
          <form
            onSubmit={handleSearchSubmit}
            className="group relative flex items-center w-full bg-white/95 backdrop-blur-md rounded-full shadow-2xl hover:shadow-3xl border border-white/80 p-1.5 sm:p-2 pl-4 sm:pl-6 transition-all"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search bus number, area, PG, mess, or service..."
              className="flex-1 bg-transparent text-xs sm:text-[15px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
              autoComplete="off"
              aria-label="Universal search"
            />

            {/* Clear input button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setIsOpen(false)
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Blue Pill Submit Button */}
            <button
              type="submit"
              className="ml-2 shrink-0 inline-flex items-center gap-1.5 sm:gap-2 bg-[#1f6fe5] hover:bg-[#1856b8] text-white text-xs sm:text-sm font-semibold px-4 sm:px-7 py-2 sm:py-2.5 rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>

          {/* Autocomplete / Live Suggestions Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl p-2 sm:p-2.5 space-y-1 animate-entrance z-50 max-h-[70vh] sm:max-h-[420px] overflow-y-auto text-left">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Suggestions
              </div>
              {suggestions.map((s, idx) => {
                const Icon =
                  s.category === "mess"
                    ? Utensils
                    : s.category === "transport"
                    ? Bus
                    : s.category === "emergency"
                    ? Siren
                    : Home

                const iconColor =
                  s.category === "mess"
                    ? "text-[#ea580c] bg-orange-50"
                    : s.category === "transport"
                    ? "text-[#7c3aed] bg-purple-50"
                    : s.category === "emergency"
                    ? "text-[#e11d48] bg-rose-50"
                    : "text-[#1f6fe5] bg-blue-50"

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s.url)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors truncate">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {s.subtitle}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1f6fe5] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Four Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl w-full mx-auto">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 shadow-lg shadow-black/5 hover:shadow-2xl hover:-translate-y-0.5 hover:bg-white transition-all p-3 sm:p-3.5 text-left cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full ${s.iconBg} border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-slate-900 group-hover:text-[#1f6fe5] transition-colors leading-snug">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5 truncate">
                    {s.subtitle}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-[#1f6fe5] group-hover:translate-x-0.5 transition-all ml-1" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

