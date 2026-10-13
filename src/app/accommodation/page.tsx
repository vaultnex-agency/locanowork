"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { mockAccommodations, DEMO_DISCLAIMER_TEXT } from "@/data/mock-pgs"
import type { GenderPreference, AccommodationType } from "@/types/accommodation"
import {
  Home,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Filter,
  AlertCircle,
  Users,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react"

type FilterGender = "All" | GenderPreference
type FilterType = "All" | AccommodationType

export default function AccommodationPage() {
  const [genderFilter, setGenderFilter] = useState<FilterGender>("All")
  const [typeFilter, setTypeFilter] = useState<FilterType>("All")
  const [selectedArea, setSelectedArea] = useState<string>("All Areas")

  const areas = useMemo(() => {
    const list = Array.from(new Set(mockAccommodations.map((item) => item.area)))
    return ["All Areas", ...list]
  }, [])

  const filteredListings = useMemo(() => {
    return mockAccommodations.filter((item) => {
      if (genderFilter !== "All" && item.gender !== genderFilter) return false
      if (typeFilter !== "All" && item.type !== typeFilter) return false
      if (selectedArea !== "All Areas" && item.area !== selectedArea) return false
      return true
    })
  }, [genderFilter, typeFilter, selectedArea])

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
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#1f6fe5] uppercase tracking-wider mb-3">
              <Home className="w-3.5 h-3.5" />
              <span>LOCANO Accommodation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#10233f] tracking-tight">
              Student PGs & Living in Mangaluru
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
              Explore student residences, verified PGs, and shared accommodations across major student hubs in Mangaluru.
            </p>
          </div>

          {/* FILTER CONTROLS */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#1f6fe5]" />
                <span>Gender:</span>
              </span>
              {(["All", "Boys", "Girls", "Co-ed"] as FilterGender[]).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    genderFilter === gender
                      ? "bg-[#1f6fe5] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {gender === "All" ? "All Genders" : gender}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1f6fe5]" />
                <span>Type & Area:</span>
              </span>
              {(["All", "PG", "Hostel", "Shared Apartment"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    typeFilter === type
                      ? "bg-[#10233f] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {type === "All" ? "All Types" : type}
                </button>
              ))}

              <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
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

        {/* LISTING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const genderBadgeClass =
              listing.gender === "Girls"
                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                : listing.gender === "Boys"
                ? "bg-blue-50 text-blue-700 border-blue-200/60"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/60"

            return (
              <div
                key={listing.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 locano-card locano-card-interactive flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* CARD HEADER TAGS */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${genderBadgeClass}`}
                    >
                      {listing.gender}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {listing.type}
                    </span>
                  </div>

                  {/* PROPERTY NAME & TAGLINE */}
                  <h2 className="text-xl font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors leading-snug">
                    {listing.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {listing.tagline}
                  </p>

                  {/* LOCATION & LANDMARK */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#1f6fe5] shrink-0" />
                    <span className="font-semibold text-slate-700">{listing.area}</span>
                    <span className="text-slate-400">· {listing.nearestLandmark}</span>
                  </div>

                  {/* AMENITIES PILLS */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {listing.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                    {listing.amenities.length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-50 text-slate-400">
                        +{listing.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* FOOD OPTION TAG */}
                  <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Food: {listing.foodOption}</span>
                  </div>
                </div>

                {/* CARD FOOTER: PRICE & DETAIL LINK */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Starting from
                    </div>
                    <div className="text-lg font-extrabold text-[#10233f]">
                      ₹{listing.monthlyRentFrom.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-500"> /mo</span>
                    </div>
                  </div>

                  <Link
                    href={`/accommodation/${listing.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#10233f] text-white hover:bg-[#1f6fe5] text-xs font-semibold transition-colors shadow-xs group-hover:bg-[#1f6fe5]"
                  >
                    <span>View Details</span>
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
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">No accommodations match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your gender, property type, or area selection to view more available demo listings.
            </p>
            <button
              onClick={() => {
                setGenderFilter("All")
                setTypeFilter("All")
                setSelectedArea("All Areas")
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#1f6fe5] text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
