import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROCESS_STAGES } from '../data'
import { CheckCircle2, Tractor, Compass, Flame, Truck } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export const Process: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const stepsRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the connecting line scale
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 30%',
            end: 'bottom 70%',
            scrub: true,
          },
        }
      )

      // Animate each step entering
      stepsRefs.current.forEach((step, index) => {
        if (step) {
          const isEven = index % 2 === 0
          gsap.fromTo(
            step,
            { opacity: 0, x: isEven ? -50 : 50 },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Tractor className="h-6 w-6 text-white" />
      case 1:
        return <Compass className="h-6 w-6 text-white" />
      case 2:
        return <Flame className="h-6 w-6 text-white" />
      case 3:
        return <CheckCircle2 className="h-6 w-6 text-white" />
      case 4:
        return <Truck className="h-6 w-6 text-white" />
      default:
        return <CheckCircle2 className="h-6 w-6 text-white" />
    }
  }

  return (
    <section
      id="process"
      ref={containerRef}
      className="bg-[#FAF7F2] py-20 md:py-28 relative overflow-hidden select-none"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Our Method
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            From <span className="text-primary">Farm</span> to Pouch
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
            Discover our carefully structured, zero-preservatives pipeline that keeps our chips exceptionally fresh.
          </p>
        </div>

        {/* Process Timeline Column */}
        <div className="relative mx-auto max-w-4xl">
          
          {/* Animated Connecting Line (Vertical) */}
          <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-neutral-200/50 rounded-full z-0 hidden sm:block">
            <div
              ref={lineRef}
              className="w-full h-full bg-primary origin-top scale-y-0 rounded-full"
            />
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-16">
            {PROCESS_STAGES.map((stage, index) => {
              const isEven = index % 2 === 0
              
              return (
                <div
                  key={stage.step}
                  ref={(el) => {
                    stepsRefs.current[index] = el
                  }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center relative z-10 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left content block (Empty on alternate rows) */}
                  <div className="hidden sm:block w-1/2" />

                  {/* Bullet Node Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-premium flex-shrink-0 z-20 sm:mx-8 relative">
                    <span className="absolute -top-3.5 -right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-secondary border-2 border-[#FAF7F2] text-[10px] font-extrabold text-amber-950">
                      {stage.step}
                    </span>
                    {getStepIcon(index)}
                  </div>

                  {/* Description Card */}
                  <div className="mt-4 sm:mt-0 w-full sm:w-1/2 bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
                    <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">
                      Step {stage.step}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 mt-1">{stage.title}</h3>
                    <p className="mt-3 text-xs md:text-sm text-neutral-500 font-medium leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
