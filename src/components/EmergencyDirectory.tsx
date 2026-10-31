"use client"

import React, { useState, useMemo } from "react"
import {
  Ambulance,
  Flame,
  HeartHandshake,
  Siren,
  Hospital,
  PhoneCall,
  ShieldAlert,
  Navigation,
  ArrowDown,
  Search,
  MapPin,
  ExternalLink,
  Loader2,
  Check,
  Building2,
  Filter,
} from "lucide-react"
import { LocationSearchInput, MANGALURU_COORDS, getClosestMangaluruArea } from "@/components/LocationSearchInput"
import { MANGALURU_HOSPITALS, Hospital as HospitalType, calculateDistanceKm } from "@/data/hospitals"

type EmergencyContact = {
  number: string
  coverage: string
  description: string
}

type EmergencyService = {
  name: string
  description: string
  icon: typeof Siren
  iconBg: string
  iconColor: string
  contacts: EmergencyContact[]
}

const emergencyServices: EmergencyService[] = [
  {
    name: "Police",
    description: "For immediate safety concerns, crime reporting, and urgent police assistance.",
    icon: Siren,
    iconBg: "bg-blue-50",
    iconColor: "text-[#1f6fe5]",
    contacts: [
      {
        number: "112",
        coverage: "Mangaluru / India",
        description: "Police Emergency Service",
      },
    ],
  },
  {
    name: "Ambulance",
    description: "For urgent medical care, accidents, and emergency hospital transport.",
    icon: Ambulance,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    contacts: [
      {
        number: "108",
        coverage: "Karnataka / Mangaluru",
        description: "Emergency Ambulance Helpline",
      },
      {
        number: "102",
        coverage: "India",
        description: "Emergency Ambulance Helpline",
      },
    ],
  },
  {
    name: "Fire & Rescue",
    description: "For fire outbreaks, building rescue, and critical life-saving emergencies.",
    icon: Flame,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    contacts: [
      {
        number: "112",
        coverage: "Mangaluru / India",
        description: "Fire and Rescue Emergency Service",
      },
    ],
  },
  {
    name: "Women’s Helpline",
    description: "For women seeking emergency response, protection, or urgent assistance.",
    icon: HeartHandshake,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    contacts: [
      {
        number: "1091",
        coverage: "Mangaluru / India",
        description: "Womens Helpline Emergency response",
      },
      {
        number: "112",
        coverage: "Mangaluru / India",
        description: "Womens Helpline Emergency response",
      },
    ],
  },
]

const FACILITY_TYPES = [
  "All Facilities",
  "Multispecialty",
  "Teaching",
  "Government",
  "Specialized",
] as const

