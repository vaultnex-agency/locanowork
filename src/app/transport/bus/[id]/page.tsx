import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBus, segmentJourney, fullJourney, redirectedRoads, busRouteLabel } from "@/lib/bus-service"
import { formatMinutes, formatKm, indicativeFare, formatInr } from "@/lib/format"
import { RouteMap } from "@/components/RouteMap"
import { ArrowLeft, AlertCircle, ArrowRight, Info, Compass } from "lucide-react"

interface BusPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}

export async function generateMetadata({ params }: BusPageProps): Promise<Metadata> {
  const { id } = await params
  const bus = getBus(id)
  if (!bus) return { title: "Bus Route" }
  return {
    title: `Bus ${bus.number} · ${busRouteLabel(bus)}`,
    description: `Complete stops, indicative fare and estimated duration for Mangaluru city bus ${bus.number}.`,
  }
}

export default async function BusPage({ params, searchParams }: BusPageProps) {
  const { id } = await params
  const { from, to } = await searchParams

  const bus = getBus(id)
  if (!bus) {
    notFound()
  }

  // If ?from=&to= provided, limit to that segment
  const segment = from && to ? segmentJourney(bus, from, to) : null
  const journey = segment || fullJourney(bus)

  const otherRoads = redirectedRoads(bus)
  const fare = indicativeFare(journey.distanceKm)

  return (
    <div className="min-h-screen bg-[#f4f8fc] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* BREADCRUMB / BACK */}
        <div className="mb-6">
          <Link
            href="/transport"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1f6fe5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Bus Routes</span>
          </Link>
        </div>

        {/* HEADER CARD */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 locano-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#1f6fe5] text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 shrink-0">
                {bus.number}
              </div>
              <div>
                <div className="text-xs font-bold text-[#1f6fe5] uppercase tracking-wider">
                  Mangaluru City Bus
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233f] tracking-tight mt-0.5">
                  {busRouteLabel(bus)}
                </h1>
                {segment && (
                  <div className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium mt-1">
                    <Compass className="w-3 h-3" />
                    <span>Segment: {journey.from.name} → {journey.to.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* KEY STATS (NO CLOCK TIMES) */}
            <div className="flex items-center gap-6 text-center sm:text-right">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. Duration</div>
                <div className="text-xl font-extrabold text-[#10233f]">
                  {formatMinutes(journey.minutes)}
                </div>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Distance</div>
                <div className="text-xl font-extrabold text-[#10233f]">
                  {formatKm(journey.distanceKm)}
                </div>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Indicative Fare</div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {formatInr(fare)}
                </div>
              </div>
            </div>
          </div>

          {/* FARE NOTICE */}
          <div className="pt-4 flex items-center justify-end text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Indicative fare. Please confirm the bus and fare with the conductor before boarding.</span>
            </div>
          </div>
        </div>

        {/* REDIRECTED / MULTI-ROAD NOTICE */}
        {otherRoads.length > 0 && (
          <div className="p-5 bg-amber-50/80 rounded-3xl border border-amber-200/70 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="text-sm font-bold text-amber-900">
                  Alternative Road for Bus {bus.number}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Bus number {bus.number} runs on more than one corridor in Mangaluru. Check which road best matches your destination:
                </p>
                <div className="pt-1 flex flex-wrap gap-3">
                  {otherRoads.map((other) => (
                    <Link
                      key={other.bus.id}
                      href={`/transport/bus/${other.bus.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-amber-300 text-xs font-semibold text-[#10233f] hover:bg-amber-100/50 transition-colors shadow-2xs"
                    >
                      <span>Route via {other.onlyThere.slice(0, 2).join(", ") || other.bus.id}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1f6fe5]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP & STOP LIST GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* STOP LIST (LEFT 7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 locano-card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#10233f]">
                Stop-by-Stop List ({journey.stops.length} stops)
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {journey.reversed ? "Reverse direction" : "Standard direction"}
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100">
              {journey.stops.map((stop, idx) => {
                const isStart = idx === 0
                const isEnd = idx === journey.stops.length - 1

                return (
                  <div key={`${stop.id}-${idx}`} className="relative flex items-start gap-4 group">
                    {/* TIMELINE BULLET */}
                    <div
                      className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs transition-transform group-hover:scale-110 ${
                        isStart
                          ? "bg-[#1f6fe5] text-white ring-4 ring-blue-100"
                          : isEnd
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                          : "bg-white border-2 border-[#1f6fe5] text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* STOP INFO */}
                    <div className="flex-1">
                      <Link
                        href={`/transport/stop/${stop.id}`}
                        className="text-sm font-bold text-[#10233f] hover:text-[#1f6fe5] transition-colors inline-block"
                      >
                        {stop.name}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        {stop.area && stop.area !== stop.name && <span>Area: {stop.area}</span>}
                        {stop.landmark && <span>· Landmark: {stop.landmark}</span>}
                      </div>
                    </div>

                    <Link
                      href={`/transport/stop/${stop.id}`}
                      className="text-xs text-slate-400 hover:text-[#1f6fe5] p-1 transition-colors"
                      title="View all buses at this stop"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MAP DISPLAY (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 locano-card h-[460px] overflow-hidden">
              <RouteMap
                stops={journey.stops}
                fromId={journey.from.id}
                toId={journey.to.id}
              />
            </div>
            <div className="text-center text-xs text-slate-400">
              Pins mark stops in order along the route corridor.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
