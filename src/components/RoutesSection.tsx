"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { buses, type Bus } from "@/data/buses"
import { busesWithNumber, busRouteLabel, stopNames } from "@/lib/bus-service"
import { ChevronLeft, ChevronRight, Layers, MapPin, ArrowRight } from "lucide-react"

export type RouteFilter =
  | "All Areas"
  | "Redirected"
  | "City"
  | "Kankanady"
  | "Bejai"
  | "Deralakatte"
  | "Ullal"
  | "Surathkal"
  | "Attavar"
  | "Others"

const FILTERS: RouteFilter[] = [
  "All Areas",
  "Redirected",
  "City",
  "Kankanady",
  "Bejai",
  "Deralakatte",
  "Ullal",
  "Surathkal",
  "Attavar",
  "Others",
]

const PLACE_CHIPS = [
  { label: "Yenepoya (Deemed University)", stopId: "deralakatte" },
  { label: "Mangalore University", stopId: "mangalagangothri" },
  { label: "Kankanady", stopId: "kankanady" },
  { label: "Bejai", stopId: "bejai" },
  { label: "Surathkal", stopId: "surathkal" },
  { label: "Ullal", stopId: "ullal" },
  { label: "Airport", stopId: "bajpe-airport" },
  { label: "Katipalla", stopId: "katipalla" },
]

const CENTRAL_STOPS = new Set([
  "hampankatta", "balmatta", "kadri", "falnir", "bunder", "kudroli",
  "boloor", "mangaladevi", "lalbagh", "ladyhill", "mannagudda",
  "bendoorwell", "nandigudda", "jeppu"
])

const CENTRAL_EXCLUSIONS = new Set([
  "deralakatte", "konaje", "mangalagangothri", "ullal", "surathkal",
  "mukka", "katipalla", "krishnapura", "krishnapur", "bajpe"
])

function checkKankanady(bus: Bus) {
  return bus.stops.some((id) => id.includes("kankanady") || id.includes("pumpwell"))
}

function checkBejai(bus: Bus) {
  return bus.stops.some((id) => id.includes("bejai"))
}

function checkDeralakatte(bus: Bus) {
  return bus.stops.some((id) => id.includes("deralakatte") || id.includes("konaje") || id.includes("mangalagangothri"))
}

function checkUllal(bus: Bus) {
  return bus.stops.some((id) => id.includes("ullal"))
}

function checkSurathkal(bus: Bus) {
  return bus.stops.some((id) =>
    id.includes("surathkal") || id.includes("mukka") || id.includes("katipalla") || id.includes("krishnapur") || id.includes("krishnapura")
  )
}

function checkAttavar(bus: Bus) {
  return bus.stops.some((id) => id.includes("attavar") || id.includes("attavara"))
}

export function RoutesSection({ isFullPage = false }: { isFullPage?: boolean }) {
  const [activeFilter, setActiveFilter] = useState<RouteFilter>("All Areas")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      switch (activeFilter) {
        case "All Areas":
          return true
        case "Redirected":
          return busesWithNumber(bus.number).length > 1
        case "City": {
          const hasCentral = bus.stops.some((id) => CENTRAL_STOPS.has(id))
          const hasExcluded = bus.stops.some((id) => CENTRAL_EXCLUSIONS.has(id))
          return hasCentral && !hasExcluded
        }
        case "Kankanady":
          return checkKankanady(bus)
        case "Bejai":
          return checkBejai(bus)
        case "Deralakatte":
          return checkDeralakatte(bus)
        case "Ullal":
          return checkUllal(bus)
        case "Surathkal":
          return checkSurathkal(bus)
        case "Attavar":
          return checkAttavar(bus)
        case "Others":
          return (
            !checkKankanady(bus) &&
            !checkBejai(bus) &&
            !checkDeralakatte(bus) &&
            !checkUllal(bus) &&
            !checkSurathkal(bus) &&
            !checkAttavar(bus)
          )
        default:
          return true
      }
    })
  }, [activeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredBuses.length / pageSize))
  const paginatedBuses = filteredBuses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleFilterChange = (filter: RouteFilter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  return (
    <section
      id="routes"
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f7fb] flex flex-col justify-center ${
        isFullPage ? "pt-32" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-[#1f6fe5] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Transport</span>
          </div>
          {isFullPage ? (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10233f] tracking-tight">
              All Bus Routes
            </h1>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10233f] tracking-tight">
              All Bus Routes
            </h2>
          )}
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Browse Mangaluru city buses, routes, and key corridors.
          </p>
        </div>

        {/* PLACE CHIPS */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Key Places & Educational Hubs
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACE_CHIPS.map((chip) => (
              <Link
                key={chip.stopId}
                href={`/transport/stop/${chip.stopId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-700 hover:text-[#1f6fe5] hover:border-blue-300 hover:shadow-xs transition-all"
              >
                <MapPin className="w-3 h-3 text-[#1f6fe5]" />
                <span>{chip.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* AREA FILTERS (ORDER SPECIFIED IN DOCS) */}
        <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#1f6fe5] text-white shadow-sm shadow-blue-500/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </div>

        {/* ROUTE LIST (5 PER PAGE) */}
        <div className="space-y-3.5 mb-8">
          {paginatedBuses.map((bus) => {
            const label = busRouteLabel(bus)
            const intermediate = bus.stops.slice(1, -1)
            const keyStops = stopNames(intermediate).slice(0, 4).join(" · ")
            const isRedirected = busesWithNumber(bus.number).length > 1

            return (
              <Link
                key={bus.id}
                href={`/transport/bus/${bus.id}`}
                className="block p-5 bg-white rounded-2xl border border-slate-100 locano-card locano-card-interactive group transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* LEFT: NUMBER & ROUTE */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#1f6fe5] font-extrabold flex items-center justify-center text-base shrink-0 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors">
                      {bus.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                          {label}
                        </span>
                        {isRedirected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Multi-road
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Key stops:</span>
                        <span className="text-slate-600 font-medium">{keyStops || "Direct ride"}</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: ARROW */}
                  <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1f6fe5] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {paginatedBuses.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No routes found under &quot;{activeFilter}&quot;.
            </div>
          )}
        </div>

        {/* PAGINATION (5 PER PAGE) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, filteredBuses.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-700">{filteredBuses.length}</span> routes
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-700 bg-white rounded-full border border-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
