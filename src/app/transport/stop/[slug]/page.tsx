import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getStop, busesThroughStop, busRouteLabel, stopNames } from "@/lib/bus-service"
import { RouteMap } from "@/components/RouteMap"
import { MapPin, Bus, ArrowRight, ArrowLeft, Navigation } from "lucide-react"

interface StopPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: StopPageProps): Promise<Metadata> {
  const { slug } = await params
  const stop = getStop(slug)
  if (!stop) return { title: "Bus Stop" }
  return {
    title: `${stop.name} Bus Stop`,
    description: `Every Mangaluru city bus that stops at ${stop.name} (${stop.area}).`,
  }
}

export default async function StopPage({ params }: StopPageProps) {
  const { slug } = await params
  const stop = getStop(slug)
  if (!stop) {
    notFound()
  }

  const passingBuses = busesThroughStop(stop.id)

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            href="/transport"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Routes</span>
          </Link>
        </div>

        {/* STOP HEADER CARD */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1f6fe5] flex items-center justify-center shrink-0 border border-blue-100">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1f6fe5] uppercase tracking-wider">
                  Mangaluru Bus Stop
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f] tracking-tight mt-0.5">
                  {stop.name}
                </h1>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  {stop.area && <span className="font-medium text-slate-700">Area: {stop.area}</span>}
                  {stop.landmark && <span>· Landmark: {stop.landmark}</span>}
                  {stop.aliases.length > 0 && (
                    <span className="text-xs text-slate-400">
                      (Also known as: {stop.aliases.join(", ")})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/transport/near`}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-[#1f6fe5] transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>Find Nearby</span>
              </Link>
            </div>
          </div>
        </div>

        {/* GRID: BUSES & MAP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* BUSES LIST (LEFT 7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10233f] flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#1f6fe5]" />
                <span>Buses Stopping Here ({passingBuses.length})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {passingBuses.map((bus) => {
                const label = busRouteLabel(bus)
                const intermediate = bus.stops.slice(1, -1)
                const keyStops = stopNames(intermediate).slice(0, 3).join(" · ")

                return (
                  <Link
                    key={bus.id}
                    href={`/transport/bus/${bus.id}`}
                    className="block p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 locano-card locano-card-interactive group transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1f6fe5] font-extrabold flex items-center justify-center text-sm border border-blue-100 group-hover:bg-[#1f6fe5] group-hover:text-white transition-colors shrink-0">
                          {bus.number}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#10233f] group-hover:text-[#1f6fe5] transition-colors">
                            {label}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Via: {keyStops || "Direct"}
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-400 group-hover:text-[#1f6fe5] transition-colors shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )
              })}

              {passingBuses.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
                  No direct bus services currently cataloged through this stop.
                </div>
              )}
            </div>
          </div>

          {/* MAP (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 locano-card h-[380px] overflow-hidden">
              <RouteMap stops={[stop]} />
            </div>
            <div className="text-center text-xs text-slate-400">
              Stop coordinates: {stop.lat.toFixed(4)}° N, {stop.lng.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
