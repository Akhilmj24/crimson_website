import React, { useEffect, useRef } from 'react'
import { ArrowDown, MessageSquare } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONTACT_DETAILS } from '../constants'
import mainPackage from '../assets/product-banana-chips.png'

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subTextRef = useRef<HTMLParagraphElement>(null)
  const buttonGroupRef = useRef<HTMLDivElement>(null)
  const packageRef = useRef<HTMLDivElement>(null)
  
  const chip1Ref = useRef<HTMLDivElement>(null)
  const chip2Ref = useRef<HTMLDivElement>(null)
  const chip3Ref = useRef<HTMLDivElement>(null)
  const chip4Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Entrance animations
    const ctx = gsap.context(() => {
      // Reveal text
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      )
      
      gsap.fromTo(
        subTextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 }
      )
      
      gsap.fromTo(
        buttonGroupRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.7 }
      )

      // Package reveal
      gsap.fromTo(
        packageRef.current,
        { opacity: 0, scale: 0.8, rotate: -10 },
        { opacity: 1, scale: 1, rotate: 5, duration: 1.5, ease: 'elastic.out(1, 0.75)', delay: 0.4 }
      )

      // Floating chips entrance
      const chips = [chip1Ref.current, chip2Ref.current, chip3Ref.current, chip4Ref.current]
      chips.forEach((chip, i) => {
        if (chip) {
          gsap.fromTo(
            chip,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)', delay: 0.9 + i * 0.1 }
          )
        }
      })

      // Parallax scroll effect
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const scroll = self.progress
          
          // Parallax package shifting
          if (packageRef.current) {
            gsap.set(packageRef.current, { y: scroll * 150, rotate: 5 + scroll * 15 })
          }
          
          // Parallax chips
          if (chip1Ref.current) gsap.set(chip1Ref.current, { y: scroll * -120, x: scroll * 40, rotate: scroll * 90 })
          if (chip2Ref.current) gsap.set(chip2Ref.current, { y: scroll * 80, x: scroll * -50, rotate: scroll * -60 })
          if (chip3Ref.current) gsap.set(chip3Ref.current, { y: scroll * -180, x: scroll * -30, rotate: scroll * 120 })
          if (chip4Ref.current) gsap.set(chip4Ref.current, { y: scroll * 100, x: scroll * 60, rotate: scroll * -45 })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleExplore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const productsSec = document.querySelector('#products')
    if (productsSec) {
      productsSec.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Pre-fill WhatsApp message
  const heroMsg = encodeURIComponent("Hello Crimson,\n\nI would like to order your premium snacks. Please share details.")
  const whatsappUrl = `https://wa.me/${CONTACT_DETAILS.phone}?text=${heroMsg}`

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center bg-transparent pt-20 overflow-hidden select-none"
    >
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Grid Layout Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 py-12 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          
          {/* Text / Copy Content Column */}
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary tracking-wide uppercase">
              ✨ 100% Traditional Recipe
            </span>
            
            <h1
              ref={titleRef}
              className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
            >
              Bringing the <span className="text-primary">Authentic</span> Taste of Kerala to Every Home.
            </h1>
            
            <p
              ref={subTextRef}
              className="mt-6 text-base md:text-lg text-neutral-600 font-medium leading-relaxed max-w-xl mx-auto md:mx-0"
            >
              Premium handcrafted banana snacks made with carefully selected Kerala bananas and pure coconut oil.
            </p>
            
            {/* Buttons Group */}
            <div
              ref={buttonGroupRef}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba56] px-8 py-4 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-center"
              >
                <MessageSquare className="h-4.5 w-4.5 fill-current" />
                <span>Order on WhatsApp</span>
              </a>
              <button
                onClick={handleExplore}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-white hover:bg-neutral-50 px-8 py-4 text-sm font-bold text-neutral-800 border border-neutral-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Packaging Column */}
          <div className="relative flex justify-center items-center">
            {/* Ambient Gold Halo */}
            <div className="absolute h-[320px] w-[320px] md:h-[450px] md:w-[450px] rounded-full bg-radial from-secondary/35 to-transparent blur-2xl" />

            {/* Banana Chips Pouch (Main Product Package) */}
            <div ref={packageRef} className="relative z-10 w-4/5 max-w-[340px] drop-shadow-[0_25px_50px_rgba(153,15,2,0.22)]">
              <img
                src={mainPackage}
                alt="Crimson Banana Chips Packaging"
                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-103"
              />
            </div>

            {/* Simulated Floating Banana Chips (Vector Shapes) */}
            {/* Chip 1: Top Left */}
            <div
              ref={chip1Ref}
              className="absolute left-[5%] top-[10%] z-20 h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-yellow-500 border border-amber-300 shadow-md flex items-center justify-center rotate-12 float-slow"
            >
              <div className="h-10 w-10 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center">
                <span className="text-[10px] text-amber-900 font-bold opacity-60">✸</span>
              </div>
            </div>

            {/* Chip 2: Bottom Right */}
            <div
              ref={chip2Ref}
              className="absolute right-[5%] bottom-[15%] z-20 h-16 w-16 rounded-full bg-gradient-to-br from-secondary to-yellow-500 border border-amber-300 shadow-md flex items-center justify-center -rotate-45 float-medium"
            >
              <div className="h-12 w-12 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center">
                <span className="text-xs text-amber-900 font-bold opacity-60">✸</span>
              </div>
            </div>

            {/* Chip 3: Bottom Left */}
            <div
              ref={chip3Ref}
              className="absolute left-[10%] bottom-[20%] z-20 h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-yellow-400 border border-amber-300 shadow-sm flex items-center justify-center rotate-45 float-fast"
            >
              <div className="h-7 w-7 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center" />
            </div>

            {/* Chip 4: Top Right */}
            <div
              ref={chip4Ref}
              className="absolute right-[12%] top-[15%] z-20 h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-yellow-400 border border-amber-300 shadow-md flex items-center justify-center -rotate-12 float-slow"
            >
              <div className="h-9 w-9 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
