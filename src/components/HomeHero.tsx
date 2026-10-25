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
  MapPin,
  Search,
  ArrowRight,
  Home,
  Utensils,
  Bus,
  Siren,
  ChevronRight,
  Users,
  Landmark,
  ShieldCheck,
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
    iconBg: "bg-blue-50",
    iconColor: "text-[#1f6fe5]",
  },
  {
    title: "Food & Mess",
    subtitle: "Mess, Hotels & Cafes",
    href: "/mess",
    icon: Utensils,
    iconBg: "bg-orange-50",
    iconColor: "text-[#ea580c]",
  },
  {
    title: "Transport",
    subtitle: "Routes, Timings & Stops",
    href: "/transport",
    icon: Bus,
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
  },
  {
    title: "Essential Services",
    subtitle: "Nearby Help & Services",
    href: "/emergency",
    icon: Siren,
    iconBg: "bg-rose-50",
    iconColor: "text-[#e11d48]",
  },
] as const

/* ------------------------------------------------------------------ */
/*  Bottom info strip – matching visual structure of hero.jpeg         */
/*  Note: Unverified numeric claims (100K+, 200+) are omitted per     */
/*  strict instruction; verified platform descriptors are used.       */
/* ------------------------------------------------------------------ */
const stats = [
  {
    icon: Users,
    title: "Students",
    subtitle: "Students in Mangaluru",
    iconBg: "bg-blue-100/80",
    iconColor: "text-[#1f6fe5]",
  },
  {
    icon: Landmark,
    title: "Colleges",
    subtitle: "Colleges & Institutions",
    iconBg: "bg-sky-100/80",
    iconColor: "text-[#0284c7]",
  },
  {
    icon: MapPin,
    title: "City-wide",
    subtitle: "Coverage Area",
    iconBg: "bg-purple-100/80",
    iconColor: "text-[#7c3aed]",
  },
  {
    icon: ShieldCheck,
    title: "Verified",
    subtitle: "Student Friendly Information",
    iconBg: "bg-emerald-100/80",
    iconColor: "text-[#059669]",
  },
] as const

/* ================================================================== */
/*  HomeHero – Pixel-accurate to reference hero.jpeg                  */
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
      className="relative min-h-[calc(100vh-20px)] lg:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 lg:pt-24 pb-3 sm:pb-5 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        backgroundImage: "url('/hero-coast.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Coastal Mangaluru sunny gradient overlay: opaque on left for readability, clear on right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.90) 36%, rgba(255,255,255,0.52) 58%, rgba(255,255,255,0.12) 78%, transparent 100%)",
        }}
      />
      {/* Warm sunlight glow from top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, rgba(255, 237, 213, 0.45) 0%, transparent 45%)",
        }}
      />

      {/* TOP & MIDDLE HERO CONTENT */}
      <div className="relative z-30 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center py-2 sm:py-3">
        {/* Location Badge: 📍 MANGALURU | Your City. Our Guide. */}
        <div className="mb-3 sm:mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#1f6fe5] tracking-wide">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f6fe5]" />
            <span className="font-bold tracking-wider">MANGALURU</span>
            <span className="text-slate-300 mx-1">|</span>
            <span className="font-medium text-slate-600">Your City. Our Guide.</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[56px] font-extrabold leading-[1.12] tracking-tight text-[#10233f] max-w-2xl mb-3 sm:mb-4">
          Your Student Life{" "}
          <br />
          in Mangaluru,{" "}
          <br />
          <span className="text-[#1f6fe5]">Simplified.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-[16.5px] text-[#4e637f] max-w-xl leading-relaxed mb-5 sm:mb-6 font-normal">
          Find accommodation, food, transport, and essential services —
          everything you need to settle, commute, and live comfortably.
        </p>

        {/* Interactive Search Bar centered horizontally */}
        <div ref={containerRef} className="relative max-w-2xl lg:max-w-3xl w-full mx-auto mb-3.5 sm:mb-4 z-30">
          <form
            onSubmit={handleSearchSubmit}
            className="group relative flex items-center w-full bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 shadow-lg shadow-slate-900/[0.06] hover:border-slate-300 focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-[#1f6fe5]/20 transition-all px-4 sm:px-5 py-2 sm:py-2.5"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search bus number, area, PG, mess, or service…"
              className="flex-1 bg-transparent text-xs sm:text-[14.5px] text-[#10233f] placeholder:text-slate-400 focus:outline-none min-w-0"
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

            {/* Submit button matching reference */}
            <button
              type="submit"
              className="ml-2 shrink-0 inline-flex items-center gap-1.5 bg-[#1f6fe5] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#1856b8] transition-colors shadow-xs cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Autocomplete / Live Suggestions Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl p-2 sm:p-2.5 space-y-1 animate-entrance z-50 max-h-[70vh] sm:max-h-[420px] overflow-y-auto">
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

        {/* Four Service Cards centered horizontally */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 max-w-5xl w-full mx-auto">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 shadow-md shadow-slate-900/[0.04] p-3 sm:p-3.5 hover:shadow-lg hover:-translate-y-0.5 hover:bg-white transition-all cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-[#10233f] leading-snug group-hover:text-[#1f6fe5] transition-colors">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {s.subtitle}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-[#1f6fe5] group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* BOTTOM STATISTICS STRIP – Centered matching reference width and spacing */}
      <div className="relative z-10 max-w-6xl xl:max-w-7xl mx-auto w-full mt-3 sm:mt-5 mb-1 sm:mb-2">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-full border border-white/80 shadow-lg shadow-slate-900/[0.04] px-4 sm:px-8 py-3 sm:py-3.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-200/70">
            {stats.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="flex items-center justify-start sm:justify-center gap-3 sm:gap-3.5 lg:px-4"
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-[15px] font-extrabold text-[#10233f] leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10.5px] sm:text-[11.5px] text-slate-500 leading-tight mt-0.5 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
