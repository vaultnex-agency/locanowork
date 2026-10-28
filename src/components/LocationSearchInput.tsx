"use client"

import React, { useState, useRef, useEffect } from "react"
import { MapPin, Navigation, X, Loader2, Check } from "lucide-react"

const POPULAR_MANGALURU_AREAS = [
  "Balmatta",
  "Deralakatte",
  "Kadri",
  "Kankanady",
  "Hampankatta",
  "Bejai",
  "Surathkal",
  "Attavar",
  "Jeppu",
  "Pandeshwar",
]

const MANGALURU_COORDS: Record<string, { lat: number; lng: number }> = {
  Balmatta: { lat: 12.8708, lng: 74.8458 },
  Deralakatte: { lat: 12.8166, lng: 74.8988 },
  Kankanady: { lat: 12.8633, lng: 74.8585 },
  Hampankatta: { lat: 12.8687, lng: 74.8427 },
  Kadri: { lat: 12.8858, lng: 74.856 },
  Surathkal: { lat: 13.0119, lng: 74.7943 },
  Bejai: { lat: 12.8872, lng: 74.8422 },
  Attavar: { lat: 12.8617, lng: 74.8475 },
  Jeppu: { lat: 12.8519, lng: 74.8465 },
  Pandeshwar: { lat: 12.8586, lng: 74.8392 },
}

function getClosestMangaluruArea(lat: number, lng: number): string {
  let closest = "Balmatta"
  let minDistance = Infinity

  for (const [area, coords] of Object.entries(MANGALURU_COORDS)) {
    const dLat = coords.lat - lat
    const dLng = coords.lng - lng
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < minDistance) {
      minDistance = distSq
      closest = area
    }
  }

  return closest
}

interface LocationSearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  accentColor?: "blue" | "brand"
  className?: string
}

export function LocationSearchInput({
  value,
  onChange,
  placeholder = "e.g. Balmatta, Deralakatte...",
  accentColor = "blue",
  className = "",
}: LocationSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleUseCurrentLocation = () => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const area = getClosestMangaluruArea(pos.coords.latitude, pos.coords.longitude)
        onChange(area)
        setIsOpen(false)
      },
      (err) => {
        setIsLocating(false)
        // Fallback gracefully to default area or message
        console.warn("Geolocation notice:", err.message)
        onChange("Balmatta")
        setIsOpen(false)
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const filteredAreas = POPULAR_MANGALURU_AREAS.filter((area) =>
    !value || value === "All Areas" ? true : area.toLowerCase().includes(value.toLowerCase().trim())
  )

  const activeBorder =
    accentColor === "brand"
      ? "border-[#0066FF] ring-2 ring-[#0066FF]/15 bg-white"
      : "border-[#1f6fe5] ring-2 ring-[#1f6fe5]/15 bg-white"

  const activeIconColor = accentColor === "brand" ? "text-[#0066FF]" : "text-[#1f6fe5]"

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
        className={`w-full h-[50px] flex items-center gap-3 px-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 transition-all cursor-text hover:bg-slate-50/90 hover:border-slate-300 ${
          isOpen ? activeBorder : ""
        }`}
      >
        <MapPin className={`w-4 h-4 ${activeIconColor} shrink-0`} />

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
            Location / Area
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs sm:text-[13px] font-semibold text-[#10233f] placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
          />
        </div>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
              inputRef.current?.focus()
            }}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
            aria-label="Clear location search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="absolute top-[calc(100%+0.35rem)] left-0 w-full z-40 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
          {/* Option 1: Use Current Location */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50/70 text-left transition-colors cursor-pointer border-b border-slate-100 group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 text-[#1f6fe5] flex items-center justify-center shrink-0 transition-colors">
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1f6fe5]" />
              ) : (
                <Navigation className="w-4 h-4 text-[#1f6fe5]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-[13px] font-bold text-[#1f6fe5] leading-tight">
                {isLocating ? "Detecting location..." : "Use current location"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Automatically detect nearest student zone
              </div>
            </div>
          </button>

          {geoError && (
            <div className="px-4 py-2 text-[11px] text-rose-500 bg-rose-50 border-b border-rose-100">
              {geoError}
            </div>
          )}

          {/* Option List: Popular Areas */}
          <div className="pt-1.5">
            <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Popular Student Zones
            </div>
            {filteredAreas.map((area) => {
              const isSelected = value.toLowerCase() === area.toLowerCase()
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    onChange(area)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-xs sm:text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 text-[#1f6fe5] font-bold"
                      : "text-[#10233f] font-semibold hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{area}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#1f6fe5]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

