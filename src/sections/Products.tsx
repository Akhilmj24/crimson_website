import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { PRODUCTS_DATA } from '../data'
import { Product } from '../types'
import { CONTACT_DETAILS } from '../constants'
import { Modal } from '../components/Modal'

export const Products: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLearnMore = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <section id="products" className="bg-[#FAF7F2] py-20 md:py-28 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Our Menu
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Premium Handcrafted <span className="text-primary">Snacks</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
            Freshly prepared following age-old traditions, sealed inside eco-friendly packs to deliver the pristine taste of Kerala.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS_DATA.map((product) => {
            const encodedMsg = encodeURIComponent(product.whatsappMessage)
            const whatsappUrl = `https://wa.me/${CONTACT_DETAILS.phone}?text=${encodedMsg}`
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                whileHover={{
                  y: -12,
                  rotateX: 1,
                  rotateY: 2,
                  boxShadow: '0 25px 50px -12px rgba(153, 15, 2, 0.12)',
                }}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 border border-neutral-100 shadow-soft transition-all duration-500 perspective-1000"
              >
                <div>
                  {/* Badge */}
                  <div className="absolute left-6 top-6 z-10 flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-[10px] font-bold text-amber-900 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    <span>{product.weight}</span>
                  </div>

                  {/* Packaging Visual Container */}
                  <div className="flex h-64 items-center justify-center rounded-xl bg-[#FAF7F2] p-4 transition-colors duration-500 group-hover:bg-[#f6f2e9]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full object-contain drop-shadow-[0_15px_30px_rgba(153,15,2,0.15)] transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-neutral-500 font-medium leading-relaxed min-h-[48px]">
                      {product.shortDescription}
                    </p>

                    {/* Features tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {product.features.slice(0, 3).map((feat) => (
                        <span
                          key={feat}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-8 space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba56] py-3.5 text-xs font-bold text-white shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 fill-current" />
                    <span>Order on WhatsApp</span>
                  </a>
                  
                  <button
                    onClick={() => handleLearnMore(product)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-3.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Product Details Modal */}
        <Modal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

      </div>
    </section>
  )
}
