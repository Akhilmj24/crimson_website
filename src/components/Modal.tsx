import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, Calendar, HardDrive, Package, MessageSquare } from 'lucide-react'
import { Product } from '../types'
import { CONTACT_DETAILS } from '../constants'

interface ModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = ({ product, isOpen, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!product) return null

  // Generate WhatsApp ordering link
  const encodedMsg = encodeURIComponent(product.whatsappMessage)
  const whatsappUrl = `https://wa.me/${CONTACT_DETAILS.phone}?text=${encodedMsg}`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-custom"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 flex h-[90vh] max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:h-auto md:max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header / Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar md:flex md:h-[600px]">
              {/* Product Visual Area */}
              <div className="bg-[#FAF7F2] p-8 flex items-center justify-center relative md:w-1/2 md:p-12 border-b md:border-b-0 md:border-r border-neutral-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-[300px] object-contain drop-shadow-[0_15px_30px_rgba(153,15,2,0.15)] md:max-h-[400px] transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute bottom-4 left-4 bg-primary text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                  {product.weight}
                </span>
              </div>

              {/* Product Info Area */}
              <div className="p-6 md:p-8 flex flex-col md:w-1/2 justify-between">
                <div>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {product.tagline}
                  </span>
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <h3 id="modal-title" className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                      {product.name}
                    </h3>
                    {product.price && (
                      <span className="text-xl md:text-2xl font-extrabold text-primary flex-shrink-0">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-600 font-medium leading-relaxed mt-3">
                    {product.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3.5 my-6">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">Shelf Life</p>
                        <p className="text-xs text-neutral-800 font-bold">{product.shelfLife}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">Net Weight</p>
                        <p className="text-xs text-neutral-800 font-bold">{product.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <HardDrive className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">Storage</p>
                        <p className="text-xs text-neutral-800 font-bold truncate max-w-[150px]" title={product.storageInstructions}>
                          Airtight Place
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Package className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">Packaging</p>
                        <p className="text-xs text-neutral-800 font-bold">Premium Zip pouch</p>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Sections: Ingredients & Nutrition */}
                  <div className="space-y-4">
                    {/* Ingredients list */}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-1">
                        Ingredients
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium mt-1.5">
                        {product.ingredients.join(', ')}
                      </p>
                    </div>

                    {/* Nutrition Tables */}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-1">
                        Nutrition Facts (per 100g)
                      </h4>
                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-neutral-600 font-medium">
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Energy</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.calories}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Total Carbohydrate</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.totalCarbohydrate}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Total Fat</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.totalFat}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Saturated Fat</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.saturatedFat}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Dietary Fiber</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.dietaryFiber}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Total Sugars</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.totalSugars}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Protein</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.protein}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-0.5">
                          <span>Sodium</span>
                          <span className="font-bold text-neutral-800">{product.nutritionInfo.sodium}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex gap-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#20ba56] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-center"
                  >
                    <MessageSquare className="h-4.5 w-4.5 fill-current" />
                    <span>Order on WhatsApp</span>
                  </a>
                  <button
                    onClick={onClose}
                    className="rounded-full border border-neutral-200 px-6 py-3.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