export function EmergencyDirectory() {
  // Location states
  const [selectedArea, setSelectedArea] = useState("")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoNotice, setGeoNotice] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("All Facilities")

  const handleDetectLocationAndScroll = () => {
    setIsLocating(true)
    setGeoNotice(null)

    const scrollToHospitals = () => {
      setTimeout(() => {
        const el = document.getElementById("nearest-hospitals-section")
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }

    if (!navigator.geolocation) {
      setIsLocating(false)
      setGeoNotice("Geolocation is not supported by your browser. Please search by area below.")
      scrollToHospitals()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserCoords({ lat, lng })
        const closestArea = getClosestMangaluruArea(lat, lng)
        setSelectedArea(closestArea)
        setGeoNotice(`Live location detected! Showing hospitals sorted by distance from you in ${closestArea}.`)
        scrollToHospitals()
      },
      (err) => {
        setIsLocating(false)
        console.warn("Geolocation notice:", err.message)
        if (!selectedArea) {
          setSelectedArea("Balmatta")
        }
        setGeoNotice("Location access was not granted. Showing all hospitals — you can select or type your area below.")
        scrollToHospitals()
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  // Active reference coordinates (either live GPS or selected area coordinates)
  const referenceCoords = useMemo(() => {
    if (userCoords) return userCoords
    if (selectedArea && MANGALURU_COORDS[selectedArea]) {
      return MANGALURU_COORDS[selectedArea]
    }
    return null
  }, [userCoords, selectedArea])

  // Filter and sort hospitals
  const filteredHospitals = useMemo(() => {
    return MANGALURU_HOSPITALS.map((hospital) => {
      let distanceKm: number | null = null
      if (referenceCoords) {
        distanceKm = calculateDistanceKm(
          referenceCoords.lat,
          referenceCoords.lng,
          hospital.lat,
          hospital.lng
        )
      }
      return { ...hospital, distanceKm }
    })
      .filter((hospital) => {
        // Area filter (if specified and not "All Areas")
        if (selectedArea && selectedArea !== "All Areas") {
          const areaMatches =
            hospital.area.toLowerCase().includes(selectedArea.toLowerCase().trim()) ||
            (MANGALURU_COORDS[selectedArea] &&
              hospital.distanceKm !== null &&
              hospital.distanceKm <= 12) // within practical range
          if (!areaMatches) return false
        }

        // Search text filter (name, area, facilityType, contact)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = hospital.name.toLowerCase().includes(q)
          const areaMatch = hospital.area.toLowerCase().includes(q)
          const typeMatch = hospital.facilityType.toLowerCase().includes(q)
          const contactMatch = hospital.displayContact.toLowerCase().includes(q)
          if (!nameMatch && !areaMatch && !typeMatch && !contactMatch) return false
        }

        // Facility type filter
        if (selectedFacilityType !== "All Facilities") {
          const ft = hospital.facilityType.toLowerCase()
          if (selectedFacilityType === "Multispecialty" && !ft.includes("multispecialty")) {
            return false
          }
          if (selectedFacilityType === "Teaching" && !ft.includes("teaching")) {
            return false
          }
          if (
            selectedFacilityType === "Government" &&
            !ft.includes("government") &&
            !ft.includes("esic") &&
            !ft.includes("primary health") &&
            !ft.includes("community health")
          ) {
            return false
          }
          if (
            selectedFacilityType === "Specialized" &&
            !ft.includes("cardiac") &&
            !ft.includes("cancer") &&
            !ft.includes("kidney")
          ) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        // Sort by distance if available
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm
        }
        return a.name.localeCompare(b.name)
      })
  }, [referenceCoords, selectedArea, searchQuery, selectedFacilityType])

  return (
    <div className="space-y-12">
      {/* 5-CARD ESSENTIAL SERVICES GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Existing 4 Helplines */}
        {emergencyServices.map(({ name, description, icon: Icon, iconBg, iconColor, contacts }) => (
          <article
            key={name}
            className="locano-card flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className={`mb-4 flex size-12 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}>
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#10233f]">{name}</h2>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">{description}</p>
            </div>

            {/* DIRECT EMERGENCY HELPLINES */}
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direct Helpline{contacts.length > 1 ? "s" : ""}
              </div>

              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.number} className="space-y-1">
                    <a
                      href={`tel:${contact.number}`}
                      aria-label={`Call emergency number ${contact.number}`}
                      className="group flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-[#1f6fe5]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-white border border-slate-200/80 text-[#1f6fe5] flex items-center justify-center shadow-2xs group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors">
                          <PhoneCall className="size-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-base tracking-wide text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                            {contact.number}
                          </span>
                          <span className="block text-[10px] font-semibold text-slate-400">
                            {contact.coverage}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-[#10233f] text-white group-hover:bg-[#1f6fe5] transition-colors shadow-2xs">
                        <span>Call</span>
                      </span>
                    </a>
                    <p className="text-[11px] text-slate-500 leading-snug px-1">
                      {contact.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}

        {/* 5th CARD: NEAREST HOSPITALS */}
        <article
          onClick={handleDetectLocationAndScroll}
          className="locano-card flex flex-col justify-between rounded-3xl border-2 border-rose-200/80 bg-gradient-to-b from-rose-50/40 via-white to-white p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
                <Hospital className="size-6" aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/70 text-rose-700 uppercase tracking-wider">
                <Navigation className="size-2.5 animate-pulse" />
                <span>Live GPS</span>
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#10233f] group-hover:text-rose-600 transition-colors">
              Nearest Hospitals
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">
              47 verified hospitals &amp; emergency trauma casualty centers across Mangaluru sorted by proximity.
            </p>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 space-y-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDetectLocationAndScroll()
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-2xs group/btn"
            >
              <span className="flex items-center gap-2">
                {isLocating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Navigation className="size-4 text-rose-600 group-hover/btn:text-white transition-colors" />
                )}
                <span>{isLocating ? "Detecting Location..." : "Find Nearest to Me"}</span>
              </span>
              <ArrowDown className="size-4 group-hover/btn:translate-y-0.5 transition-transform" />
            </button>
            <p className="text-[11px] text-slate-400 text-center leading-tight">
              Auto-detects GPS &amp; lists nearest casualty
            </p>
          </div>
        </article>
      </div>

      {/* ADVISORY BANNER */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-slate-600 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-[#1f6fe5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-[#10233f]">Quick Emergency Tip:</span> Dialing <strong className="text-[#10233f]">112</strong> connects you to India&apos;s National Emergency Response Support System (ERSS), providing automated dispatch for Police, Fire, and Ambulance services across Mangaluru and Karnataka.
        </p>
      </div>

      {/* NEAREST HOSPITALS DIRECTORY SECTION */}
      <section id="nearest-hospitals-section" className="pt-4 scroll-mt-28">
        {/* Section Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
              <Hospital className="w-3.5 h-3.5" />
              <span>MANGALURU HOSPITAL DIRECTORY • 47 HOSPITALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10233f]">
              Nearest Hospitals &amp; Medical Centers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Find emergency casualty wards, multispecialty centers, and phone numbers in Mangaluru. Tap any number to call immediately without copy-pasting.
            </p>
          </div>

          {/* Live location badge */}
          {selectedArea && (
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs shadow-2xs self-start md:self-auto">
              <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-500">Sorted from:</span>
              <span className="font-bold text-[#10233f]">{selectedArea}</span>
              <button
                type="button"
                onClick={handleDetectLocationAndScroll}
                disabled={isLocating}
                className="text-[#1f6fe5] hover:underline font-semibold ml-1 cursor-pointer flex items-center gap-1"
              >
                {isLocating ? <Loader2 className="size-3 animate-spin" /> : <Navigation className="size-3" />}
                <span>Update GPS</span>
              </button>
            </div>
          )}
        </div>

        {/* Location Notice Banner if geolocation changed */}
        {geoNotice && (
          <div className="mb-5 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#10233f] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Navigation className="size-3.5 text-[#1f6fe5] shrink-0" />
              <span>{geoNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeoNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SEARCH & FILTER BAR (Matches Accommodation & Mess style) */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-900/[0.04] border border-slate-100 p-3 sm:p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* Field 1: Location / Area Search */}
            <LocationSearchInput
              value={selectedArea}
              onChange={(val) => {
                setSelectedArea(val)
                setUserCoords(null) // clear raw GPS if user manually picks area
              }}
              placeholder="e.g. Hampankatta, Kankanady, Falnir, Deralakatte..."
              accentColor="blue"
            />

            {/* Field 2: Search by Hospital Name */}
            <div className="relative w-full h-[50px] flex items-center gap-3 px-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 focus-within:bg-white focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-[#1f6fe5]/15 transition-all">
              <Search className="w-4 h-4 text-[#1f6fe5] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                  Search Hospital
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. KMC, Father Muller, A.J., Cardiac..."
                  className="w-full bg-transparent text-xs sm:text-[13px] font-semibold text-[#10233f] placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Facility Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="size-3" /> Type:
            </span>
            {FACILITY_TYPES.map((type) => {
              const active = selectedFacilityType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedFacilityType(type)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                    active
                      ? "bg-[#10233f] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {type}
                </button>
              )
            })}

            {(selectedArea || searchQuery || selectedFacilityType !== "All Facilities") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArea("")
                  setSearchQuery("")
                  setSelectedFacilityType("All Facilities")
                  setUserCoords(null)
                  setGeoNotice(null)
                }}
                className="text-[#1f6fe5] hover:underline text-xs font-semibold ml-auto cursor-pointer whitespace-nowrap px-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong className="text-[#10233f]">{filteredHospitals.length}</strong> hospitals
            {selectedArea && ` in/near ${selectedArea}`}
          </span>
          {referenceCoords && (
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              ✓ Proximity sorting active
            </span>
          )}
        </div>

        {/* HOSPITALS GRID */}
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-slate-100 locano-card space-y-3">
            <div className="size-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Hospital className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#10233f]">No hospitals matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing your search keyword or switching your location to view all 47 hospitals in Mangaluru.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedArea("")
                setSearchQuery("")
                setSelectedFacilityType("All Facilities")
              }}
              className="px-4 py-2 rounded-full bg-[#10233f] text-white text-xs font-bold hover:bg-[#1f6fe5] transition-colors"
            >
              Show All 47 Hospitals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredHospitals.map((hospital) => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${hospital.name} ${hospital.area} Mangaluru`
              )}`

              const isEmergency = hospital.isEmergencyContact

              return (
                <div
                  key={hospital.id}
                  className={`locano-card rounded-3xl bg-white border p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                    isEmergency ? "border-amber-200 bg-amber-50/20" : "border-slate-100"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name and Facility Type Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-[#10233f] text-base leading-snug group-hover:text-[#1f6fe5]">
                          {hospital.name}
                        </h3>
                        {hospital.distanceKm !== null && (
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1f6fe5] border border-blue-200 flex items-center gap-1 shadow-2xs">
                            <Navigation className="size-2.5" />
                            <span>{hospital.distanceKm} km</span>
                          </span>
                        )}
                      </div>

                      {/* Facility Type Badge */}
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {hospital.facilityType}
                      </span>
                    </div>

                    {/* Area / Address */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{hospital.area}</span>
                    </div>
                  </div>

                  {/* Contact Numbers & Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contact / Emergency Numbers
                    </div>

                    {hospital.contactNumbers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {hospital.contactNumbers.map((num) => (
                          <a
                            key={num}
                            href={`tel:${num}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-xs font-bold text-[#10233f] hover:text-[#1f6fe5] transition-colors cursor-pointer group/num"
                          >
                            <PhoneCall className="size-3 text-[#1f6fe5] group-hover/num:scale-110 transition-transform" />
                            <span>{num}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {hospital.displayContact}
                      </span>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      {hospital.contactNumbers.length > 0 && (
                        <a
                          href={`tel:${hospital.contactNumbers[0]}`}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#10233f] hover:bg-[#1f6fe5] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <PhoneCall className="size-3.5" />
                          <span>Call Hospital</span>
                        </a>
                      )}

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Maps</span>
                        <ExternalLink className="size-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

