import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Bus, MapPin, Navigation, Shield, FileText, Info, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#041422] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* BRAND COLUMN */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/locano-logo.png"
                alt="Locano Logo"
                width={200}
                height={60}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Helping students and newcomers in Mangaluru find a city bus with ease. Search routes, check stops, and explore Karnataka&apos;s coastal educational hub.
            </p>
            <div className="text-[11px] text-slate-400">
              Mangaluru, Dakshina Kannada, Karnataka
            </div>
          </div>

          {/* TRANSPORT LINKS */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Bus Transport
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/transport"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Bus className="w-3.5 h-3.5 text-[#1f6fe5]" />
                  <span>Find a bus</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/transport/near"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stops near you</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/transport/route/balmatta-to-deralakatte"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Balmatta to Yenepoya</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/transport/route/state-bank-to-surathkal"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400"
                >
                  <span>State Bank to Surathkal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* STUDENT SERVICES */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Student Platform
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/accommodation"
                  className="hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="text-slate-300 group-hover:text-white">Accommodation &amp; PGs</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                    Explore
                  </span>
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span>Food & Mess finder</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Soon</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Part-time Student Jobs</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Soon</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Emergency Helplines</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Soon</span>
              </li>
            </ul>
          </div>

          {/* LEGAL & ABOUT */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              About & Privacy
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>About LOCANO</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM ATTRIBUTION */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} LOCANO Mangaluru. Fares and timings are indicative.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for students settling in Mangaluru</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  )
}
