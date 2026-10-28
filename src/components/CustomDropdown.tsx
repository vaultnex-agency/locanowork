"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface DropdownOption {
  value: string
  label: string
}

interface CustomDropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  icon: React.ReactNode
  accentColor?: "blue" | "brand"
  className?: string
}

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  icon,
  accentColor = "blue",
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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

  const activeBorder =
    accentColor === "brand"
      ? "border-[#0066FF] ring-2 ring-[#0066FF]/15 bg-white"
      : "border-[#1f6fe5] ring-2 ring-[#1f6fe5]/15 bg-white"

  const activeText = accentColor === "brand" ? "text-[#0066FF]" : "text-[#1f6fe5]"
  const activeBg = "bg-blue-50/80"

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[50px] flex items-center gap-3 px-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 transition-all text-left cursor-pointer select-none hover:bg-slate-50/90 hover:border-slate-300 ${
          isOpen ? activeBorder : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="shrink-0">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
            {label}
          </div>
          <div className="text-xs sm:text-[13px] font-semibold text-[#10233f] truncate">
            {selectedOption?.label || value}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu with exact width */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] left-0 w-full z-40 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-xs sm:text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? `${activeBg} ${activeText} font-bold`
                    : "text-[#10233f] font-semibold hover:bg-slate-50"
                }`}
              >
                <span className="truncate mr-2">{option.label}</span>
                {isSelected && <Check className={`w-4 h-4 ${activeText} shrink-0`} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

