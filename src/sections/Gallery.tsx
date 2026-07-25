import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GALLERY_DATA } from '../data'
import { ZoomIn } from 'lucide-react'

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'packaging' | 'closeup' | 'culture'>('all')

  const categories = [
    { id: 'all', name: 'All Collection' },
    // { id: 'packaging', name: 'Packaging' },
    // { id: 'closeup', name: 'Closeups' },
    // { id: 'culture', name: 'Kerala Heritage' },
  ]

  const filteredItems = GALLERY_DATA.filter((item) => {
    if (filter === 'all') return true
    return item.category === filter
  })

  return (
    <section id="gallery" className="bg-transparent py-12 md:py-16 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Our Gallery
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Visuals of <span className="text-primary">Crimson</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
            Take a look at our premium packaging bag mockups and snack closeups.
          </p>
        </div>

        {/* Filters Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`rounded-full px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${filter === cat.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={item.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-3 border border-neutral-100/50 shadow-soft cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden rounded-xl bg-[#FAF7F2]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                  {/* Overlay zoom badge */}
                  <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="rounded-full bg-white/90 p-3 shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ZoomIn className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <span className="text-[9px] font-extrabold text-secondary uppercase tracking-widest">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-800 mt-0.5">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}
