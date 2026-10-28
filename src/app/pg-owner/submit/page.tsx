"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Building2,
  ArrowLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Info,
} from "lucide-react"
import { submitAccommodationListing, SubmitAccommodationInput } from "@/lib/services/accommodation"
import type { AccommodationType, GenderPreference } from "@/types/accommodation"

const COMMON_AREAS = [
  "Kadri",
  "Balmatta",
  "Kottara",
  "Kankanady",
  "Bejai",
  "Deralakatte",
  "Falnir",
  "Hampankatta",
  "Surathkal",
  "Urwa",
]

const AMENITY_OPTIONS = [
  "High-speed Wi-Fi",
  "Power Backup",
  "24/7 Water Supply",
  "Pure Drinking Water (RO)",
  "Washing Machine",
  "CCTV Security",
  "Daily Housekeeping",
  "Solar Water Heater",
  "Biometric Access",
  "Two-wheeler Parking",
]

const ROOM_FEATURE_OPTIONS = [
  "Study Table & Chair",
  "Wardrobe / Cupboard",
  "Attached Bathroom",
  "Ceiling Fan",
  "Air Conditioner (AC)",
  "Orthopedic Mattress",
  "Balcony",
]

export default function PgOwnerSubmitPage() {
  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const type: AccommodationType = "PG"
  const [gender, setGender] = useState<GenderPreference>("Boys")
  const [area, setArea] = useState("Kadri")
  const [customArea, setCustomArea] = useState("")
  const [approximateLocation, setApproximateLocation] = useState("")
  const [nearestLandmark, setNearestLandmark] = useState("")
  const [monthlyRentFrom, setMonthlyRentFrom] = useState<number | "">("")
  const [securityDeposit, setSecurityDeposit] = useState<number | "">("")
  const [sharingOptions, setSharingOptions] = useState<string[]>(["Single Room", "Double Sharing"])
  const [amenities, setAmenities] = useState<string[]>([
    "High-speed Wi-Fi",
    "Power Backup",
    "24/7 Water Supply",
  ])
  const [roomFeatures, setRoomFeatures] = useState<string[]>([
    "Study Table & Chair",
    "Wardrobe / Cupboard",
  ])
  const [houseRules, setHouseRules] = useState<string>(
    "Gate closing time: 10:00 PM\nVisitors allowed in lounge only\nNo smoking or alcohol on premises"
  )
  const [foodOption, setFoodOption] = useState("Included (3 meals)")
  const [noticePeriodDays, setNoticePeriodDays] = useState(30)
  const [description, setDescription] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submittedListingId, setSubmittedListingId] = useState<string | null>(null)
  const [infoNotice, setInfoNotice] = useState("")

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfoNotice("")

    if (!name.trim()) {
      setError("Please enter the property name.")
      return
    }

    const finalArea = area === "Other" ? customArea.trim() : area
    if (!finalArea) {
      setError("Please select or enter the property area.")
      return
    }

    if (!monthlyRentFrom || Number(monthlyRentFrom) <= 0) {
      setError("Please specify a valid monthly starting rent.")
      return
    }

    setIsLoading(true)

    const payload: SubmitAccommodationInput = {
      name: name.trim(),
      tagline: tagline.trim() || `Clean & comfortable ${gender} ${type} in ${finalArea}`,
      type,
      gender,
      area: finalArea,
      approximateLocation: approximateLocation.trim() || `${finalArea} vicinity`,
      nearestLandmark: nearestLandmark.trim() || `Near ${finalArea} central stop`,
      monthlyRentFrom: Number(monthlyRentFrom),
      securityDeposit: Number(securityDeposit) || Number(monthlyRentFrom) * 2,
      sharingOptions,
      amenities,
      roomFeatures,
      houseRules: houseRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      foodOption,
      noticePeriodDays,
      description:
        description.trim() ||
        `${name} offers quality student accommodation in ${finalArea}, Mangaluru with essential facilities and home-style environment.`,
    }

    try {
      const res = await submitAccommodationListing(payload)
      if (res.success) {
        setSubmissionSuccess(true)
        setSubmittedListingId(res.listingId || null)
      } else {
        if (res.message.includes("not yet configured")) {
          // Informative demonstration mode
          setInfoNotice(res.message)
          setSubmissionSuccess(true)
        } else {
          setError(res.message)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            href="/accommodation"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Accommodations</span>
          </Link>
        </div>

        {/* PENDING APPROVAL CONFIRMATION SCREEN */}
        {submissionSuccess ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 locano-card shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>STATUS: PENDING ADMIN APPROVAL</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f]">
                Listing Submitted for Review!
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Thank you for submitting <strong>{name}</strong>. In accordance with Locano quality standards, all property listings undergo admin verification before publication.
              </p>
            </div>

            {/* PROCESS STEPS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1f6fe5] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-800">Admin Notification Sent:</strong> The Locano management team has received your submission details.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1f6fe5] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-800">Manual Verification Contact:</strong> An administrator will contact you via phone or email to confirm property details, pricing, and rules.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1f6fe5] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-800">Public Activation:</strong> Once approved in the Locano Admin Portal, your listing will be published and visible to students across Mangaluru.
                </div>
              </div>
            </div>

            {infoNotice && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-[#1f6fe5] mb-1">
                  <Info className="w-4 h-4" />
                  <span>Architecture Note</span>
                </div>
                <p>{infoNotice}</p>
              </div>
            )}

            {/* SUBMITTED SUMMARY SNIPPET */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Property:</span>
                <span className="font-bold text-slate-800">{name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Area:</span>
                <span className="font-semibold text-slate-800">{area === "Other" ? customArea : area}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Rent Starting:</span>
                <span className="font-bold text-emerald-700">₹{Number(monthlyRentFrom).toLocaleString("en-IN")}/mo</span>
              </div>
              {submittedListingId && (
                <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-100">
                  <span>Reference ID:</span>
                  <span>{submittedListingId}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/accommodation"
                className="flex-1 py-3 px-6 rounded-full bg-[#10233f] text-white font-bold text-xs hover:bg-[#1f6fe5] transition-colors text-center"
              >
                Return to Accommodations
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(false)
                  setName("")
                  setMonthlyRentFrom("")
                }}
                className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        ) : (
          /* SUBMISSION FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 locano-card shadow-xl">
            {/* FORM HEADER */}
            <div className="mb-8 pb-6 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1f6fe5] mb-2.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>PG OWNER PORTAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f]">
                Submit Property for Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                List your student PG, hostel, or flat on LOCANO. All submissions remain pending until verified by our admin team.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: BASIC DETAILS */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Property Overview
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenfield Boys PG"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagline / One-line Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spacious student living with quiet study areas near Kadri"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PG Type
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderPreference)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  >
                    <option value="Boys">Boys PG</option>
                    <option value="Girls">Girls PG</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Location in Mangaluru
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Student Area *
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    >
                      {COMMON_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                      <option value="Other">Other Area</option>
                    </select>
                  </div>

                  {area === "Other" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter Custom Area *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Konaje, Bondel"
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Kadri Hills / Park"
                      value={nearestLandmark}
                      onChange={(e) => setNearestLandmark(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approximate Location / Street
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kadri Temple Road vicinity"
                    value={approximateLocation}
                    onChange={(e) => setApproximateLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exact door number is kept private until student inquiry verification.
                  </p>
                </div>
              </div>

              {/* SECTION 3: RENT & SHARING */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. Pricing &amp; Sharing Options
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Rent Starting From (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      placeholder="e.g. 6500"
                      value={monthlyRentFrom}
                      onChange={(e) =>
                        setMonthlyRentFrom(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 13000"
                      value={securityDeposit}
                      onChange={(e) =>
                        setSecurityDeposit(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Available Sharing Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Single Room", "Double Sharing", "Triple Sharing", "Four Sharing"].map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleItem(sharingOptions, setSharingOptions, opt)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                            sharingOptions.includes(opt)
                              ? "bg-[#1f6fe5] text-white border-[#1f6fe5]"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Food Option
                    </label>
                    <select
                      value={foodOption}
                      onChange={(e) => setFoodOption(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    >
                      <option value="Included (3 meals)">Included (3 meals)</option>
                      <option value="Optional / Available">Optional / Available</option>
                      <option value="Self-cooking only">Self-cooking only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: AMENITIES & RULES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4. Amenities &amp; Features
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Property Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_OPTIONS.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleItem(amenities, setAmenities, amenity)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          amenities.includes(amenity)
                            ? "bg-[#10233f] text-white border-[#10233f]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Room Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_FEATURE_OPTIONS.map((rf) => (
                      <button
                        key={rf}
                        type="button"
                        onClick={() => toggleItem(roomFeatures, setRoomFeatures, rf)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          roomFeatures.includes(rf)
                            ? "bg-[#10233f] text-white border-[#10233f]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {rf}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    House Rules (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={houseRules}
                    onChange={(e) => setHouseRules(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your student residence, cleanliness, atmosphere, proximity to colleges..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1f6fe5]"
                  />
                </div>
              </div>

              {/* ADMIN APPROVAL DISCLOSURE */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Verification Policy:</strong> Submitting this form does not immediately publish your listing. The Locano admin team will inspect and verify your listing, contact you directly, and approve it before public activation.
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#1f6fe5] text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Submitting for verification...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit PG for Admin Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
