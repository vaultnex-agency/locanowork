"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { mockMesses, DEMO_DISCLAIMER_TEXT } from "@/data/mock-messes"
import type { DietaryType, ServiceType } from "@/types/mess"
import {
  Utensils,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react"

type FilterDietary = "All" | DietaryType
type FilterService = "All" | ServiceType

export default function MessListingPage() {
  const [dietaryFilter, setDietaryFilter] = useState<FilterDietary>("All")
  const [serviceFilter, setServiceFilter] = useState<FilterService>("All")
  const [selectedArea, setSelectedArea] = useState<string>("All Areas")

  const areas = useMemo(() => {
    const list = Array.from(new Set(mockMesses.map((item) => item.area)))
    return ["All Areas", ...list]
  }, [])

  const filteredListings = useMemo(() => {
    return mockMesses.filter((item) => {
      if (dietaryFilter !== "All" && item.dietary !== dietaryFilter) return false
      if (serviceFilter !== "All" && item.serviceType !== serviceFilter) return false
      if (selectedArea !== "All Areas" && item.area !== selectedArea) return false
      return true
    })
  }, [dietaryFilter, serviceFilter, selectedArea])

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* TOP DEMO DISCLAIMER BANNER */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 locano-card shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Preview Notice:</span> {DEMO_DISCLAIMER_TEXT}
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="p-6 sm:p-10 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-[#ea580c] uppercase tracking-wider mb-3">
              <Utensils className="w-3.5 h-3.5" />
              <span>LOCANO Food &amp; Mess</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#10233f] tracking-tight">
              Student Messes &amp; Tiffin in Mangaluru
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
              Find nutritious student dining halls, monthly meal subscriptions, and reliable doorstep tiffin services across college hubs in Mangaluru.
            </p>
          </div>

          {/* FILTER CONTROLS */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            {/* DIETARY FILTER */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Diet:</span>
              </span>
              {(["All", "Pure Veg", "Veg & Non-Veg"] as FilterDietary[]).map((diet) => (
                <button
                  key={diet}
                  onClick={() => setDietaryFilter(diet)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    dietaryFilter === diet
                      ? "bg-[#ea580c] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {diet === "All" ? "All Diets" : diet}
                </button>
              ))}
            </div>

            {/* SERVICE & AREA FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Service &amp; Area:</span>
              </span>
              {(["All", "Dine-in Mess", "Tiffin & Delivery", "Dine-in & Delivery"] as FilterService[]).map((service) => (
                <button
                  key={service}
                  onClick={() => setServiceFilter(service)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    serviceFilter === service
                      ? "bg-[#10233f] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {service === "All" ? "All Services" : service}
                </button>
              ))}

              <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  aria-label="Filter messes by Mangaluru area"
                  className="w-full sm:w-auto px-4 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ea580c] cursor-pointer"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* LISTINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const dietaryBadgeClass =
              listing.dietary === "Pure Veg"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                : "bg-amber-50 text-amber-800 border-amber-200/70"

            return (
              <div
                key={listing.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 locano-card locano-card-interactive flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* CARD IMAGE */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                    <Image
                      src={listing.sampleImage}
                      alt={listing.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md bg-white/90 ${dietaryBadgeClass}`}
                      >
                        {listing.dietary}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                        {listing.serviceType}
                      </span>
                    </div>
                  </div>

                  {/* CUISINE & MEALS SERVED */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-[#ea580c]">{listing.cuisine}</span>
                    <span className="text-slate-400">
                      {listing.mealsServed.join(" · ")}
                    </span>
                  </div>

                  {/* NAME & TAGLINE */}
                  <h2 className="text-xl font-bold text-[#10233f] group-hover:text-[#ea580c] transition-colors leading-snug">
                    {listing.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {listing.tagline}
                  </p>

                  {/* LOCATION & LANDMARK */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                    <span className="font-semibold text-slate-700">{listing.area}</span>
                    <span className="text-slate-400">· {listing.nearestLandmark}</span>
                  </div>

                  {/* HIGHLIGHT PILLS */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {listing.highlights.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                    {listing.highlights.length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-50 text-slate-400">
                        +{listing.highlights.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER: PRICE & DETAIL LINK */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Monthly Pass From
                    </div>
                    <div className="text-lg font-extrabold text-[#10233f]">
                      ₹{listing.monthlyPriceFrom.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-500"> /mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Single meal: ₹{listing.perMealPriceFrom}
                    </div>
                  </div>

                  <Link
                    href={`/mess/${listing.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#10233f] text-white hover:bg-[#ea580c] text-xs font-semibold transition-colors shadow-xs group-hover:bg-[#ea580c]"
                  >
                    <span>View Menu</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredListings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 locano-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">
              No mess providers match your filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your dietary preference, service type, or area selection to view more available demo listings.
            </p>
            <button
              onClick={() => {
                setDietaryFilter("All")
                setServiceFilter("All")
                setSelectedArea("All Areas")
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#ea580c] text-white text-xs font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
