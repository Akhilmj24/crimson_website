import React, { useState, useEffect } from 'react'
import { Menu, X, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logoClean from '../assets/logo-clean-nav.png'
import { CONTACT_DETAILS } from '../constants'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Track scroll position to change background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Products', href: '#products' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Pre-fill WhatsApp message for "Order Now"
  const orderNowMsg = encodeURIComponent("Hello Crimson,\n\nI would like to enquire about ordering your authentic Kerala snacks. Please share details.")
  const whatsappUrl = `https://wa.me/${CONTACT_DETAILS.phone}?text=${orderNowMsg}`

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-[#FAF7F2]/95 py-4 shadow-soft backdrop-blur-md border-b border-neutral-100'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, '#home')}
              className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
              aria-label="Crimson Home"
            >
              <img src={logoClean} alt="Crimson Logo" className="h-14 w-14 object-contain" />

            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm font-semibold text-neutral-600 hover:text-primary transition-colors focus:outline-none"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden items-center md:flex">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-primary hover:bg-primary-light px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Order Now</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 select-none">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col bg-[#FAF7F2] p-6 shadow-2xl border-l border-neutral-100"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                <div className="flex items-center gap-2">
                  <img src={logoClean} alt="Crimson Logo" className="h-8 w-8 object-contain" />
                  <span className="font-display text-lg font-bold text-primary">Crimson</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <div className="flex-1 space-y-5 py-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="block text-base font-semibold text-neutral-700 hover:text-primary transition-colors focus:outline-none"
                    >
                      {link.name}
                    </a>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp CTA inside Drawer */}
              <div className="border-t border-neutral-100 pt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#20ba56] transition-all duration-300 cursor-pointer"
                >
                  <MessageSquare className="h-4.5 w-4.5 fill-current" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
