import React, { useEffect, useRef } from 'react'
import { TheyyamVector } from './vectors/TheyyamVector'
import { KeralaHouseVector } from './vectors/KeralaHouseVector'
import { HouseboatVector } from './vectors/HouseboatVector'
import { ElephantVector } from './vectors/ElephantVector'
import { LandscapeVector } from './vectors/LandscapeVector'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const BackgroundManager: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.bg-watermark') as HTMLElement[]
      
      items.forEach((item) => {
        const direction = item.dataset.direction === 'left' ? -1 : 1
        const speed = parseFloat(item.dataset.speed || '1')
        
        gsap.fromTo(
          item,
          { y: 0, rotate: 0 },
          {
            y: 100 * speed,
            rotate: 15 * direction * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Cultural Vector Watermarks distributed down the page */}
      
      {/* 1. Theyyam Mask - Top Left near Hero/About */}
      <div
        className="bg-watermark absolute left-[-60px] sm:left-[-20px] md:left-4 top-[12%] w-[180px] sm:w-[240px] md:w-[320px] opacity-[0.035] transition-opacity duration-300 hover:opacity-[0.08]"
        data-direction="left"
        data-speed="0.8"
      >
        <TheyyamVector />
      </div>

      {/* 2. Houseboat - Mid-Right near About/WhyChoose */}
      <div
        className="bg-watermark absolute right-[-60px] sm:right-[-20px] md:right-4 top-[28%] w-[200px] sm:w-[260px] md:w-[360px] opacity-[0.035] transition-opacity duration-300 hover:opacity-[0.08]"
        data-direction="right"
        data-speed="1.2"
      >
        <HouseboatVector />
      </div>

      {/* 3. Elephant - Mid-Left near Products */}
      <div
        className="bg-watermark absolute left-[-70px] sm:left-[-30px] md:left-2 top-[48%] w-[190px] sm:w-[250px] md:w-[340px] opacity-[0.03] transition-opacity duration-300 hover:opacity-[0.08]"
        data-direction="left"
        data-speed="0.9"
      >
        <ElephantVector />
      </div>

      {/* 4. Nalukettu House - Mid-Right near Process/Gallery */}
      <div
        className="bg-watermark absolute right-[-60px] sm:right-[-20px] md:right-6 top-[68%] w-[180px] sm:w-[240px] md:w-[320px] opacity-[0.035] transition-opacity duration-300 hover:opacity-[0.08]"
        data-direction="right"
        data-speed="1.1"
      >
        <KeralaHouseVector />
      </div>

      {/* 5. Landscape - Bottom Left near FAQ/Contact */}
      <div
        className="bg-watermark absolute left-[-60px] sm:left-[-20px] md:left-4 top-[84%] w-[220px] sm:w-[280px] md:w-[380px] opacity-[0.035] transition-opacity duration-300 hover:opacity-[0.08]"
        data-direction="left"
        data-speed="0.75"
      >
        <LandscapeVector />
      </div>
    </div>
  )
}
