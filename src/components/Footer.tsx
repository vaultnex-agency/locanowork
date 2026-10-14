import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Bus, MapPin, Navigation, Shield, FileText, Info } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0b1626] text-slate-400 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* BRAND COLUMN */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/locano-logo.png"
                alt="Locano Logo"
                width={200}
                height={60}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Helping students and newcomers in Mangaluru find what they need.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-1 text-slate-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>


          {/* BUS TRANSPORT LINKS */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              BUS TRANSPORT
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/transport"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bus className="w-3.5 h-3.5 text-[#1f6fe5]" />
                  <span>Find a bus</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/transport/near"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stops near you</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/transport/route/balmatta-to-deralakatte"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Balmatta to Yenepoya</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* STUDENT PLATFORM */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              STUDENT PLATFORM
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/accommodation"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>Accommodation &amp; PGs</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/mess"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>Food &amp; Mess directory</span>
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span>Part-time Student Jobs</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                  Soon
                </span>
              </li>
            </ul>
          </div>

          {/* ABOUT & PRIVACY */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              ABOUT &amp; PRIVACY
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>About LOCANO</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM ATTRIBUTION */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2025 LOCANO. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>📍 Mangaluru, India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

