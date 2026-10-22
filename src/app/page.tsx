import React from "react"
import { HomeHero } from "@/components/HomeHero"
import { AboutSection } from "@/components/AboutSection"
import { HomeScroller } from "@/components/HomeScroller"
import { EmergencyServicesSection } from "@/components/EmergencyServicesSection"

export default function HomePage() {
  return (
    <div className="relative">
      <HomeHero />
      <AboutSection />
      <EmergencyServicesSection />
      <HomeScroller />
    </div>
  )
}
