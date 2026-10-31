"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useModal } from "@/context/ModalContext"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { signOutUser } from "@/lib/supabase/auth"
import type { UserRole } from "@/types/database"
import {
  Menu,
  User,
  X,
  ChevronDown,
  LogOut,
  Building2,
  GraduationCap,
  Store,
  Home,
  Utensils,
  Bus,
  Siren,
} from "lucide-react"

interface AuthProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  initial: string
}

export function Navbar() {
  const pathname = usePathname()
  const { openAccount } = useModal()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthProfile | null>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  const [activeSection, setActiveSection] = useState<"about" | null>(null)

  // Scroll listener
  useEffect(() => {
    let ticking = false
    let lastScrolled = false
    let lastActive: "about" | null = null

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 24
          if (scrolled !== lastScrolled) {
            lastScrolled = scrolled
            setIsScrolled(scrolled)
          }

          if (pathname === "/") {
            const el = document.getElementById("about")
            const isAbout = el ? el.getBoundingClientRect().top <= 150 : false
            const active = isAbout ? "about" : null
            if (active !== lastActive) {
              lastActive = active
              setActiveSection(active)
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  // Supabase Authentication state synchronization
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const loadUserProfile = async (sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      let fullName = (sessionUser.user_metadata?.full_name as string) || ""
      let role = (sessionUser.user_metadata?.role as UserRole) || "student"

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", sessionUser.id)
          .single()

        if (profile?.full_name) fullName = profile.full_name
        if (profile?.role) role = profile.role as UserRole
      } catch {
        // Fallback to metadata
      }

      const safeName = fullName.trim() || sessionUser.email?.split("@")[0] || "User"
      const initial = (safeName.charAt(0) || "U").toUpperCase()

      setAuthUser({
        id: sessionUser.id,
        email: sessionUser.email || "",
        fullName: safeName,
        role,
        initial,
      })
    }

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setAuthUser(null)
      }
    })

    // 2. Real-time auth listener (on login, refresh, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setAuthUser(null)
        setIsAccountDropdownOpen(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccountDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleSignOut = async () => {
    setIsAccountDropdownOpen(false)
    await signOutUser()
    setAuthUser(null)
  }

  const isAccommodationActive = pathname.startsWith("/accommodation")
  const isMessActive = pathname.startsWith("/mess")
  const isRoutesActive = pathname.startsWith("/transport")
  const isEssentialActive = pathname.startsWith("/emergency")
  const isAboutActive =
    pathname === "/about" ||
    (pathname === "/" && activeSection === "about")

  const activeCls = "text-[#1f6fe5] bg-[#e0efff] font-semibold"
  const inactiveCls = "text-slate-700 hover:text-[#1f6fe5] hover:bg-slate-100/60 font-medium"

  const isVendor = authUser?.role === "vendor"
  const isPgOwner = authUser?.role === "pg_owner"

  return (
    <header className="fixed top-3 left-0 right-0 z-40 flex justify-center px-2 sm:top-5 sm:px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto relative flex w-full max-w-none items-center gap-2 px-3 py-2.5 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 rounded-full border border-slate-200/60 pill-navbar transition-all duration-420 ${
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
              className="h-10 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden items-center gap-0.5 text-xs font-medium text-slate-700 sm:flex sm:gap-1 sm:text-sm">
          <Link
            href="/accommodation"
            onClick={closeMenu}
            className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isAccommodationActive ? activeCls : inactiveCls}`}
          >
            Accommodation
          </Link>
          <Link
            href="/mess"
            onClick={closeMenu}
            className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isMessActive ? activeCls : inactiveCls}`}
          >
            Food &amp; Mess
          </Link>
          <Link
            href="/transport"
            onClick={closeMenu}
            className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isRoutesActive ? activeCls : inactiveCls}`}
          >
            Transport
          </Link>
          <Link
            href="/emergency"
            onClick={closeMenu}
            className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isEssentialActive ? activeCls : inactiveCls}`}
          >
            Essential Services
          </Link>
          <Link
            href={pathname === "/" ? "#about" : "/about"}
            onClick={closeMenu}
            className={`px-2.5 py-1.5 rounded-full transition-colors sm:px-3 ${isAboutActive ? activeCls : inactiveCls}`}
          >
            About
          </Link>
        </div>

        {/* ACCOUNT CONTROL (AUTHENTICATED vs UNAUTHENTICATED) */}
        {authUser ? (
          <div className="relative ml-1" ref={accountDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
              aria-expanded={isAccountDropdownOpen}
              aria-label="User account menu"
              className="flex min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center gap-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 p-1 sm:pr-3 text-xs font-semibold text-[#10233f] transition-all cursor-pointer shadow-2xs"
            >
              {/* Circular Initial Badge */}
              <div
                className={`size-7 sm:size-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${
                  isVendor ? "bg-purple-600" : isPgOwner ? "bg-[#10233f]" : "bg-[#1f6fe5]"
                }`}
              >
                {authUser.initial}
              </div>

              {/* User Name with Truncation on Small Screens */}
              <span className="hidden xs:inline-block max-w-[80px] sm:max-w-[120px] truncate text-xs sm:text-sm text-[#10233f]">
                {authUser.fullName}
              </span>

              {/* Chevron */}
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform hidden xs:block ${
                  isAccountDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {isAccountDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+0.6rem)] w-60 sm:w-64 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs text-slate-700">
                {/* Header Section */}
                <div className="p-3 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                        isVendor ? "bg-purple-600" : isPgOwner ? "bg-[#10233f]" : "bg-[#1f6fe5]"
                      }`}
                    >
                      {authUser.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#10233f] truncate text-xs sm:text-sm">
                        {authUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {authUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="mt-2">
                    {isVendor ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Store className="size-3 text-purple-600" />
                        <span>Vendor Account</span>
                      </span>
                    ) : isPgOwner ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Building2 className="size-3 text-amber-600" />
                        <span>PG Owner Account</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1f6fe5] border border-blue-100">
                        <GraduationCap className="size-3 text-[#1f6fe5]" />
                        <span>Student Account</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Contextual Options */}
                <div className="space-y-0.5">
                  {isPgOwner ? (
                    <>
                      <Link
                        href="/pg-owner/submit"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Building2 className="size-3.5 text-[#1f6fe5]" />
                        <span>Submit PG Accommodation</span>
                      </Link>
                      <Link
                        href="/accommodation"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Home className="size-3.5 text-slate-400" />
                        <span>Browse Accommodations</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/accommodation"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Home className="size-3.5 text-[#1f6fe5]" />
                        <span>Find PGs &amp; Hostels</span>
                      </Link>
                      <Link
                        href="/mess"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Utensils className="size-3.5 text-orange-500" />
                        <span>Student Food &amp; Mess</span>
                      </Link>
                      <Link
                        href="/transport"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Bus className="size-3.5 text-emerald-500" />
                        <span>Transit Routes &amp; Buses</span>
                      </Link>
                      <Link
                        href="/emergency"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      >
                        <Siren className="size-3.5 text-rose-500" />
                        <span>Essential Services</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Sign Out Button */}
                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* UNAUTHENTICATED SIGN IN BUTTON */
          <button
            type="button"
            onClick={openAccount}
            className="ml-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#10233f] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1f6fe5] sm:min-h-0 sm:min-w-0 sm:justify-start sm:px-4 sm:py-1.5 sm:text-sm cursor-pointer"
          >
            <User className="size-3.5" />
            <span className="hidden sm:inline">Sign In</span>
            <span className="sr-only sm:hidden">Sign In</span>
          </button>
        )}

        {/* MOBILE MENU TOGGLE */}
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#10233f] transition-colors hover:bg-slate-100 sm:hidden cursor-pointer"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/95 p-2 shadow-lg backdrop-blur-md sm:hidden"
          >
            <Link
              href="/accommodation"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm ${isAccommodationActive ? activeCls : inactiveCls}`}
            >
              Accommodation
            </Link>
            <Link
              href="/mess"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm ${isMessActive ? activeCls : inactiveCls}`}
            >
              Food &amp; Mess
            </Link>
            <Link
              href="/transport"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm ${isRoutesActive ? activeCls : inactiveCls}`}
            >
              Transport
            </Link>
            <Link
              href="/emergency"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm ${isEssentialActive ? activeCls : inactiveCls}`}
            >
              Essential Services
            </Link>
            <Link
              href={pathname === "/" ? "#about" : "/about"}
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm ${isAboutActive ? activeCls : inactiveCls}`}
            >
              About
            </Link>
            {authUser?.role === "pg_owner" && (
              <Link
                href="/pg-owner/submit"
                onClick={closeMenu}
                className="rounded-xl px-4 py-2.5 text-sm text-[#1f6fe5] font-semibold bg-blue-50/70"
              >
                + Submit PG Listing
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
