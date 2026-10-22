"use client"

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { searchStops, resolveStop, getStop } from "@/lib/bus-service"
import type { Stop } from "@/data/stops"
import { pushRecent, clearRecent, formatAgo, subscribeRecent, getRecentSnapshot } from "@/lib/recent-searches"
import { ArrowUpDown, Search, MapPin, Navigation, Clock, X, AlertCircle } from "lucide-react"

interface LocationSearchProps {
  onSuccess?: () => void
  showRecents?: boolean
  className?: string
}

export function LocationSearch({ onSuccess, showRecents = true, className = "" }: LocationSearchProps) {
  const router = useRouter()

  const [fromText, setFromText] = useState("")
  const [fromId, setFromId] = useState<string | null>(null)
  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)

  const [toText, setToText] = useState("")
  const [toId, setToId] = useState<string | null>(null)
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([])
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const [error, setError] = useState("")
  const recents = useSyncExternalStore(subscribeRecent, getRecentSnapshot, () => [])

  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromSuggestions(false)
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFromChange = (val: string) => {
    setFromText(val)
    setFromId(null) // editing text clears the stored id
    setError("")
    if (val.trim().length >= 1) {
      setFromSuggestions(searchStops(val, 8))
      setShowFromSuggestions(true)
    } else {
      setFromSuggestions([])
      setShowFromSuggestions(false)
    }
  }

  const handleToChange = (val: string) => {
    setToText(val)
    setToId(null) // editing text clears the stored id
    setError("")
    if (val.trim().length >= 1) {
      setToSuggestions(searchStops(val, 8))
      setShowToSuggestions(true)
    } else {
      setToSuggestions([])
      setShowToSuggestions(false)
    }
  }

  const selectFrom = (stop: Stop) => {
    setFromText(stop.name)
    setFromId(stop.id)
    setShowFromSuggestions(false)
    setError("")
  }

  const selectTo = (stop: Stop) => {
    setToText(stop.name)
    setToId(stop.id)
    setShowToSuggestions(false)
    setError("")
  }

  const handleSwap = () => {
    const tempText = fromText
    const tempId = fromId
    setFromText(toText)
    setFromId(toId)
    setToText(tempText)
    setToId(tempId)
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!fromText.trim() || !toText.trim()) {
      setError("Enter both a starting point and a destination.")
      return
    }

    let resolvedFrom: Stop | undefined = fromId ? getStop(fromId) : undefined
    if (!resolvedFrom) {
      const match = resolveStop(fromText)
      if (match.status === "match" && match.stop) {
        resolvedFrom = match.stop
      } else if (match.status === "ambiguous") {
        setError("A couple of places share that name. Pick one from the suggestions.")
        return
      } else {
        setError("Those names are not in the stop list yet. Pick a place from the suggestions.")
        return
      }
    }

    let resolvedTo: Stop | undefined = toId ? getStop(toId) : undefined
    if (!resolvedTo) {
      const match = resolveStop(toText)
      if (match.status === "match" && match.stop) {
        resolvedTo = match.stop
      } else if (match.status === "ambiguous") {
        setError("A couple of places share that name. Pick one from the suggestions.")
        return
      } else {
        setError("Those names are not in the stop list yet. Pick a place from the suggestions.")
        return
      }
    }

    if (resolvedFrom.id === resolvedTo.id) {
      setError("Pick two different places.")
      return
    }

    // Save recent search
    const href = `/transport/route/${resolvedFrom.id}-to-${resolvedTo.id}`
    pushRecent({
      id: `${resolvedFrom.id}:${resolvedTo.id}`,
      label: `${resolvedFrom.name} → ${resolvedTo.name}`,
      href,
    })

    if (onSuccess) onSuccess()
    router.push(href)
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 relative">
          {/* FROM INPUT */}
          <div ref={fromRef} className="relative flex-1 w-full">
            <div className="flex items-center px-4 py-3 bg-white rounded-full border border-slate-200/90 shadow-sm focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <MapPin className="w-4 h-4 text-[#1f6fe5] shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="From (e.g. State Bank, Kadri, Valencia)"
                value={fromText}
                onChange={(e) => handleFromChange(e.target.value)}
                onFocus={() => {
                  if (fromText.trim().length >= 1) {
                    setFromSuggestions(searchStops(fromText, 8))
                    setShowFromSuggestions(true)
                  }
                }}
                className="w-full text-base sm:text-sm text-[#10233f] placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {fromText && (
                <button
                  type="button"
                  onClick={() => {
                    setFromText("")
                    setFromId(null)
                    setShowFromSuggestions(false)
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions list */}
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Starting Point
                </div>
                {fromSuggestions.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => selectFrom(stop)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between text-sm transition-colors"
                  >
                    <div>
                      <span className="font-medium text-[#10233f]">{stop.name}</span>
                      {stop.area && stop.area !== stop.name && (
                        <span className="text-xs text-slate-400 ml-2">({stop.area})</span>
                      )}
                    </div>
                    {stop.landmark && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{stop.landmark}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap starting point and destination"
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#1f6fe5] hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm shrink-0"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* TO INPUT */}
          <div ref={toRef} className="relative flex-1 w-full">
            <div className="flex items-center px-4 py-3 bg-white rounded-full border border-slate-200/90 shadow-sm focus-within:border-[#1f6fe5] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Navigation className="w-4 h-4 text-emerald-500 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="To (e.g. Deralakatte, Surathkal, Bejai)"
                value={toText}
                onChange={(e) => handleToChange(e.target.value)}
                onFocus={() => {
                  if (toText.trim().length >= 1) {
                    setToSuggestions(searchStops(toText, 8))
                    setShowToSuggestions(true)
                  }
                }}
                className="w-full text-base sm:text-sm text-[#10233f] placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {toText && (
                <button
                  type="button"
                  onClick={() => {
                    setToText("")
                    setToId(null)
                    setShowToSuggestions(false)
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions list */}
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Destination
                </div>
                {toSuggestions.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => selectTo(stop)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between text-sm transition-colors"
                  >
                    <div>
                      <span className="font-medium text-[#10233f]">{stop.name}</span>
                      {stop.area && stop.area !== stop.name && (
                        <span className="text-xs text-slate-400 ml-2">({stop.area})</span>
                      )}
                    </div>
                    {stop.landmark && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{stop.landmark}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#1f6fe5] text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Find Buses</span>
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* RECENT SEARCHES */}
      {showRecents && recents.length > 0 && (
        <div className="mt-3.5 pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent:</span>
          </span>
          {recents.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (onSuccess) onSuccess()
                router.push(item.href)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[#10233f] hover:border-[#1f6fe5] hover:text-[#1f6fe5] transition-all shadow-2xs"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-[10px] text-slate-400">· {formatAgo(item.at)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearRecent}
            className="text-[11px] text-slate-400 hover:text-slate-600 ml-1 underline decoration-dotted"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
