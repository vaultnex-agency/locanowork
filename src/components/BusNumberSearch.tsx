"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { matchBuses, busRouteLabel, stopNames } from "@/lib/bus-service"
import type { Bus } from "@/data/buses"
import { Bus as BusIcon, ArrowRight, X } from "lucide-react"
import Link from "next/link"

interface BusNumberSearchProps {
  onSuccess?: () => void
  className?: string
}

export function BusNumberSearch({ onSuccess, className = "" }: BusNumberSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Bus[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (val: string) => {
    setQuery(val)
    if (!val.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    const matches = matchBuses(val)
    setResults(matches)
    setHasSearched(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const matches = matchBuses(query)
    setResults(matches)
    setHasSearched(true)

    // One match opens /transport/bus/{id}
    // When one number has two roads (e.g. 1B has 1b and 1b-2), matches.length === 2, so do NOT navigate automatically!
    if (matches.length === 1) {
      if (onSuccess) onSuccess()
      router.push(`/transport/bus/${matches[0].id}`)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center px-4 py-3 bg-white rounded-full border border-slate-200/90 shadow-sm focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <BusIcon className="w-4 h-4 text-[#1f6fe5] shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder="Enter bus number (e.g. 1, 1A, 1B, 2, 15, 27)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full text-sm text-[#10233f] placeholder-slate-400 bg-transparent focus:outline-none uppercase"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
                setHasSearched(false)
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 mr-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-[#1f6fe5] text-white font-medium text-xs hover:bg-blue-600 transition-colors shadow-sm shrink-0"
          >
            Find Route
          </button>
        </div>
      </form>

      {/* MATCHED RESULTS */}
      {hasSearched && results.length > 0 && (
        <div className="mt-3 bg-white rounded-2xl p-3 shadow-lg border border-slate-100 divide-y divide-slate-100 animate-fadeIn max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>
              {results.length === 1 ? "1 Bus Found" : `${results.length} Buses & Roads Found`}
            </span>
            {results.length > 1 && (
              <span className="text-[10px] text-amber-600 font-normal">
                Multiple roads exist. Please select one:
              </span>
            )}
          </div>
          {results.map((bus) => {
            const label = busRouteLabel(bus)
            const keyStops = stopNames(bus.stops.slice(1, -1)).slice(0, 3).join(", ")
            return (
              <Link
                key={bus.id}
                href={`/transport/bus/${bus.id}`}
                onClick={onSuccess}
                className="group p-3 flex items-center justify-between hover:bg-blue-50/70 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1f6fe5] font-bold flex items-center justify-center text-sm border border-blue-100/80 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors">
                    {bus.number}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#10233f]">
                      {label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Via: {keyStops || "Direct"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-slate-400 group-hover:text-[#1f6fe5] transition-colors">
                  <span className="text-xs font-medium mr-1 hidden sm:inline">View details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <div className="mt-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
          No city bus found matching &quot;{query}&quot;. Try searching with another number like 1, 1B, 15, or 27.
        </div>
      )}
    </div>
  )
}
