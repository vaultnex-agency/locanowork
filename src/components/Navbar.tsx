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

  const closeMenu = () => setIsMenuOpen(false)
  const isHomeActive = pathname === "/" && activeSection === "hero"
  const isRoutesActive = pathname.startsWith("/transport")
  const isAboutActive =
    pathname === "/about" ||
    (pathname === "/" && activeSection === "about")
  const activeCls = "text-[#1f6fe5] bg-[#e0efff] font-semibold"
  const inactiveCls = "text-slate-700 hover:text-[#1f6fe5] hover:bg-slate-100/60 font-medium"

  return (
    <header className="fixed top-3 left-0 right-0 z-40 flex justify-center px-2 sm:top-5 sm:px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto relative flex w-full max-w-fit items-center gap-1 px-2 py-2 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 rounded-full border border-slate-200/60 pill-navbar transition-all duration-420 ${
          isScrolled
            ? "pill-navbar-scrolled bg-white/92 shadow-md shadow-slate-900/5"
            : "bg-white/80 backdrop-blur-md shadow-xs"
        }`}
      >
        {/* LOGO */}
        <div className="flex min-w-0 items-center mr-auto sm:mr-3">
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

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden items-center gap-0.5 text-xs font-medium text-slate-700 sm:flex sm:gap-1 sm:text-sm">
          <Link href={pathname === "/" ? "#hero" : "/"} onClick={closeMenu} className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isHomeActive ? activeCls : inactiveCls}`}>
            Home
          </Link>
          <Link href="/transport" onClick={closeMenu} className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isRoutesActive ? activeCls : inactiveCls}`}>
            Routes
          </Link>
          <Link href="/accommodation" onClick={closeMenu} className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${pathname.startsWith("/accommodation") ? activeCls : inactiveCls}`}>
            Accommodation
          </Link>
          <Link href="/mess" onClick={closeMenu} className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${pathname.startsWith("/mess") ? activeCls : inactiveCls}`}>
            Food &amp; Mess
          </Link>
          <Link href={pathname === "/" ? "#about" : "/about"} onClick={closeMenu} className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isAboutActive ? activeCls : inactiveCls}`}>
            About
          </Link>
        </div>

        {/* SIGN IN BUTTON */}
        <button type="button" onClick={openAccount} className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-[#10233f] px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1f6fe5] sm:px-4 sm:text-sm">
          <User className="size-3.5" />
          <span className="hidden sm:inline">Sign In</span>
          <span className="sr-only sm:hidden">Sign In</span>
        </button>

        <button type="button" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setIsMenuOpen((open) => !open)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#10233f] transition-colors hover:bg-slate-100 sm:hidden">
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {isMenuOpen && (
          <div id="mobile-navigation" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/95 p-2 shadow-lg backdrop-blur-md sm:hidden">
            <Link href={pathname === "/" ? "#hero" : "/"} onClick={closeMenu} className={`rounded-xl px-4 py-2.5 text-sm ${isHomeActive ? activeCls : inactiveCls}`}>Home</Link>
            <Link href="/transport" onClick={closeMenu} className={`rounded-xl px-4 py-2.5 text-sm ${isRoutesActive ? activeCls : inactiveCls}`}>Routes</Link>
            <Link href="/accommodation" onClick={closeMenu} className={`rounded-xl px-4 py-2.5 text-sm ${pathname.startsWith("/accommodation") ? activeCls : inactiveCls}`}>Accommodation</Link>
            <Link href="/mess" onClick={closeMenu} className={`rounded-xl px-4 py-2.5 text-sm ${pathname.startsWith("/mess") ? activeCls : inactiveCls}`}>Food &amp; Mess</Link>
            <Link href={pathname === "/" ? "#about" : "/about"} onClick={closeMenu} className={`rounded-xl px-4 py-2.5 text-sm ${isAboutActive ? activeCls : inactiveCls}`}>About</Link>
          </div>
        )}
      </nav>
    </header>
  )
}
