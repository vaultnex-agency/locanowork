"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useModal } from "@/context/ModalContext"
import { Menu, User, X } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { openAccount } = useModal()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"hero" | "about" | null>(
    pathname === "/" ? "hero" : null
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)

      if (pathname === "/") {
        const sectionIds = ["hero", "about"] as const
        let active: "hero" | "about" = "hero"
        for (const id of sectionIds) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= 150) {
            active = id
          }
        }
        setActiveSection(active)
      } else {
        setActiveSection(null)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  const isHomeActive = pathname === "/" && activeSection === "hero"
  const isRoutesActive = pathname.startsWith("/transport")
  const isAboutActive =
    pathname === "/about" ||
    (pathname === "/" && activeSection === "about")
  const activeCls = "text-[#1f6fe5] bg-[#e0efff] font-semibold"
  const inactiveCls = "text-slate-700 hover:text-[#1f6fe5] hover:bg-slate-100/60 font-medium"

  return (
    <header className="fixed top-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-slate-200/60 pill-navbar transition-all duration-420 ${
          isScrolled
            ? "pill-navbar-scrolled bg-white/92 shadow-md shadow-slate-900/5"
            : "bg-white/80 backdrop-blur-md shadow-xs"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center mr-2 sm:mr-3">
          <Link
            href="/"
            className="flex items-center select-none group"
          >
            <Image
              src="/locano-logo.png"
              alt="Locano Logo"
              width={200}
              height={60}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-[#10233f] hover:bg-slate-100 sm:hidden"
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        {/* NAVIGATION LINKS */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} absolute left-2 right-2 top-[calc(100%+0.5rem)] flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:static sm:flex sm:flex-row sm:items-center sm:gap-0.5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none text-xs sm:text-sm font-medium text-slate-700`}>
          <Link
            href={pathname === "/" ? "#hero" : "/"}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${isHomeActive ? activeCls : inactiveCls}`}
          >
            Home
          </Link>
          <Link
            href="/transport"
            className={`px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${isRoutesActive ? activeCls : inactiveCls}`}
          >
            Routes
          </Link>
          <Link
            href="/accommodation"
            className={`px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${
              pathname.startsWith("/accommodation") ? activeCls : inactiveCls
            }`}
          >
            Accommodation
          </Link>
          <Link
            href={pathname === "/" ? "#about" : "/about"}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${isAboutActive ? activeCls : inactiveCls}`}
          >
            About
          </Link>
        </div>

        {/* SIGN IN BUTTON */}
        <button
          type="button"
          onClick={openAccount}
          className="ml-1 px-2 sm:px-4 py-1.5 rounded-full bg-[#10233f] text-white hover:bg-[#1f6fe5] transition-colors text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
      </nav>
    </header>
  )
}
