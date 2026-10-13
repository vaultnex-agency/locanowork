import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, Utensils, Bus, Briefcase, PhoneCall, Sparkles, ArrowRight, Clock } from "lucide-react"

interface StudentCard {
  title: string
  desc: string
  tint: string
  accent: string
  icon: React.ReactNode
  href?: string
}

const CARDS: StudentCard[] = [
  {
    title: "Accommodation",
    desc: "Verified PGs and hostels near your college.",
    tint: "#e8f1ff",
    accent: "#1f6fe5",
    icon: <Home className="w-6 h-6" style={{ color: "#1f6fe5" }} />,
    href: "/accommodation",
  },
  {
    title: "Food & Mess",
    desc: "Affordable and reliable food options.",
    tint: "#fff1e8",
    accent: "#f97316",
    icon: <Utensils className="w-6 h-6" style={{ color: "#f97316" }} />,
  },
  {
    title: "Transport",
    desc: "Bus routes, timings and key stops.",
    tint: "#f3e8ff",
    accent: "#7c3aed",
    icon: <Bus className="w-6 h-6" style={{ color: "#7c3aed" }} />,
    href: "/transport",
  },
  {
    title: "Part-time Jobs",
    desc: "Local opportunities for students.",
    tint: "#e9f9ef",
    accent: "#16a34a",
    icon: <Briefcase className="w-6 h-6" style={{ color: "#16a34a" }} />,
  },
  {
    title: "Emergency",
    desc: "Important contacts and quick support.",
    tint: "#ffe8ea",
    accent: "#ef4444",
    icon: <PhoneCall className="w-6 h-6" style={{ color: "#ef4444" }} />,
  },
  {
    title: "More Services",
    desc: "All essential student needs in one place.",
    tint: "#fff6d8",
    accent: "#e0a100",
    icon: <Sparkles className="w-6 h-6" style={{ color: "#e0a100" }} />,
  },
]

export function AboutSection() {
  return (
    <section id="about" className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-white flex flex-col justify-center relative">
      <div className="max-w-6xl mx-auto w-full">
        {/* TOP STORY HEADER & PHOTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5]">
              <span>About</span>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/locano-logo.png"
                alt="Locano Logo"
                width={200}
                height={200}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0"
              />
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-[#10233f] tracking-tight">
                  LOCANO
                </h2>
                <div className="text-xl sm:text-2xl font-bold text-[#1f6fe5]">
                  Settling made simple
                </div>
              </div>
            </div>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-2">
              LOCANO is a student-focused platform that brings together essential services to help you settle, explore and live comfortably in Mangalore.
            </p>
          </div>

          {/* PHOTO ON LARGE SCREENS WITH WHITE CURVE ALONG LEFT EDGE */}
          <div className="hidden lg:block lg:col-span-5 relative h-72 xl:h-80 rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <Image
              src="/about-students.png"
              alt="Mangaluru university students"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            {/* White curved SVG on the left edge */}
            <svg
              className="absolute left-0 top-0 bottom-0 h-full w-14 text-white pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0,0 Q60,50 0,100 L0,0 Z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* CARDS HEADING */}
        <div className="mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#10233f] tracking-tight">
            Everything a Student Needs
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Access city transit now, with more dedicated student facilities coming soon.
          </p>
        </div>

        {/* SIX CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CARDS.map((card) => {
            const cardContent = (
              <div
                className="h-full p-6 rounded-3xl border border-slate-100 locano-card transition-all"
                style={{ backgroundColor: card.tint }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs mb-5">
                  {card.icon}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#10233f]">
                    {card.title}
                  </h4>
                  {card.href ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform"
                      style={{ color: card.accent }}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 text-slate-500">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            )

            if (card.href) {
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="block group locano-card-interactive cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6fe5] touch-manipulation"
                >
                  {cardContent}
                </Link>
              )
            }

            return (
              <div key={card.title} className="cursor-default select-none">
                {cardContent}
              </div>
            )
          })}
        </div>

        {/* COMING SOON BAND */}
        <div className="p-6 rounded-3xl bg-[#f4f7fb] border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#1f6fe5] flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#10233f]">
                Coming Soon: Full Student Settlement Platform
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Hostel verifications, student mess ratings, part-time opportunities and campus helplines are currently in active development.
              </div>
            </div>
          </div>
          <Link
            href="/transport"
            className="px-5 py-2.5 rounded-full bg-[#10233f] text-white hover:bg-[#1f6fe5] text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            Use Bus Directory
          </Link>
        </div>
      </div>
    </section>
  )
}
