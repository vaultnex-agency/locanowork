"use client"

import React, { useState } from "react"
import { useModal } from "@/context/ModalContext"
import { LocationSearch } from "./LocationSearch"
import { BusNumberSearch } from "./BusNumberSearch"
import { X, MapPin, Bus } from "lucide-react"

function SearchModalDialog({
  initialTab,
  closeSearch,
}: {
  initialTab: "location" | "bus"
  closeSearch: () => void
}) {
  const [activeTab, setActiveTab] = useState<"location" | "bus">(initialTab)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 locano-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeSearch}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#10233f]">
            Find Bus Transport in Mangaluru
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Search routes between any two stops or lookup a specific bus service.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 mb-6 max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab("location")}
            className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "location"
                ? "bg-white text-[#1f6fe5] shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>By Stops</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bus")}
            className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "bus"
                ? "bg-white text-[#1f6fe5] shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus Number</span>
          </button>
        </div>

        {/* Active Tab Content */}
        {activeTab === "location" ? (
          <LocationSearch onSuccess={closeSearch} showRecents={true} />
        ) : (
          <BusNumberSearch onSuccess={closeSearch} />
        )}
      </div>
    </div>
  )
}

export function SearchModal() {
  const { isSearchOpen, closeSearch, searchTab } = useModal()

  if (!isSearchOpen) return null

  return (
    <SearchModalDialog
      key={searchTab || "location"}
      initialTab={searchTab || "location"}
      closeSearch={closeSearch}
    />
  )
}
