import React from 'react'
import { motion } from 'framer-motion'
import { Award, Leaf, Flame, ShieldAlert, PackageOpen, Heart } from 'lucide-react'

interface ValueCard {
  title: string
  description: string
  icon: React.ReactNode
}

export const WhyChoose: React.FC = () => {
  const values: ValueCard[] = [
    {
      title: '100% Kerala Bananas',
      description: 'Sourced from selected Nendran plantations in Kerala, harvested at the peak of maturity for ideal crunch.',
      icon: <Leaf className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Pure Coconut Oil',
      description: 'Slow-cooked exclusively in 100% pure filtered coconut oil. Never blended, never reused.',
      icon: <Flame className="h-6 w-6 text-primary" />,
    },
    {
      title: 'No Artificial Colors',
      description: 'Golden yellow hues achieved naturally from organic turmeric powder and premium bananas.',
      icon: <Heart className="h-6 w-6 text-primary" />,
    },
    {
      title: 'No Preservatives',
      description: 'Completely free from chemical additives, artificial flavors, and MSG. Clean ingredient label.',
      icon: <ShieldAlert className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Freshly Packed',
      description: 'Packed directly after cooling in nitrogen-flushed stand-up pouches to lock in natural crispness.',
      icon: <PackageOpen className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Premium Quality',
      description: 'Double-sorted for quality control. Hand-sliced thin to deliver an uniform, premium snacking bite.',
      icon: <Award className="h-6 w-6 text-primary" />,
    },
  ]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
      },
    },
  }

  return (
    <section id="why-choose" className="bg-[#FAF7F2] py-20 md:py-28 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Why Crimson
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Uncompromising Standards, <br className="hidden sm:inline" />
            Unmatched Taste
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
            What makes Crimson the preferred choice for snack connoisseurs? It is our commitment to traditional recipes and wholesome ingredients.
          </p>
        </div>

        {/* Values Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {values.map((val) => (
            <motion.div
              key={val.title}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 40px -15px rgba(26,26,26,0.08)' }}
              className="relative flex flex-col justify-between rounded-2xl bg-white p-8 border border-neutral-100/50 shadow-soft transition-all duration-300"
            >
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 mb-6">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{val.title}</h3>
                <p className="mt-3 text-xs md:text-sm text-neutral-500 font-medium leading-relaxed">
                  {val.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
