"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  parseSearchQuery,
  getLiveSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/search/query-parser"
import { Search, ArrowRight, Home, Utensils, X } from "lucide-react"

export function DockingSearch() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    let lastVisible = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 480
          if (shouldShow !== lastVisible) {
            lastVisible = shouldShow
            setIsVisible(shouldShow)
            if (!shouldShow) {
              setIsOpen(false)
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const suggestions: SearchSuggestion[] =
    query.trim().length >= 2 ? getLiveSearchSuggestions(query) : []

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const parsed = parseSearchQuery(query)
    setIsOpen(false)
    router.push(parsed.targetUrl)
  }

  const handleSelectSuggestion = (url: string) => {
    setIsOpen(false)
    router.push(url)
  }

  return (
    <aside
      aria-label="Sticky search navigation"
      className={`fixed top-20 sm:top-22 left-0 right-0 z-30 flex justify-center px-3 sm:px-4 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div
        ref={containerRef}
        className="pointer-events-auto relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-full border border-slate-200/90 shadow-xl shadow-slate-900/10 p-1 pl-3.5 sm:pl-4 transition-all"
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search area, PG, or mess..."
            className="flex-1 bg-transparent text-xs sm:text-[13.5px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
            autoComplete="off"
            aria-label="Docked universal search"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setIsOpen(false)
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1 bg-[#1f6fe5] hover:bg-[#1856b8] text-white text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-xs cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        {/* Live Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl p-2 space-y-1 z-50 max-h-[60vh] overflow-y-auto text-left animate-entrance">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </div>
            {suggestions.map((s, idx) => {
              const Icon = s.category === "mess" ? Utensils : Home
              const iconColor =
                s.category === "mess"
                  ? "text-[#ea580c] bg-orange-50"
                  : "text-[#1f6fe5] bg-blue-50"

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.url)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[13px] font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors truncate">
                      {s.title}
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate">
                      {s.subtitle}
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#1f6fe5] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
