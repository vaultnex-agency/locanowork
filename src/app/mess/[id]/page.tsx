import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getMessById, DEMO_DISCLAIMER_TEXT } from "@/data/mock-messes"
import { EnquiryPreviewButton } from "@/components/EnquiryPreviewButton"
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Clock,
  Sparkles,
  Info,
  Calendar,
  ShieldCheck,
  Coffee,
} from "lucide-react"

interface MessPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: MessPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = getMessById(id)
  if (!listing) return { title: "Mess Provider Not Found" }
  return {
    title: `${listing.name} · ${listing.area}`,
    description: `${listing.tagline} — ${listing.dietary} ${listing.cuisine} student mess in ${listing.area}, Mangaluru.`,
  }
}

export default async function MessDetailPage({ params }: MessPageProps) {
  const { id } = await params
  const listing = getMessById(id)

  if (!listing) {
    notFound()
  }

  const dietaryBadgeClass =
    listing.dietary === "Pure Veg"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-800 border-amber-200"

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            href="/mess"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#ea580c] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Messes &amp; Tiffins</span>
          </Link>
        </div>

        {/* DEMO NOTICE BANNER */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 locano-card shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Preview Notice:</span> {DEMO_DISCLAIMER_TEXT}
          </div>
        </div>

        {/* MAIN PROVIDER HEADER CARD */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${dietaryBadgeClass}`}
                >
                  {listing.dietary}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {listing.serviceType}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200/60">
                  {listing.cuisine}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Demo Listing
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#10233f] tracking-tight">
                {listing.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                {listing.tagline}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-[#ea580c] shrink-0" />
                <span className="font-semibold text-slate-800">{listing.area}</span>
                <span className="text-slate-400">· {listing.approximateLocation}</span>
                <span className="text-slate-400">({listing.nearestLandmark})</span>
              </div>
            </div>

            {/* PRICING STAT */}
            <div className="lg:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Monthly Pass From
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10233f]">
                ₹{listing.monthlyPriceFrom.toLocaleString("en-IN")}
                <span className="text-xs sm:text-sm font-normal text-slate-500"> /month</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Walk-in single meal: ₹{listing.perMealPriceFrom}
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
                <div className="text-xs font-semibold uppercase tracking-wider text-orange-300">
                  Fictional Sample Image
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-100">
                  Representative Mangaluru student dining &amp; tiffin visual
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: OVERVIEW, PLANS, MENU, HIGHLIGHTS */}
          <div className="lg:col-span-8 space-y-8">
            {/* OVERVIEW */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#ea580c]" />
                <span>About this Mess Service</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* MEAL PLANS & PRICING */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#ea580c]" />
                  <span>Meal Plans &amp; Subscriptions</span>
                </h2>
                <span className="text-xs text-slate-400">Sample rates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {listing.mealPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      plan.popular
                        ? "border-[#ea580c]/50 bg-orange-50/30"
                        : "border-slate-200/80 bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#10233f]">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold text-[#ea580c] bg-orange-100/80 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {plan.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 capitalize">
                        {plan.period === "month"
                          ? "Monthly"
                          : plan.period === "15-days"
                          ? "15-Day Pass"
                          : "Per Meal"}
                      </span>
                      <span className="text-base font-extrabold text-[#10233f]">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DAILY MENU SAMPLE */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#ea580c]" />
                <span>Sample Daily Menu</span>
              </h2>
              <div className="space-y-3">
                {listing.dailyMenuSample.breakfast && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Breakfast</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-3.5">
                      {listing.dailyMenuSample.breakfast}
                    </p>
                  </div>
                )}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Lunch</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-3.5">
                    {listing.dailyMenuSample.lunch}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Dinner</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-3.5">
                    {listing.dailyMenuSample.dinner}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMINGS & HIGHLIGHTS */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ea580c]" />
                <span>Service Hours &amp; Meal Timings</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {listing.timings.breakfast && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Breakfast
                    </div>
                    <div className="text-xs font-bold text-[#10233f]">
                      {listing.timings.breakfast}
                    </div>
                  </div>
                )}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Lunch
                  </div>
                  <div className="text-xs font-bold text-[#10233f]">
                    {listing.timings.lunch}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Dinner
                  </div>
                  <div className="text-xs font-bold text-[#10233f]">
                    {listing.timings.dinner}
                  </div>
                </div>
              </div>
            </div>

            {/* HIGHLIGHTS & KITCHEN STANDARDS */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card space-y-4">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ea580c]" />
                <span>Highlights &amp; Hygiene Standards</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[...listing.highlights, ...listing.kitchenFeatures].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBSCRIPTION GUIDELINES */}
            <div className="p-6 bg-white rounded-3xl border border-slate-100 locano-card space-y-3">
              <h3 className="text-sm font-bold text-[#10233f] uppercase tracking-wider">
                Subscription Guidelines &amp; Policies
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {listing.subscriptionRules.map((rule) => (
                  <li key={rule} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION & SUMMARY SIDEBAR */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 locano-card shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Pass
                </span>
                <span className="text-xl font-extrabold text-[#10233f]">
                  ₹{listing.monthlyPriceFrom.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Single Meal Rate:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{listing.perMealPriceFrom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dietary Type:</span>
                  <span className="font-semibold text-slate-800">{listing.dietary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span className="font-semibold text-slate-800">{listing.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuisine:</span>
                  <span className="font-semibold text-slate-800">{listing.cuisine}</span>
                </div>
              </div>

              {/* ENQUIRY PREVIEW BUTTON */}
              <div className="pt-2">
                <EnquiryPreviewButton
                  listingName={listing.name}
                  category="mess"
                  buttonText="Enquire for Mess Pass (Preview Only)"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Notice:</span> Sample mess listing. Live mess manager contact and online pass purchase will be enabled when full backend integration launches.
              </div>
            </div>

            {/* TRANSIT CONNECTION NOTICE */}
            <div className="p-5 rounded-3xl bg-orange-50/70 border border-orange-100 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-[#10233f] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Transit Connectivity</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This mess in {listing.area} is easily reachable from major colleges via Mangaluru local buses.
              </p>
              <Link
                href="/transport"
                className="inline-flex items-center gap-1 text-[#ea580c] font-semibold hover:underline text-[11px] pt-1"
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
