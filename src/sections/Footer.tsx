import React from 'react'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react'
import { BRAND_NAME, BRAND_TAGLINE, CONTACT_DETAILS, SOCIAL_LINKS } from '../constants'
import logoClean from '../assets/logo-clean.png'

export const Footer: React.FC = () => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-16 select-none relative overflow-hidden">
      {/* Decorative crimson accent top border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Info Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <img src={logoClean} alt="Crimson Logo" className="h-9 w-9 object-contain brightness-0 invert" />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                {BRAND_NAME}
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium leading-relaxed text-neutral-400">
              {BRAND_TAGLINE}. Delivering hand-crafted, premium banana snacks fried in pure coconut oil from our hearth to your home.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-neutral-800 hover:bg-primary hover:text-white transition-all flex items-center justify-center text-neutral-300"
                aria-label="Instagram Page"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-neutral-800 hover:bg-primary hover:text-white transition-all flex items-center justify-center text-neutral-300"
                aria-label="Facebook Page"
              >
                <Facebook className="h-4.5 w-4.5" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-neutral-800 hover:bg-primary hover:text-white transition-all flex items-center justify-center text-neutral-300"
                aria-label="Twitter Account"
              >
                <Twitter className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-xs md:text-sm font-semibold">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleLinkClick(e, '#home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleLinkClick(e, '#about')}
                  className="hover:text-white transition-colors"
                >
                  About Story
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => handleLinkClick(e, '#products')}
                  className="hover:text-white transition-colors"
                >
                  Explore Products
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  onClick={(e) => handleLinkClick(e, '#gallery')}
                  className="hover:text-white transition-colors"
                >
                  Media Gallery
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, '#contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Info
                </a>
              </li>
            </ul>
          </div>

          {/* Product links Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-5">
              Snack Menu
            </h4>
            <ul className="space-y-3.5 text-xs md:text-sm font-semibold">
              <li>
                <a
                  href="#products"
                  onClick={(e) => handleLinkClick(e, '#products')}
                  className="hover:text-white transition-colors"
                >
                  Kerala Banana Chips (200g)
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => handleLinkClick(e, '#products')}
                  className="hover:text-white transition-colors"
                >
                  Sharkara Upperi (100g)
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => handleLinkClick(e, '#products')}
                  className="hover:text-white transition-colors"
                >
                  Onam Combo Pack Gift Set
                </a>
              </li>
            </ul>
          </div>

          {/* LLP Address Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-5">
              Our Location
            </h4>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">
                  {CONTACT_DETAILS.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="hover:text-white font-semibold transition-colors"
                >
                  {CONTACT_DETAILS.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href={`tel:${CONTACT_DETAILS.phone}`}
                  className="hover:text-white font-semibold transition-colors"
                >
                  {CONTACT_DETAILS.displayPhone}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright divider block */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-neutral-500">
          <p>© {new Date().getFullYear()} Crimson Group LLP. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>FSSAI License No. 11324999000123</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
