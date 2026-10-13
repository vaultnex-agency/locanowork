"use client"

import { useEffect, useRef } from "react"

export function HomeScroller() {
  const isAnimatingRef = useRef(false)
  const touchStartY = useRef(0)

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const sectionIds = ["hero", "about"]

    const getSections = () => {
      return sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
    }

    const smoothScrollTo = (targetY: number, duration = 880) => {
      if (isAnimatingRef.current) return
      isAnimatingRef.current = true

      const startY = window.scrollY
      const diff = targetY - startY
      if (Math.abs(diff) < 5) {
        isAnimatingRef.current = false
        return
      }

      const startTime = performance.now()

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(1, elapsed / duration)
        // Specified easing: 1 - (1 - t) ** 4
        const ease = 1 - Math.pow(1 - progress, 4)
        window.scrollTo(0, startY + diff * ease)

        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          isAnimatingRef.current = false
        }
      }

      requestAnimationFrame(step)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) {
        e.preventDefault()
        return
      }

      const sections = getSections()
      if (sections.length === 0) return

      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight

      // Find current section
      let currentIndex = 0
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop
        const height = sections[i].offsetHeight
        if (scrollY >= top - 80 && scrollY < top + height - 80) {
          currentIndex = i
          break
        }
      }

      const currentSection = sections[currentIndex]
      const sectionTop = currentSection.offsetTop
      const sectionHeight = currentSection.offsetHeight

      // If inside a tall section, let it scroll normally unless near the edge
      const isNearTopEdge = scrollY <= sectionTop + 60
      const isNearBottomEdge = scrollY + viewportHeight >= sectionTop + sectionHeight - 60

      if (e.deltaY > 20 && isNearBottomEdge && currentIndex < sections.length - 1) {
        e.preventDefault()
        const nextSection = sections[currentIndex + 1]
        smoothScrollTo(nextSection.offsetTop)
      } else if (e.deltaY < -20 && isNearTopEdge && currentIndex > 0) {
        e.preventDefault()
        const prevSection = sections[currentIndex - 1]
        smoothScrollTo(prevSection.offsetTop)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimatingRef.current) return
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) {
        const sections = getSections()
        if (sections.length === 0) return

        const scrollY = window.scrollY
        let currentIndex = 0
        for (let i = 0; i < sections.length; i++) {
          if (scrollY >= sections[i].offsetTop - 100) {
            currentIndex = i
          }
        }

        if ((e.key === "ArrowDown" || e.key === "PageDown") && currentIndex < sections.length - 1) {
          e.preventDefault()
          smoothScrollTo(sections[currentIndex + 1].offsetTop)
        } else if ((e.key === "ArrowUp" || e.key === "PageUp") && currentIndex > 0) {
          e.preventDefault()
          smoothScrollTo(sections[currentIndex - 1].offsetTop)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return
      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY.current - touchEndY

      const sections = getSections()
      if (sections.length === 0) return

      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight

      let currentIndex = 0
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop
        const height = sections[i].offsetHeight
        if (scrollY >= top - 80 && scrollY < top + height - 80) {
          currentIndex = i
          break
        }
      }

      const currentSection = sections[currentIndex]
      const isNearBottomEdge = scrollY + viewportHeight >= currentSection.offsetTop + currentSection.offsetHeight - 60
      const isNearTopEdge = scrollY <= currentSection.offsetTop + 60

      if (deltaY > 60 && isNearBottomEdge && currentIndex < sections.length - 1) {
        smoothScrollTo(sections[currentIndex + 1].offsetTop)
      } else if (deltaY < -60 && isNearTopEdge && currentIndex > 0) {
        smoothScrollTo(sections[currentIndex - 1].offsetTop)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return null
}
