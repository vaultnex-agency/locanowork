import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { fetchAccommodationById } from "@/lib/services/accommodation"
import { DEMO_DISCLAIMER_TEXT } from "@/data/mock-pgs"
import { EnquiryPreviewButton } from "@/components/EnquiryPreviewButton"
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Home,
  Sparkles,
  Info,
  ShieldCheck,
} from "lucide-react"

interface AccommodationPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: AccommodationPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchAccommodationById(id)
  if (!listing) return { title: "Accommodation Not Found" }
  return {
    title: `${listing.name} · ${listing.area}`,
    description: `${listing.tagline} — ${listing.gender} ${listing.type} in ${listing.area}, Mangaluru.`,
  }
}

export default async function AccommodationDetailPage({
  params,
}: AccommodationPageProps) {
  const { id } = await params
  const listing = await fetchAccommodationById(id)

  if (!listing) {
    notFound()
  }

  const genderBadgeClass =
    listing.gender === "Girls"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : listing.gender === "Boys"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200"

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            href="/accommodation"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Accommodations</span>
          </Link>
        </div>

        {/* DEMO NOTICE BANNER */}
        {listing.isDemo && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 locano-card shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Preview Notice:</span> {DEMO_DISCLAIMER_TEXT}
            </div>
          </div>
        )}

        {/* MAIN PROPERTY HEADER CARD */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${genderBadgeClass}`}
                >
                  {listing.gender}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {listing.type}
                </span>
                {listing.isDemo ? (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Demo Listing
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Property</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#10233f] tracking-tight">
                {listing.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                {listing.tagline}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-[#1f6fe5] shrink-0" />
                <span className="font-semibold text-slate-800">{listing.area}</span>
                <span className="text-slate-400">· {listing.approximateLocation}</span>
                <span className="text-slate-400">({listing.nearestLandmark})</span>
              </div>
            </div>

            {/* PRICING STAT */}
            <div className="lg:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Indicative Rent
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10233f]">
                ₹{listing.monthlyRentFrom.toLocaleString("en-IN")}
                <span className="text-xs sm:text-sm font-normal text-slate-500"> /month</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Deposit: ₹{listing.securityDeposit.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* VISUAL ASSET / SAMPLE BANNER */}
          <div className="mt-6 relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <Image
              src={listing.sampleImage}
              alt={listing.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
              <div className="text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Fictional Sample Image
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-100">
                  Representative coastal student residency visual
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: OVERVIEW, AMENITIES, SHARING OPTIONS */}
          <div className="lg:col-span-8 space-y-8">
            {/* OVERVIEW */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#1f6fe5]" />
                <span>About this Residence</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* SHARING OPTIONS & PRICING */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Home className="w-4 h-4 text-[#1f6fe5]" />
                <span>Room Sharing Configurations</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.sharingOptions.map((option) => (
                  <div
                    key={option}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-[#10233f]">{option}</span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      Sample Plan
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AMENITIES */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1f6fe5]" />
                <span>Property Amenities</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#1f6fe5] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROOM FEATURES & RULES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
                <h3 className="text-sm font-bold text-[#10233f] uppercase tracking-wider">
                  Room Features
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {listing.roomFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1f6fe5]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
                <h3 className="text-sm font-bold text-[#10233f] uppercase tracking-wider">
                  House Guidelines
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {listing.houseRules.map((rule) => (
                    <li key={rule} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION & SUMMARY CARD */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 locano-card shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Rent
                </span>
                <span className="text-xl font-extrabold text-[#10233f]">
                  ₹{listing.monthlyRentFrom.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{listing.securityDeposit.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Food Service:</span>
                  <span className="font-semibold text-slate-800">{listing.foodOption}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notice Period:</span>
                  <span className="font-semibold text-slate-800">
                    {listing.noticePeriodDays} days
                  </span>
                </div>
              </div>

              {/* ENQUIRY PREVIEW BUTTON */}
              <div className="pt-2">
                <EnquiryPreviewButton listingName={listing.name} listingId={listing.id} />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Notice:</span> Sample listing. Real owner contact details and live booking will be enabled when full backend integration launches.
              </div>
            </div>

            {/* TRANSIT CONNECTION NOTICE */}
            <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-[#10233f] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1f6fe5]" />
                <span>Transit Connectivity</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All accommodations in {listing.area} connect to central Mangaluru via local bus routes.
              </p>
              <Link
                href="/transport"
                className="inline-flex items-center gap-1 text-[#1f6fe5] font-semibold hover:underline text-[11px] pt-1"
              >
                <span>Check bus routes to {listing.area} →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
