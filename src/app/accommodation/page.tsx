"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useModal } from "@/context/ModalContext"
import { ScrollReveal } from "@/components/ScrollReveal"
import { CustomDropdown } from "@/components/CustomDropdown"
import { LocationSearchInput } from "@/components/LocationSearchInput"
import { ListingCardImage } from "@/components/ListingCardImage"
import { fetchAccommodations } from "@/lib/services/accommodation"
import type { GenderPreference, AccommodationListing } from "@/types/accommodation"
import {
  Home,
  MapPin,
  ArrowRight,
  Filter,
  AlertCircle,
  Search,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  IndianRupee,
  Heart,
  Camera,
  Wifi,
  Utensils,
  Zap,
  BookOpen,
  Bike,
  Droplets,
  Map,
} from "lucide-react"

type FilterGender = "All" | GenderPreference

const POPULAR_AREAS = [
  "All Areas",
  "Balmatta",
  "Deralakatte",
  "Jeppu",
  "Attavar",
  "Hampankatta",
  "Kankanady",
  "Bejai",
  "Pandeshwar",
  "Others",
] as const

const PG_TYPE_OPTIONS = [
  { value: "All", label: "All PGs (Any)" },
  { value: "Boys", label: "Boys PG" },
  { value: "Girls", label: "Girls PG" },
  { value: "Co-ed", label: "Co-ed PG" },
]

const BUDGET_OPTIONS = [
  { value: "All", label: "Any Budget" },
  { value: "under-6000", label: "Under ₹6,000" },
  { value: "6000-8000", label: "₹6,000 - ₹8,000" },
  { value: "above-8000", label: "Above ₹8,000" },
]

// Amenity icon resolver
function getAmenityIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes("wi-fi") || lower.includes("wifi")) {
    return <Wifi className="w-3 h-3 text-[#1f6fe5]" />
  }
  if (lower.includes("meal") || lower.includes("food") || lower.includes("dining")) {
    return <Utensils className="w-3 h-3 text-[#ea580c]" />
  }
  if (lower.includes("power") || lower.includes("backup")) {
    return <Zap className="w-3 h-3 text-amber-500" />
  }
  if (lower.includes("study") || lower.includes("desk")) {
    return <BookOpen className="w-3 h-3 text-indigo-500" />
  }
  if (lower.includes("parking") || lower.includes("bike")) {
    return <Bike className="w-3 h-3 text-emerald-500" />
  }
  if (lower.includes("water") || lower.includes("ro")) {
    return <Droplets className="w-3 h-3 text-sky-500" />
  }
  return <ShieldCheck className="w-3 h-3 text-slate-400" />
}

// Clean short label for amenity chips
function getAmenityLabel(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes("wi-fi") || lower.includes("wifi")) return "Wi-Fi"
  if (lower.includes("meal")) return "Meals"
  if (lower.includes("power backup")) return "Power Backup"
  if (lower.includes("study hall") || lower.includes("study")) return "Study Hall"
  if (lower.includes("parking")) return "Two-Wheeler Parking"
  if (lower.includes("pure drinking water") || lower.includes("ro")) return "RO Water"
  if (lower.includes("cctv") || lower.includes("security")) return "Security"
  return name.length > 18 ? name.slice(0, 16) + "…" : name
}

