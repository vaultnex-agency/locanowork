import React from "react"
import { HomeHero } from "@/components/HomeHero"
import { DockingSearch } from "@/components/DockingSearch"
import { HomeScroller } from "@/components/HomeScroller"
import { SettlementJourney } from "@/components/SettlementJourney"
import { AboutSection } from "@/components/AboutSection"

export default function HomePage() {
  return (
    <div className="relative">
      <DockingSearch />
      <HomeHero />
      <HomeScroller />
      <SettlementJourney />
      <AboutSection />
    </div>
  )
}
