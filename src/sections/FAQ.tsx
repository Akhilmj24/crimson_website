import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { FAQ_DATA } from '../data'

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="bg-[#FAF7F2] py-20 md:py-28 select-none">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-xs md:text-sm text-neutral-500 font-semibold leading-relaxed">
            Quick answers about our shelf life, delivery zones, oil specifications, and bulk orders.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index
            
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl bg-white border border-neutral-100/50 shadow-soft transition-all duration-300"
              >
                {/* Accordion Trigger Button */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-sm md:text-base font-bold text-neutral-800 hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 flex-shrink-0 group-hover:bg-neutral-100">
                    {isOpen ? (
                      <Minus className="h-4.5 w-4.5 text-primary" />
                    ) : (
                      <Plus className="h-4.5 w-4.5" />
                    )}
                  </span>
                </button>

                {/* Accordion Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="border-t border-neutral-50 p-6 pt-0 text-xs md:text-sm text-neutral-500 font-semibold leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
