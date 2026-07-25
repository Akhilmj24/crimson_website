import React, { useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import heritageImg from '../assets/business-card-banner.jpg'

gsap.registerPlugin(ScrollTrigger)

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in left column on scroll
      gsap.fromTo(
        leftColRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Fade in right column on scroll
      gsap.fromTo(
        rightColRef.current,
        { opacity: 0, x: 60, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-[#FAF7F2] py-20 md:py-28 overflow-hidden select-none"
    >
      {/* Background shape */}
      <div className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
          
          {/* Story Info Column (Left) */}
          <div ref={leftColRef} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                A Legacy of Authentic <br className="hidden sm:inline" />
                <span className="text-primary">Kerala Heritage</span>
              </h2>
            </div>

            <p className="text-sm md:text-base text-neutral-600 font-medium leading-relaxed">
              At Crimson, our journey began with a simple vision: to bring the authentic, rich culinary traditions of Kerala to snack lovers everywhere. We believe that true flavor is born from simplicity, patience, and uncompromising quality.
            </p>

            <p className="text-sm md:text-base text-neutral-600 font-medium leading-relaxed">
              Every single batch of our chips is handcrafted in Thiruvananthapuram, Kerala, following age-old recipes passed down through generations. We source the finest organic Nendran bananas directly from local farms, ensuring each chip is fried to perfection in 100% pure coconut oil.
            </p>

            {/* Quality Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Traditional Preparation</h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Fried in pure coconut oil mills</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">100% Raw Ingredients</h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Sourced from Kerala local farms</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">No Preservatives</h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Naturally preserved freshness</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Premium Standards</h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Hygiene-first packaging seal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Heritage Visual Column (Right) */}
          <div ref={rightColRef} className="relative flex justify-center">
            {/* Visual Box */}
            <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white p-4 shadow-soft border border-neutral-100/50">
              <img
                src={heritageImg}
                alt="Crimson Group LLP Logo and Heritage"
                className="w-full h-auto object-cover rounded-xl shadow-inner select-none pointer-events-none"
              />
              {/* Floating Tag */}
              <div className="absolute -bottom-5 -left-5 bg-primary text-white p-6 rounded-2xl shadow-premium hidden sm:block">
                <p className="font-display text-2xl font-bold">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-200 mt-1">
                  Authentic Taste
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
