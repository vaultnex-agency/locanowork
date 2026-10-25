import React from "react"
import { HomeHero } from "@/components/HomeHero"
import { AboutSection } from "@/components/AboutSection"

export default function HomePage() {
  return (
    <div className="relative">
      <HomeHero />
      <AboutSection />
    </div>
  )
}
