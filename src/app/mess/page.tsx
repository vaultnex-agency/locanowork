"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useModal } from "@/context/ModalContext"
import { ScrollReveal } from "@/components/ScrollReveal"
import { fetchMesses } from "@/lib/services/mess"
import type { DietaryType, ServiceType, MessListing } from "@/types/mess"
import {
  Utensils,
  MapPin,
  ArrowRight,
  Filter,
  AlertCircle,
  Search,
  X,
  RotateCcw,
  ChevronDown,
  Heart,
  Truck,
  Leaf,
  IndianRupee,
  Home,
  Clock,
  Map,
} from "lucide-react"

type FilterDietary = "All" | DietaryType
type FilterService = "All" | ServiceType

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

function MessListingContent() {
  const searchParams = useSearchParams()
  const { openSearch } = useModal()

  const urlSearch = searchParams.get("search") || ""
  const urlDietary = (searchParams.get("dietary") as FilterDietary) || "All"
  const urlService = (searchParams.get("service") as FilterService) || "All"

  const [customSearch, setCustomSearch] = useState<string | null>(null)
  const [customDietary, setCustomDietary] = useState<FilterDietary | null>(null)
  const [customService, setCustomService] = useState<FilterService | null>(null)
  const [sortBy, setSortBy] = useState<string>("nearest")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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
      : ["All", "Dine-in Mess", "Tiffin & Delivery", "Dine-in & Delivery"].includes(urlService)
      ? urlService
      : "All"

  const setLocationQuery = (val: string) => setCustomSearch(val)
  const setDietaryFilter = (val: FilterDietary) => setCustomDietary(val)
  const setServiceFilter = (val: FilterService) => setCustomService(val)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const [rawListings, setRawListings] = useState<MessListing[]>([])
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
      })
      setRawListings(res.listings)
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

  // Client-side sorting
  const listings = useMemo(() => {
    const result = [...rawListings]
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.monthlyPriceFrom - b.monthlyPriceFrom)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.monthlyPriceFrom - a.monthlyPriceFrom)
    }
    return result
  }, [rawListings, sortBy])


  const getServiceLabel = (service: ServiceType) => {
    if (service === "Dine-in Mess") return "Dine-in"
    if (service === "Tiffin & Delivery") return "Tiffin Delivery"
    if (service === "Dine-in & Delivery") return "Dine-in & Tiffin"
    return service
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. HERO SECTION WITH FOOD & MESS BACKGROUND */}
      <section
        className="relative w-full pt-28 sm:pt-36 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/mess-hero-bg.jpg')",
          backgroundPosition: "center 42%",
        }}
      >
        <div className="relative z-10 max-w-6xl mx-auto animate-hero-fade">
          {/* Badge: FOOD & MESS */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ffedd5]/90 text-[#ea580c] border border-orange-200/80 tracking-wider uppercase mb-4 shadow-2xs">
            <Utensils className="w-3.5 h-3.5" />
            <span>FOOD &amp; MESS</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.12] mb-4">
            Eat your favourite
            <br />
            and home like food
            <br />
            with <span className="text-[#0066FF]">LOCANO.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#0066FF] max-w-xl leading-relaxed mb-7 font-medium">
            From everyday meals to your favourite dishes, discover trusted student messes and tiffin services in Mangaluru — tasty, affordable and always close to you.
          </p>

          {/* Three Feature Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-7">
            {/* 1. Feels like home */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100/90 text-orange-600 border border-orange-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-[#0066FF] leading-tight">Feels like home</div>
                <div className="text-[10px] sm:text-[11px] text-[#0066FF] font-medium leading-tight mt-0.5">Hygienic &amp; homely food</div>
              </div>
            </div>

            {/* 2. Your favourite choices */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100/90 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Leaf className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-[#0066FF] leading-tight">Your favourite choices</div>
                <div className="text-[10px] sm:text-[11px] text-[#0066FF] font-medium leading-tight mt-0.5">Veg &amp; non-veg options</div>
              </div>
            </div>

            {/* 3. Student friendly */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100/90 text-[#0066FF] border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <IndianRupee className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-bold text-[#0066FF] leading-tight">Student friendly</div>
                <div className="text-[10px] sm:text-[11px] text-[#0066FF] font-medium leading-tight mt-0.5">Affordable prices</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* 2. FLOATING SEARCH PANEL OVERLAPPING HERO BOTTOM */}
        <div className="relative z-20 -mt-10 sm:-mt-12 bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/[0.08] border border-slate-100 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              loadListings()
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
          >
            {/* Field 1: Location / Area */}
            <div className="lg:col-span-4 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0066FF]/15 transition-all">
              <MapPin className="w-4 h-4 text-[#0066FF] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                  Location / Area
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. Balmatta, Deralakatte..."
                  className="w-full bg-transparent text-xs sm:text-[13px] font-semibold text-[#10233f] placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                />
              </div>
              {locationQuery && (
                <button
                  type="button"
                  onClick={() => setLocationQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label="Clear area search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Field 2: Diet Preference */}
            <div className="lg:col-span-3 relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0066FF]/15 transition-all">
              <Utensils className="w-4 h-4 text-[#0066FF] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                  Diet Preference
                </div>
                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value as FilterDietary)}
                  className="w-full bg-transparent text-xs sm:text-[13px] font-semibold text-[#10233f] focus:outline-none cursor-pointer appearance-none pr-5"
                >
                  <option value="All">All Diets</option>
                  <option value="Pure Veg">Pure Veg</option>
                  <option value="Veg & Non-Veg">Veg & Non-Veg</option>
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Field 3: Service Type */}
            <div className="lg:col-span-3 relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0066FF]/15 transition-all">
              <Truck className="w-4 h-4 text-[#0066FF] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                  Service Type
                </div>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value as FilterService)}
                  className="w-full bg-transparent text-xs sm:text-[13px] font-semibold text-[#10233f] focus:outline-none cursor-pointer appearance-none pr-5"
                >
                  <option value="All">All Services</option>
                  <option value="Dine-in Mess">Dine-in Mess</option>
                  <option value="Tiffin & Delivery">Tiffin Delivery</option>
                  <option value="Dine-in & Delivery">Dine-in & Tiffin</option>
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Field 4: Search Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-full min-h-[46px] rounded-xl sm:rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Food</span>
              </button>
            </div>
          </form>
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-[#0066FF] text-xs font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Map className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>
        </div>



        {/* 4. LISTINGS SECTION HEADER WITH SORT */}
        <div className="mt-10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#10233f] tracking-tight">
              Popular Messes &amp; Food Spots in Mangaluru
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {listings.length} {listings.length === 1 ? "food spot" : "food spots"} available
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-full pl-3 pr-8 py-1.5 text-xs font-semibold text-[#10233f] hover:border-slate-300 focus:outline-none focus:border-[#0066FF] cursor-pointer shadow-2xs"
              >
                <option value="nearest">Nearest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden h-96 flex flex-col">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="h-6 bg-slate-200 rounded w-24" />
                    <div className="h-9 bg-slate-200 rounded-xl w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-white rounded-3xl border border-red-100 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">Failed to Load Mess Listings</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={loadListings}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0066FF] text-white text-xs font-semibold hover:bg-[#0052cc] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 5. CLEAN 3-COLUMN LISTING GRID */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, idx) => {
              const photoFallback =
                idx % 3 === 0
                  ? "/mess-thali-deluxe.jpg"
                  : idx % 3 === 1
                  ? "/mess-tiffin.jpg"
                  : "/mess-dining-spread.jpg"

              const imageUrl =
                listing.sampleImage &&
                listing.sampleImage !== "/mess-thali.jpg" &&
                listing.sampleImage !== "/mess-tiffin.jpg"
                  ? listing.sampleImage
                  : photoFallback

              const isFavorite = favorites.has(listing.id)

              return (
                <ScrollReveal
                  key={listing.id}
                  delay={Math.min((idx % 6) * 75, 450)}
                  distance={16}
                  duration={420}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* CARD IMAGE CONTAINER */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={listing.name}
                      fill
                      unoptimized={imageUrl.startsWith("http")}
                      className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Top-left Badges (Matching Reference) */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-md ${
                          listing.dietary === "Pure Veg"
                            ? "bg-white/95 text-emerald-700 border border-emerald-100"
                            : "bg-white/95 text-amber-800 border border-amber-100"
                        }`}
                      >
                        {listing.dietary}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-700 text-[11px] font-semibold shadow-xs border border-slate-200/60">
                        {getServiceLabel(listing.serviceType)}
                      </span>
                    </div>

                    {/* Top-right Favorite Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
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
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Cuisine Tag */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[#10233f] group-hover:text-[#0066FF] transition-colors leading-snug line-clamp-1">
                          {listing.name}
                        </h3>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          {listing.cuisine.split("&")[0].trim()}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">
                        {listing.tagline}
                      </p>

                      {/* Location & Landmark */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                        <span className="font-semibold text-slate-700">{listing.area}</span>
                        <span className="text-slate-400">· {listing.nearestLandmark}</span>
                      </div>

                      {/* Meals & Timings */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-[#ea580c] shrink-0" />
                          <span>Serves: {listing.mealsServed.join(", ")}</span>
                        </div>
                        {listing.timings?.lunch && (
                          <>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Lunch: {listing.timings.lunch.split("–")[0].trim()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Highlight Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {listing.highlights.slice(0, 2).map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50/70 border border-orange-200/50 text-[#ea580c] text-[10.5px] font-medium"
                          >
                            {item}
                          </span>
                        ))}
                        {listing.highlights.length > 2 && (
                          <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            +{listing.highlights.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & View Details Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                          Monthly Pass From
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-[#10233f]">
                          ₹{listing.monthlyPriceFrom.toLocaleString("en-IN")}
                          <span className="text-xs font-normal text-slate-500"> /mo</span>
                        </div>
                      </div>

                      <Link
                        href={`/mess/${listing.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#10233f] hover:bg-[#0066FF] text-white text-xs font-semibold transition-colors shadow-xs group-hover:bg-[#0066FF]"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">No mess services match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your dietary preference, service type, or area search to view available student dining options.
            </p>
            <button
              type="button"
              onClick={() => {
                setDietaryFilter("All")
                setServiceFilter("All")
                setLocationQuery("")
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#0066FF] text-white text-xs font-semibold hover:bg-[#0052cc] transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center p-20">
            <div className="animate-pulse text-sm font-semibold text-slate-400">Loading student dining &amp; mess listings…</div>
          </div>
        </div>
      }
    >
      <MessListingContent />
    </Suspense>
  )
}
