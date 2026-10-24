"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { fetchMesses } from "@/lib/services/mess"
import { DEMO_DISCLAIMER_TEXT } from "@/data/mock-messes"
import type { DietaryType, ServiceType, MessListing } from "@/types/mess"
import {
  Utensils,
  MapPin,
  ArrowRight,
  Filter,
  AlertCircle,
  Sparkles,
  Search,
  X,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

type FilterDietary = "All" | DietaryType
type FilterService = "All" | ServiceType

function MessListingContent() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") || ""
  const urlDietary = (searchParams.get("dietary") as FilterDietary) || "All"
  const urlService = (searchParams.get("service") as FilterService) || "All"

  const [customSearch, setCustomSearch] = useState<string | null>(null)
  const [customDietary, setCustomDietary] = useState<FilterDietary | null>(null)
  const [customService, setCustomService] = useState<FilterService | null>(null)

  const locationQuery = customSearch !== null ? customSearch : urlSearch
  const dietaryFilter =
    customDietary !== null
      ? customDietary
      : ["All", "Pure Veg", "Veg & Non-Veg"].includes(urlDietary)
      ? urlDietary
      : "All"
  const serviceFilter =
    customService !== null
      ? customService
      : ["All", "Dine-in Mess", "Tiffin Delivery", "Dine-in & Tiffin"].includes(urlService)
      ? urlService
      : "All"

  const setLocationQuery = (val: string) => setCustomSearch(val)
  const setDietaryFilter = (val: FilterDietary) => setCustomDietary(val)
  const setServiceFilter = (val: FilterService) => setCustomService(val)

  const [listings, setListings] = useState<MessListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadListings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchMesses({
        dietary: dietaryFilter,
        service: serviceFilter,
        search: locationQuery,
        includeDemo: true, // Graceful development preview fallback
      })
      setListings(res.listings)
    } catch {
      setError("Unable to load dining and mess listings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [dietaryFilter, serviceFilter, locationQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadListings()
    }, 150)
    return () => clearTimeout(timer)
  }, [loadListings])

  const hasDemoListings = listings.some((l) => l.isDemo)

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* TOP DEMO DISCLAIMER BANNER */}
        {hasDemoListings && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 locano-card shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Development Preview Notice:</span> {DEMO_DISCLAIMER_TEXT}
            </div>
          </div>
        )}

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
                  type="button"
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
                  type="button"
                  onClick={() => setServiceFilter(service)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    serviceFilter === service
                      ? "bg-[#10233f] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {service === "All" ? "All Formats" : service}
                </button>
              ))}

              <div className="relative ml-auto w-full sm:w-72 mt-2 sm:mt-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                <input
                  type="search"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Search mess by area or name"
                  aria-label="Search mess listings by area or name"
                  className="w-full h-10 pl-9 pr-9 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                {locationQuery && (
                  <button
                    type="button"
                    onClick={() => setLocationQuery("")}
                    aria-label="Clear location search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 h-72 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between mb-4">
                    <div className="w-16 h-5 bg-slate-200 rounded-full" />
                    <div className="w-12 h-5 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-3/4 h-6 bg-slate-200 rounded-lg mb-2" />
                  <div className="w-full h-4 bg-slate-100 rounded mb-4" />
                  <div className="w-1/2 h-4 bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="w-20 h-6 bg-slate-200 rounded" />
                  <div className="w-24 h-8 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-white rounded-3xl border border-red-100 locano-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">Failed to Load Mess Listings</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={loadListings}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ea580c] text-white text-xs font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* LISTINGS GRID */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const dietaryBadgeClass =
                listing.dietary === "Pure Veg"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  : "bg-amber-50 text-amber-800 border-amber-200/60"

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 locano-card locano-card-interactive flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* CARD HEADER TAGS */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${dietaryBadgeClass}`}>
                          {listing.dietary}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {listing.serviceType}
                        </span>
                      </div>
                      {listing.isDemo ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          Demo Preview
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* MESS NAME & CUISINE */}
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
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {listing.highlights.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-orange-50/70 border border-orange-200/50 text-orange-950"
                        >
                          {item}
                        </span>
                      ))}
                      {listing.highlights.length > 3 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-50 text-slate-400">
                          +{listing.highlights.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* MEALS SERVED */}
                    <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      <span>Serves: {listing.mealsServed.join(", ")}</span>
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
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 locano-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">No mess services match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your dietary, service format, or area query to view available student dining options.
            </p>
            <button
              type="button"
              onClick={() => {
                setDietaryFilter("All")
                setServiceFilter("All")
                setLocationQuery("")
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#ea580c] text-white text-xs font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center p-20">
            <div className="animate-pulse text-sm font-semibold text-slate-400">Loading student dining & mess listings…</div>
          </div>
        </div>
      }
    >
      <MessListingContent />
    </Suspense>
  )
}
