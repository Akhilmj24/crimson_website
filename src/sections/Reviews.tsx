import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { REVIEWS_DATA } from '../data'

export const Reviews: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const autoPlayRef = useRef<(() => void) | null>(null)

  const handleNext = () => {
    setDirection('right')
    setActiveIndex((prev) => (prev === REVIEWS_DATA.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setDirection('left')
    setActiveIndex((prev) => (prev === 0 ? REVIEWS_DATA.length - 1 : prev - 1))
  }

  autoPlayRef.current = handleNext

  // Setup auto slide interval (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoPlayRef.current) autoPlayRef.current()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Framer Motion slide variants
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 200, damping: 22 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -80 : 80,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 200, damping: 22 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  const activeReview = REVIEWS_DATA[activeIndex]

  return (
    <section id="reviews" className="bg-transparent py-12 md:py-16 overflow-hidden select-none">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Reviews
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Loved by Snack Enthusiasts
          </h2>
        </div>

        {/* Carousel Slider Block */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          
          {/* Decorative Quote Icon */}
          <div className="absolute top-2 left-6 text-neutral-200/50 pointer-events-none hidden sm:block">
            <Quote className="h-28 w-28 fill-current rotate-180" />
          </div>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeReview.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-3xl bg-white border border-neutral-100 rounded-2xl p-8 md:p-12 shadow-soft relative z-10 text-center"
            >
              {/* Rating Stars */}
              <div className="flex justify-center gap-1 text-secondary mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < activeReview.rating ? 'fill-current' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-base sm:text-lg md:text-xl font-display font-medium text-neutral-800 leading-relaxed italic">
                "{activeReview.text}"
              </blockquote>

              {/* Customer details */}
              <div className="mt-8">
                <h4 className="text-sm font-bold text-neutral-900">{activeReview.name}</h4>
                <p className="text-xs text-neutral-400 font-semibold mt-1">
                  {activeReview.location} • <span className="font-medium">{activeReview.date}</span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider controls (Arrows) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-20 hidden md:flex justify-between px-2 pointer-events-none">
            <button
              onClick={handlePrev}
              className="h-12 w-12 rounded-full bg-white border border-neutral-100 shadow-md flex items-center justify-center text-neutral-600 hover:text-primary hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer"
              aria-label="Previous Review"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="h-12 w-12 rounded-full bg-white border border-neutral-100 shadow-md flex items-center justify-center text-neutral-600 hover:text-primary hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer"
              aria-label="Next Review"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

        </div>

        {/* Carousel indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {REVIEWS_DATA.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 'right' : 'left')
                setActiveIndex(index)
              }}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeIndex ? 'w-6 bg-primary' : 'w-2.5 bg-neutral-200 hover:bg-neutral-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
