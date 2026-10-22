"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Stop } from "@/data/stops"
import { formatMinutes } from "@/lib/format"
import { compareBusNumbers, searchStops, resolveStop, getStop, parseRouteSlug } from "@/lib/bus-service"
import { resultCards, type ResultCard } from "@/lib/search-results"
import { pushRecent } from "@/lib/recent-searches"
import { RouteMap } from "@/components/RouteMap"
import {
  ArrowRight,
  Clock,
  Navigation,
  Compass,
  ArrowDownUp,
  ArrowUpDown,
  MapPin,
  AlertCircle,
  Pencil,
  Search,
  X,
} from "lucide-react"

interface RouteResultsClientProps {
  from: Stop
  to: Stop
  initialCards: ResultCard[]
}

type FilterType = "All Buses" | "Direct Buses" | "Nearby Stops"
type SortType = "time" | "number"

const DEFAULT_HUBS = [
  "state-bank",
  "kankanady",
  "pumpwell",
  "jyothi",
  "hampankatta",
  "kadri",
  "lalbagh",
  "deralakatte",
  "surathkal",
  "car-street",
]

function getInitialSuggestions(excludeId?: string): Stop[] {
  return DEFAULT_HUBS
    .map((id) => getStop(id))
    .filter((s): s is Stop => s !== undefined && s.id !== excludeId)
    .slice(0, 8)
}

function getDefaultFilter(cards: ResultCard[]): FilterType {
  const hasDirect = cards.some((card) => !card.nearby)
  return hasDirect ? "Direct Buses" : "Nearby Stops"
}

