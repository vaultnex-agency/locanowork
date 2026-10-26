"use client"

import React, { useRef } from "react"
import Link from "next/link"
import {
  GraduationCap,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

interface CampusHub {
  name: string
  subtitle: string
  area: string
  tag: string
  badgeBg: string
  pgCount: string
  messCount: string
}

const CAMPUS_HUBS: CampusHub[] = [
  {
    name: "NITK Surathkal",
    subtitle: "National Institute of Technology",
    area: "Surathkal",
    tag: "Engineering & Tech",
    badgeBg: "bg-blue-50 text-[#1f6fe5] border-blue-200/60",
    pgCount: "15+ PGs",
    messCount: "10+ Messes",
  },
  {
    name: "Yenepoya University",
    subtitle: "Medical, Dental & Allied Sciences",
    area: "Deralakatte",
    tag: "Medical Hub",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    pgCount: "25+ PGs",
    messCount: "18+ Messes",
  },
  {
    name: "KSHEMA / Nitte",
    subtitle: "K.S. Hegde Medical Academy",
    area: "Deralakatte",
    tag: "Health Sciences",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
    pgCount: "20+ PGs",
    messCount: "14+ Messes",
  },
  {
    name: "Father Muller",
    subtitle: "Medical & Nursing College",
    area: "Kankanady",
    tag: "Healthcare",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/60",
    pgCount: "18+ PGs",
    messCount: "12+ Messes",
  },
  {
    name: "St. Aloysius University",
    subtitle: "Autonomous Multi-Disciplinary",
    area: "Hampankatta",
    tag: "Central Campus",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200/60",
    pgCount: "16+ PGs",
    messCount: "15+ Messes",
  },
  {
    name: "Sahyadri College",
    subtitle: "College of Engineering & Mgmt",
    area: "Padil",
    tag: "Tech & Innovation",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200/60",
    pgCount: "14+ PGs",
    messCount: "9+ Messes",
  },
  {
    name: "Balmatta Student Zone",
    subtitle: "Coaching Centers & City Colleges",
    area: "Balmatta",
    tag: "Student Center",
    badgeBg: "bg-orange-50 text-[#ea580c] border-orange-200/60",
    pgCount: "22+ PGs",
    messCount: "16+ Messes",
  },
  {
    name: "Kadri & Mallikatte",
    subtitle: "Near Hospitals & IT corridor",
    area: "Kadri",
    tag: "Residential Zone",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    pgCount: "15+ PGs",
    messCount: "11+ Messes",
  },
]

export function HomeScroller() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const offset = direction === "left" ? -340 : 340
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  return (
    <section className="relative pt-10 sm:pt-14 pb-12 sm:pb-16 bg-white overflow-hidden border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#1f6fe5] bg-blue-50 border border-blue-100 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus &amp; Locality Hubs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233f] tracking-tight">
              Mangaluru Student Campuses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Tap any college or neighborhood to instantly view verified student PGs and daily home-style food near your campus.
            </p>
          </div>

          {/* Navigation Arrows for desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SNAP SCROLLER */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 pb-3 pt-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {CAMPUS_HUBS.map((hub, idx) => (
          <div
            key={idx}
            className="shrink-0 w-[280px] sm:w-[310px] bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between"
            style={{ scrollSnapAlign: "start" }}
          >
            <div>
              {/* Card Header: Tag & Pin */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${hub.badgeBg}`}>
                  {hub.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <MapPin className="w-3 h-3 text-[#1f6fe5]" />
                  <span>{hub.area}</span>
                </span>
              </div>

              {/* Institution Title */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#10233f] leading-snug line-clamp-1">
                    {hub.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {hub.subtitle}
                  </p>
                </div>
              </div>

              {/* Availability Counters */}
              <div className="flex items-center gap-2 mt-3.5 mb-4 text-[11px] font-semibold text-slate-600">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {hub.pgCount}
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                  {hub.messCount}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                href={`/accommodation?search=${encodeURIComponent(hub.area)}`}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-[#1f6fe5] text-[#1f6fe5] hover:text-white text-[11.5px] font-bold transition-colors text-center"
              >
                <span>Find PGs</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Link
                href={`/mess?search=${encodeURIComponent(hub.area)}`}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-orange-50 hover:bg-[#ea580c] text-[#ea580c] hover:text-white text-[11.5px] font-bold transition-colors text-center"
              >
                <span>Find Mess</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
