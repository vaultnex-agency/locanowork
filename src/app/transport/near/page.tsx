"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { nearestStops, busesThroughStop } from "@/lib/bus-service"
import type { Stop } from "@/data/stops"
import { formatMeters } from "@/lib/format"
import { RouteMap } from "@/components/RouteMap"
import { Navigation, Bus, AlertCircle, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react"

type GeoState = "idle" | "loading" | "success" | "denied" | "error"

interface StopWithDistance {
  stop: Stop
  meters: number
}

export default function NearStopsPage() {
  const [geoState, setGeoState] = useState<GeoState>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [nearby, setNearby] = useState<StopWithDistance[]>([])

  const requestLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoState("error")
      setErrorMessage("Geolocation is not supported by your browser.")
      return
    }

    setGeoState("loading")
    setErrorMessage("")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        const found = nearestStops(latitude, longitude, 10)
        setNearby(found)
        setGeoState("success")
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState("denied")
          setErrorMessage(
            "Location permission was denied. Please allow location access in your browser or search for stops by name."
          )
        } else {
          setGeoState("error")
          setErrorMessage(error.message || "Unable to determine your current location.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  // Attempt automatic detection on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const timer = setTimeout(() => {
        setGeoState("error")
        setErrorMessage("Geolocation is not supported by your browser.")
      }, 0)
      return () => clearTimeout(timer)
    }

    let active = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        const found = nearestStops(latitude, longitude, 10)
        setNearby(found)
        setGeoState("success")
      },
      (error) => {
        if (!active) return
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState("denied")
          setErrorMessage(
            "Location permission was denied. Please allow location access in your browser or search for stops by name."
          )
        } else {
          setGeoState("error")
          setErrorMessage(error.message || "Unable to determine your current location.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            href="/transport"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Routes</span>
          </Link>
        </div>

        {/* HEADER */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Navigation className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Live Browser Geolocation
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f] tracking-tight mt-0.5">
                  Stops Near You
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Discover the nearest Mangaluru city bus stops relative to your live device position.
                </p>
              </div>
            </div>

            <button
              onClick={requestLocation}
              disabled={geoState === "loading"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10233f] text-white hover:bg-[#1f6fe5] disabled:opacity-50 text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${geoState === "loading" ? "animate-spin" : ""}`} />
              <span>{geoState === "loading" ? "Locating..." : "Refresh Location"}</span>
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {geoState === "loading" && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-[#1f6fe5] border-t-transparent animate-spin mx-auto" />
            <div className="text-base font-bold text-[#10233f]">Checking browser GPS location...</div>
            <div className="text-xs text-slate-400">
              Please allow location permissions if prompted by your browser.
            </div>
          </div>
        )}

        {/* PERMISSION DENIED OR ERROR STATE */}
        {(geoState === "denied" || geoState === "error") && (
          <div className="p-8 sm:p-10 bg-white rounded-3xl border border-amber-200/80 locano-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#10233f]">Location Permission Denied</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                We do not invent mock coordinates when permission is denied. You can still search for any stop or college by name.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={requestLocation}
                className="px-5 py-2.5 rounded-full bg-[#1f6fe5] text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-xs"
              >
                Try Again
              </button>
              <Link
                href="/transport"
                className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Browse All Routes
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {geoState === "success" && coords && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* STOP LIST (LEFT 7 COLS) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Closest Stops ({nearby.length})
                </h2>
                <span className="text-xs text-slate-400">
                  Sorted by walking proximity
                </span>
              </div>

              {nearby.map(({ stop, meters }, idx) => {
                const buses = busesThroughStop(stop.id)

                return (
                  <Link
                    key={stop.id}
                    href={`/transport/stop/${stop.id}`}
                    className="block p-5 bg-white rounded-3xl border border-slate-100 locano-card locano-card-interactive group transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm border border-emerald-100 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-base font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                            {stop.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            {stop.area && <span>Area: {stop.area}</span>}
                            {stop.landmark && <span>· Landmark: {stop.landmark}</span>}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 flex-wrap">
                            <Bus className="w-3 h-3 text-[#1f6fe5]" />
                            <span>
                              {buses.length} active buses ({buses.slice(0, 5).map((b) => b.number).join(", ")}
                              {buses.length > 5 ? "..." : ""})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-emerald-600">
                          {formatMeters(meters)}
                        </div>
                        <div className="text-slate-400 group-hover:text-[#1f6fe5] mt-1 flex justify-end">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* MAP DISPLAY (RIGHT 5 COLS) */}
            <div className="lg:col-span-5 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-slate-100 locano-card h-[460px] overflow-hidden">
                <RouteMap stops={nearby.map((n) => n.stop)} />
              </div>
              <div className="text-center text-xs text-slate-400">
                Markers show stops closest to your GPS anchor.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
