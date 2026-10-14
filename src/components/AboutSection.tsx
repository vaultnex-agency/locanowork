import React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Route, ArrowUpRight, ArrowRight, Megaphone } from "lucide-react"

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#f4f8fe] to-[#f4f8fe] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* TOP ABOUT SECTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN: Narrative & 3 Informational Points */}
          <div className="lg:col-span-7">
            {/* Category tag */}
            <div className="text-xs font-bold text-[#1f6fe5] tracking-wider uppercase mb-3">
              ABOUT LOCANO
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#10233f] tracking-tight leading-[1.12] mb-6">
              <div>A new city.</div>
              <div className="text-[#1f6fe5]">A simpler start.</div>
            </h2>

            {/* Subtext description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mb-10">
              Moving to Mangaluru for college should be exciting, not confusing. LOCANO helps students and newcomers discover the essentials of city life, starting with the bus routes that connect them to where they need to go.
            </p>

            {/* Three Informational Points */}
            <div className="space-y-6 sm:space-y-7">
              {/* Point 1 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-[#1f6fe5] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#10233f]">
                    Made for Mangaluru
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Local information designed around the needs of students and newcomers.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-[#1f6fe5] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#10233f]">
                    Less searching, more exploring
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Find useful transport information in one accessible place.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#10233f] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#10233f]">
                    Built to grow with students
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    A broader student-settlement platform, with more services planned for the future.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Link below points */}
            <div className="mt-10">
              <Link
                href="/transport"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1f6fe5] hover:gap-2.5 transition-all group"
              >
                <span>Explore Mangaluru with LOCANO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Coastal Card with Script Text & Decorative Shape */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Subtle decorative curved shape peeking behind right edge */}
            <div
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-72 sm:w-84 h-72 sm:h-84 rounded-full bg-[#e1eefc]/70 blur-2xl -z-10 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-48 sm:w-60 h-80 sm:h-96 rounded-r-full bg-[#e8f1fc]/50 -z-10 pointer-events-none hidden sm:block"
              aria-hidden="true"
            />

            {/* The Coastal Road Card with "Same city. New beginnings." */}
            <div className="relative rounded-[28px] overflow-hidden shadow-xl border border-slate-100 max-w-[390px] w-full locano-card transition-transform duration-300 hover:scale-[1.01]">
              <Image
                src="/about-coast.png"
                alt="Same city. New beginnings. Mangaluru coast"
                width={389}
                height={430}
                className="w-full h-auto object-cover block"
                priority
              />
            </div>
          </div>
        </div>

        {/* BOTTOM CTA BANNER: Built for students. Made for Mangaluru. */}
        <div className="mt-16 sm:mt-24 p-6 sm:p-8 rounded-3xl bg-[#eaf3fe] border border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-14 h-14 rounded-full bg-white text-[#1f6fe5] flex items-center justify-center shadow-xs shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#10233f]">
                Built for students. Made for Mangaluru.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Find what you need, when you need it.
              </p>
            </div>
          </div>
          <Link
            href="/transport"
            className="px-6 py-3 rounded-full bg-[#10233f] text-white hover:bg-[#1f6fe5] transition-colors text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs shrink-0"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

