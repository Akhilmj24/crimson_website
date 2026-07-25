import React, { useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import bananaChipsImg from '../assets/product-banana-chips.png'
import sharkaraUpperiImg from '../assets/product-sharkara-upperi.png'

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
      className="relative bg-transparent py-20 md:py-28 overflow-hidden select-none"
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
          <div ref={rightColRef} className="relative flex justify-center items-center h-[350px] sm:h-[450px] w-full max-w-[500px]">
            {/* Golden ambient background circle */}
            <div className="absolute h-[250px] w-[250px] sm:h-[350px] sm:w-[350px] rounded-full bg-secondary/15 blur-2xl z-0" />
            
            {/* Layered Product 1: Sharkara Upperi (Behind, slightly tilted left) */}
            <div className="absolute left-[5%] bottom-[10%] w-[150px] sm:w-[200px] z-10 rotate-[-12deg] drop-shadow-[0_15px_30px_rgba(153,15,2,0.15)] transition-transform duration-500 hover:rotate-[-6deg] hover:scale-105">
              <img
                src={sharkaraUpperiImg}
                alt="Crimson Sharkara Upperi Packaging"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
            
            {/* Layered Product 2: Banana Chips (Front, slightly tilted right) */}
            <div className="absolute right-[5%] top-[10%] w-[150px] sm:w-[200px] z-20 rotate-[8deg] drop-shadow-[0_20px_40px_rgba(153,15,2,0.2)] transition-transform duration-500 hover:rotate-[3deg] hover:scale-105">
              <img
                src={bananaChipsImg}
                alt="Crimson Banana Chips Packaging"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
            
            {/* Rotating Seal Badge */}
            <div className="absolute bottom-[5%] right-[5%] sm:right-[10%] z-30 bg-primary text-white h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-premium flex items-center justify-center p-1.5 text-center animate-[spin_20s_linear_infinite]">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  id="textPath"
                  d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="fill-white text-[9.5px] font-bold tracking-[1.5px]">
                  <textPath href="#textPath" startOffset="0%">
                    * PURE COCONUT OIL * 100% NATURAL
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-secondary">
                Crimson
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