export function RouteResultsClient({ from, to, initialCards }: RouteResultsClientProps) {
  const router = useRouter()
  const [currentFrom, setCurrentFrom] = useState(from)
  const [currentTo, setCurrentTo] = useState(to)
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => getDefaultFilter(initialCards))
  const [activeSort, setActiveSort] = useState<SortType>("time")
  const [editingField, setEditingField] = useState<"from" | "to" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [suggestions, setSuggestions] = useState<Stop[]>([])
  const [error, setError] = useState("")

  // Synchronize state if props change from outside (e.g. navigation)
  const propKey = `${from.id}:${to.id}`
  const [prevPropKey, setPrevPropKey] = useState(propKey)
  if (prevPropKey !== propKey) {
    setPrevPropKey(propKey)
    setCurrentFrom(from)
    setCurrentTo(to)
    setActiveFilter(getDefaultFilter(initialCards))
    setEditingField(null)
    setSearchText("")
    setSuggestions([])
    setError("")
  }

  // Recalculate results for current origin/destination, reusing initialCards for original journey
  const currentCards = useMemo(() => {
    if (currentFrom.id === from.id && currentTo.id === to.id) {
      return initialCards
    }
    return resultCards(currentFrom.id, currentTo.id)
  }, [currentFrom.id, currentTo.id, from.id, to.id, initialCards])

  const editContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Save to recent searches on client mount
  useEffect(() => {
    pushRecent({
      id: `${from.id}:${to.id}`,
      label: `${from.name} → ${to.name}`,
      href: `/transport/route/${from.id}-to-${to.id}`,
    })
  }, [from, to])

  // Listen to popstate for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/transport\/route\/(.+)$/)
      if (match && match[1]) {
        const parsed = parseRouteSlug(match[1])
        if (parsed) {
          setCurrentFrom(parsed.from)
          setCurrentTo(parsed.to)
        }
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Swap starting point and destination
  const handleSwap = () => {
    const nextFrom = currentTo
    const nextTo = currentFrom
    setCurrentFrom(nextFrom)
    setCurrentTo(nextTo)
    setEditingField(null)
    setSearchText("")
    setSuggestions([])
    setError("")

    const nextHref = `/transport/route/${nextFrom.id}-to-${nextTo.id}`
    pushRecent({
      id: `${nextFrom.id}:${nextTo.id}`,
      label: `${nextFrom.name} → ${nextTo.name}`,
      href: nextHref,
    })
    window.history.pushState(null, "", nextHref)
  }

  // Focus input when editingField opens
  useEffect(() => {
    if (editingField) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [editingField])

  // Click outside to close editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(e.target as Node)
      ) {
        setEditingField(null)
      }
    }
    if (editingField) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [editingField])

  const toggleEdit = (field: "from" | "to") => {
    if (editingField === field) {
      setEditingField(null)
    } else {
      setSearchText("")
      setError("")
      setSuggestions(getInitialSuggestions(field === "from" ? currentTo.id : currentFrom.id))
      setEditingField(field)
    }
  }

  const handleSearchChange = (val: string) => {
    setSearchText(val)
    setError("")
    if (val.trim().length >= 1) {
      setSuggestions(searchStops(val, 8))
    } else {
      setSuggestions(getInitialSuggestions(editingField === "from" ? currentTo.id : currentFrom.id))
    }
  }

  const handleSelectStop = (newStop: Stop) => {
    if (editingField === "from") {
      if (newStop.id === currentTo.id) {
        setError("Starting point and destination cannot be the same stop.")
        return
      }
      const href = `/transport/route/${newStop.id}-to-${currentTo.id}`
      pushRecent({
        id: `${newStop.id}:${currentTo.id}`,
        label: `${newStop.name} → ${currentTo.name}`,
        href,
      })
      setEditingField(null)
      setCurrentFrom(newStop)
      router.push(href)
    } else if (editingField === "to") {
      if (newStop.id === currentFrom.id) {
        setError("Destination and starting point cannot be the same stop.")
        return
      }
      const href = `/transport/route/${currentFrom.id}-to-${newStop.id}`
      pushRecent({
        id: `${currentFrom.id}:${newStop.id}`,
        label: `${currentFrom.name} → ${newStop.name}`,
        href,
      })
      setEditingField(null)
      setCurrentTo(newStop)
      router.push(href)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length > 0) {
        const selectable = suggestions.find(
          (s) => (editingField === "from" ? s.id !== currentTo.id : s.id !== currentFrom.id)
        )
        if (selectable) {
          handleSelectStop(selectable)
          return
        }
      }
      if (searchText.trim()) {
        const match = resolveStop(searchText)
        if (match.status === "match" && match.stop) {
          handleSelectStop(match.stop)
        } else if (match.status === "ambiguous") {
          setError("Multiple places match this name. Pick one from the suggestions below.")
        } else {
          setError("Stop not found. Please choose a stop from the suggestions.")
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setEditingField(null)
    }
  }

  const filteredAndSortedCards = useMemo(() => {
    let result = [...currentCards]

    // Filters: All Buses, Direct Buses, Nearby Stops
    if (activeFilter === "Direct Buses") {
      result = result.filter((card) => !card.nearby)
    } else if (activeFilter === "Nearby Stops") {
      result = result.filter((card) => card.nearby)
    }

    // Sorts: time, number
    result.sort((a, b) => {
      if (activeSort === "time") {
        return a.minutes - b.minutes || compareBusNumbers(a.number, b.number)
      }
      if (activeSort === "number") {
        return compareBusNumbers(a.number, b.number)
      }
      return 0
    })

    return result
  }, [currentCards, activeFilter, activeSort])

  const directCount = currentCards.filter((c) => !c.nearby).length
  const nearbyCount = currentCards.filter((c) => c.nearby).length

  return (
    <div className="space-y-8">
      {/* ROUTE HEADER CARD */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card">
        <div className="pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Route Search Results</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f] tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* FROM BUTTON */}
            <button
              type="button"
              onClick={() => toggleEdit("from")}
              aria-expanded={editingField === "from"}
              title={`Click to change starting stop (${currentFrom.name})`}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-2xl cursor-pointer transition-all text-left ${
                editingField === "from"
                  ? "text-[#1f6fe5] bg-blue-50 ring-2 ring-[#1f6fe5]/30 shadow-xs"
                  : "text-[#10233f] hover:text-[#1f6fe5] hover:bg-slate-100/80"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6fe5] focus-visible:ring-offset-2`}
            >
              <span className="underline decoration-dotted decoration-slate-300 underline-offset-8 group-hover:decoration-[#1f6fe5]/60 transition-colors">
                {currentFrom.name}
              </span>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1f6fe5] opacity-60 group-hover:opacity-100 transition-all shrink-0" />
            </button>

            {/* ARROW & SWAP BUTTON */}
            <span className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 shrink-0" aria-hidden="true" />
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap starting point and destination"
                title="Swap starting point and destination"
                className="group/swap p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-500 hover:text-[#1f6fe5] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6fe5] focus-visible:ring-offset-2 shrink-0"
              >
                <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/swap:rotate-180 transition-transform duration-300" aria-hidden="true" />
              </button>
            </span>

            {/* TO BUTTON */}
            <button
              type="button"
              onClick={() => toggleEdit("to")}
              aria-expanded={editingField === "to"}
              title={`Click to change destination (${currentTo.name})`}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer transition-all text-left ${
                editingField === "to"
                  ? "text-[#1f6fe5] bg-blue-50 ring-2 ring-[#1f6fe5]/30 shadow-xs"
                  : "text-[#10233f] hover:text-[#1f6fe5] hover:bg-slate-100/80"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6fe5] focus-visible:ring-offset-2`}
            >
              <span className="underline decoration-dotted decoration-slate-300 underline-offset-8 group-hover:decoration-[#1f6fe5]/60 transition-colors">
                {currentTo.name}
              </span>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1f6fe5] opacity-60 group-hover:opacity-100 transition-all shrink-0" />
            </button>
          </h1>

          <p className="text-xs text-slate-500 mt-2">
            Found {filteredAndSortedCards.length} connection{filteredAndSortedCards.length === 1 ? "" : "s"} ({directCount} direct, {nearbyCount} nearby alternatives).
          </p>
        </div>

        {/* SINGLE LOCATION SELECTOR (WHEN EDITING FROM OR TO) */}
        {editingField && (
          <div ref={editContainerRef} className="pt-5 pb-2 animate-entrance">
            <div className="p-4 sm:p-5 bg-blue-50/40 rounded-2xl border border-blue-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {editingField === "from" ? (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[#1f6fe5]">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[#10233f]">Change Starting Point</span>
                      <span className="text-slate-500 font-medium text-[11px] hidden sm:inline">
                        · Destination remains: <strong className="text-slate-700">{currentTo.name}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Navigation className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[#10233f]">Change Destination</span>
                      <span className="text-slate-500 font-medium text-[11px] hidden sm:inline">
                        · Starting point remains: <strong className="text-slate-700">{currentFrom.name}</strong>
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors flex items-center gap-1 cursor-pointer"
                  aria-label="Cancel editing"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative">
                <div className="flex items-center px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-xs focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      editingField === "from"
                        ? `Search new starting stop (replacing ${currentFrom.name})...`
                        : `Search new destination stop (replacing ${currentTo.name})...`
                    }
                    value={searchText}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="w-full text-sm text-[#10233f] placeholder-slate-400 bg-transparent focus:outline-none"
                    aria-label={editingField === "from" ? "New starting stop" : "New destination stop"}
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchText("")
                        setSuggestions(getInitialSuggestions(editingField === "from" ? currentTo.id : currentFrom.id))
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      aria-label="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* SUGGESTIONS LIST */}
                {suggestions.length > 0 ? (
                  <div className="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 max-h-60 overflow-y-auto">
                    <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {searchText.trim() ? "Matching Stops" : "Popular Stops"}
                    </div>
                    {suggestions.map((stop) => {
                      const isOther =
                        editingField === "from" ? stop.id === currentTo.id : stop.id === currentFrom.id
                      const isCurrent =
                        editingField === "from" ? stop.id === currentFrom.id : stop.id === currentTo.id

                      return (
                        <button
                          key={stop.id}
                          type="button"
                          disabled={isOther}
                          onClick={() => handleSelectStop(stop)}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-sm transition-colors ${
                            isOther
                              ? "opacity-40 cursor-not-allowed bg-slate-50"
                              : "hover:bg-blue-50 focus:bg-blue-50 focus:outline-none cursor-pointer"
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-[#10233f]">{stop.name}</span>
                            {stop.area && stop.area !== stop.name && (
                              <span className="text-xs text-slate-400 ml-2">({stop.area})</span>
                            )}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                            {isOther && (
                              <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Already {editingField === "from" ? "destination" : "origin"}
                              </span>
                            )}
                          </div>
                          {stop.landmark && (
                            <span className="text-xs text-slate-400 hidden sm:inline">{stop.landmark}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  searchText.trim().length > 0 && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-400 text-center">
                      No stops found matching &quot;{searchText}&quot;. Pick from suggestions or try another search.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS: FILTERS & SORTS */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* FILTERS */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 max-w-max">
            <button
              onClick={() => setActiveFilter("All Buses")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeFilter === "All Buses"
                  ? "bg-white text-[#10233f] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              All Buses ({currentCards.length})
            </button>
            <button
              onClick={() => setActiveFilter("Direct Buses")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeFilter === "Direct Buses"
                  ? "bg-white text-[#10233f] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Direct ({directCount})
            </button>
            <button
              onClick={() => setActiveFilter("Nearby Stops")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeFilter === "Nearby Stops"
                  ? "bg-white text-[#10233f] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Nearby Stops ({nearbyCount})
            </button>
          </div>

          {/* SORTS */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as SortType)}
              className="px-3 py-1.5 rounded-full border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
            >
              <option value="time">Travel Time (Fastest)</option>
              <option value="number">Bus Number</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS LIST & MAP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CARDS LIST (LEFT 7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredAndSortedCards.map((card) => {
            return (
              <Link
                key={card.id}
                href={`/transport/bus/${card.busId}?from=${card.fromId}&to=${card.toId}`}
                className="block p-5 bg-white rounded-3xl border border-slate-100 locano-card locano-card-interactive group transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* BUS NUMBER & ROUTE INFO */}
                  <div className="flex items-start gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 text-[#1f6fe5] font-extrabold flex items-center justify-center text-lg shrink-0 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors">
                      {card.number}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                          {card.fromName} → {card.toName}
                        </span>

                        {card.nearby ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" />
                            <span>Nearby Stop</span>
                          </span>
                        ) : card.alongRoad ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                            Along the Road
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            Direct Ride
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>Via:</span>
                        <span className="text-slate-600 font-medium">
                          {card.via.join(" · ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STATS & LINK */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-extrabold text-[#10233f] flex items-center gap-1 justify-start sm:justify-end">
                        <Clock className="w-3.5 h-3.5 text-[#1f6fe5]" />
                        <span>{formatMinutes(card.minutes)}</span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1f6fe5] transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {filteredAndSortedCards.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-sm text-slate-500">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="font-semibold text-slate-700">No buses matching this filter.</div>
              <div className="text-xs text-slate-400 mt-1">
                Try switching to &quot;All Buses&quot; to see alternatives.
              </div>
            </div>
          )}
        </div>

        {/* MAP DISPLAY (RIGHT 5 COLS) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 locano-card h-[460px] overflow-hidden">
            <RouteMap stops={[currentFrom, currentTo]} fromId={currentFrom.id} toId={currentTo.id} />
          </div>
          <div className="text-center text-xs text-slate-400">
            A: {currentFrom.name} · B: {currentTo.name}
          </div>
        </div>
      </div>
    </div>
  )
}