function AccommodationContent() {
  const searchParams = useSearchParams()
  const { openSearch } = useModal()

  const urlSearch = searchParams.get("search") || ""
  const urlGender = (searchParams.get("gender") as FilterGender) || "All"
  const [customSearch, setCustomSearch] = useState<string | null>(null)
  const [customGender, setCustomGender] = useState<FilterGender | null>(null)
  const [budgetFilter, setBudgetFilter] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("nearest")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const locationQuery = customSearch !== null ? customSearch : urlSearch
  const genderFilter: FilterGender =
    customGender !== null
      ? customGender
      : ["All", "Boys", "Girls", "Co-ed"].includes(urlGender)
      ? urlGender
      : "All"

  const setLocationQuery = (val: string) => setCustomSearch(val)
  const setGenderFilter = (val: FilterGender) => setCustomGender(val)

  const [rawListings, setRawListings] = useState<AccommodationListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const loadListings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchAccommodations({
        gender: genderFilter,
        type: "All",
        search: locationQuery,
      })
      setRawListings(res.listings)
    } catch {
      setError("Unable to load accommodations at this time. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [genderFilter, locationQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadListings()
    }, 150)
    return () => clearTimeout(timer)
  }, [loadListings])

  // Client-side budget filter and sort
  const listings = useMemo(() => {
    let result = [...rawListings]

    if (budgetFilter === "under-6000") {
      result = result.filter((item) => item.monthlyRentFrom <= 6000)
    } else if (budgetFilter === "6000-8000") {
      result = result.filter((item) => item.monthlyRentFrom >= 6000 && item.monthlyRentFrom <= 8000)
    } else if (budgetFilter === "above-8000") {
      result = result.filter((item) => item.monthlyRentFrom > 8000)
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.monthlyRentFrom - b.monthlyRentFrom)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.monthlyRentFrom - a.monthlyRentFrom)
    }

    return result
  }, [rawListings, budgetFilter, sortBy])


  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. HERO SECTION WITH FULL-WIDTH BEDROOM BACKGROUND */}
      <section
        className="relative w-full pt-28 sm:pt-36 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/pg-hero-bedroom.jpg')",
          backgroundPosition: "center 38%",
        }}
      >
        {/* Dark gradient overlay matching reference for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,35,63,0.95) 0%, rgba(16,35,63,0.90) 38%, rgba(16,35,63,0.58) 72%, rgba(16,35,63,0.30) 100%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto animate-hero-fade">
          {/* Badge: ACCOMMODATION */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 backdrop-blur-md text-white/90 border border-white/20 tracking-wider uppercase mb-4">
            <Home className="w-3.5 h-3.5 text-blue-300" />
            <span>ACCOMMODATION</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12] mb-3">
            Find Your Ideal PG
            <br />
            in Mangaluru
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200/90 max-w-xl leading-relaxed mb-6 font-normal">
            Verified Boys and Girls student PGs — with real photos, genuine details and easy contact.
          </p>

          {/* Three Feature Highlights */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-1">
            {/* 1. Verified Listings */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-white leading-tight">Verified Listings</div>
                <div className="text-[10.5px] sm:text-[11px] text-slate-300 leading-tight mt-0.5">Real owners &amp; genuine details</div>
              </div>
            </div>

            {/* 2. Near Colleges */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-white leading-tight">Near Colleges</div>
                <div className="text-[10.5px] sm:text-[11px] text-slate-300 leading-tight mt-0.5">Easily find nearby options</div>
              </div>
            </div>

            {/* 3. Student Friendly */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-white leading-tight">Student Friendly</div>
                <div className="text-[10.5px] sm:text-[11px] text-slate-300 leading-tight mt-0.5">Affordable &amp; safe stays</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* 2. FLOATING SEARCH PANEL OVERLAPPING HERO BOTTOM */}
        <div className="relative z-20 -mt-10 sm:-mt-12 bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/[0.08] border border-slate-100 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Field 1: Location / Area */}
            <LocationSearchInput
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="e.g. Balmatta, Deralakatte..."
              accentColor="blue"
            />

            {/* Field 2: PG Type */}
            <CustomDropdown
              label="PG Type"
              value={genderFilter}
              options={PG_TYPE_OPTIONS}
              onChange={(val) => setGenderFilter(val as FilterGender)}
              icon={<Home className="w-4 h-4 text-[#1f6fe5] shrink-0" />}
              accentColor="blue"
            />

            {/* Field 3: Monthly Budget */}
            <CustomDropdown
              label="Budget (per month)"
              value={budgetFilter}
              options={BUDGET_OPTIONS}
              onChange={(val) => setBudgetFilter(val)}
              icon={<IndianRupee className="w-4 h-4 text-[#1f6fe5] shrink-0" />}
              accentColor="blue"
            />

            {/* Field 4: Search Button */}
            <button
              type="button"
              onClick={() => loadListings()}
              className="w-full h-[50px] rounded-xl bg-[#1f6fe5] hover:bg-[#1856b8] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search PGs</span>
            </button>
          </div>
        </div>

        {/* 3. POPULAR AREAS ROW */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#10233f] mr-1">Popular Areas</span>
            {POPULAR_AREAS.map((area) => {
              const isActive =
                area === "All Areas"
                  ? !locationQuery
                  : locationQuery.toLowerCase() === area.toLowerCase()

              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => setLocationQuery(area === "All Areas" ? "" : area)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#10233f] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {area}
                </button>
              )
            })}
          </div>

          {/* View Map Action */}
          <button
            type="button"
            onClick={() => openSearch("location")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-[#1f6fe5] text-xs font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Map className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>
        </div>

        {/* 4. LISTINGS SECTION HEADER */}
        <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#10233f]">
            100+ Verified PGs in Mangaluru
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
            <span className="font-medium">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-xs font-semibold text-[#10233f] shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#1f6fe5] cursor-pointer appearance-none"
              >
                <option value="nearest">Nearest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* 5. 3-COLUMN LISTING GRID */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-96 flex flex-col">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-3/4 h-5 bg-slate-200 rounded mb-2" />
                    <div className="w-1/2 h-4 bg-slate-100 rounded mb-4" />
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-slate-100 rounded" />
                      <div className="w-16 h-6 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="w-20 h-6 bg-slate-200 rounded" />
                    <div className="w-24 h-8 bg-slate-200 rounded-xl" />
                  </div>
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
            <h3 className="text-base font-bold text-[#10233f]">Failed to Load Accommodations</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={loadListings}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1f6fe5] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* LISTINGS CARDS */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, idx) => {
              // Differentiated realistic room photos
              const photoFallback =
                idx % 3 === 0
                  ? "/pg-room-1.jpg"
                  : idx % 3 === 1
                  ? "/pg-room-2.jpg"
                  : "/pg-room-3.jpg"

              const rawImage =
                (Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : null) ||
                listing.sampleImage

              const imageUrl =
                rawImage &&
                rawImage !== "/hero-coast.png" &&
                rawImage !== "/hero-coast.jpg"
                  ? rawImage
                  : photoFallback

              // Differentiated photo count matching reference
              const photoCount = idx === 0 ? 8 : idx === 1 ? 10 : idx === 2 ? 6 : 8 + (idx % 5)

              const isFavorite = favorites.has(listing.id)

              return (
                <ScrollReveal
                  key={listing.id}
                  delay={Math.min((idx % 6) * 75, 450)}
                  distance={16}
                  duration={420}
                  className="h-full"
                >
                  <Link
                    href={`/accommodation/${listing.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between h-full cursor-pointer"
                  >
                    {/* CARD IMAGE CONTAINER */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <ListingCardImage
                        src={imageUrl}
                        fallbackSrc={photoFallback}
                        alt={listing.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Top-left: Verified Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-600 text-[11px] font-bold shadow-xs border border-emerald-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Top-right: Heart Favorite button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(listing.id)
                        }}
                        aria-label="Save to favorites"
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFavorite ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {/* Bottom-right: Photo count badge */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{photoCount} photos</span>
                        </span>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name & Type Tag */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-[16px] sm:text-[17px] font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors leading-snug line-clamp-1">
                            {listing.name}
                          </h3>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#1f6fe5] border border-blue-100 shrink-0">
                            {listing.gender === "Girls" ? "Girls PG" : listing.gender === "Co-ed" ? "Co-ed PG" : "Boys PG"}
                          </span>
                        </div>

                        {/* Location & Landmark / Distance */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-[#1f6fe5] shrink-0" />
                          <span className="font-semibold text-slate-700">{listing.area}</span>
                          <span className="text-slate-400">· {listing.nearestLandmark}</span>
                        </div>

                        {/* Amenities Row */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                          {listing.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-600 text-[11px] font-medium"
                            >
                              {getAmenityIcon(amenity)}
                              <span>{getAmenityLabel(amenity)}</span>
                            </span>
                          ))}
                          {listing.amenities.length > 3 && (
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                              +{listing.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & View Details Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-lg sm:text-xl font-extrabold text-[#10233f]">
                            ₹{listing.monthlyRentFrom.toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-slate-500">/month</span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#10233f] group-hover:bg-[#1f6fe5] text-white text-xs font-semibold transition-colors shadow-xs">
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 locano-card space-y-3 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">No accommodations match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your area query, property type, or monthly budget to view available listings.
            </p>
            <button
              type="button"
              onClick={() => {
                setLocationQuery("")
                setBudgetFilter("All")
                setGenderFilter("All")
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#1f6fe5] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccommodationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center p-20">
            <div className="animate-pulse text-sm font-semibold text-slate-400">Loading student accommodations…</div>
          </div>
        </div>
      }
    >
      <AccommodationContent />
    </Suspense>
  )
}
