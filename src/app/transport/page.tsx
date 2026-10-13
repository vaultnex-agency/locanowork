import type { Metadata } from "next"
import { TransportHero } from "@/components/TransportHero"
import { RoutesSection } from "@/components/RoutesSection"

export const metadata: Metadata = {
  title: "Bus Routes & Transport Search",
  description: "Search Mangaluru city bus routes, bus numbers, timings, stops, and view the complete route directory.",
}

export default function TransportPage() {
  return (
    <div>
      <TransportHero />
      <RoutesSection isFullPage={false} />
    </div>
  )
}
