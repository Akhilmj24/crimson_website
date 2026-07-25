import React from 'react'
import { Helmet } from 'react-helmet-async'
import { BRAND_NAME, BRAND_TAGLINE, CONTACT_DETAILS } from '../constants'

interface SEOProps {
  title?: string
  description?: string
  canonicalUrl?: string
  ogImage?: string
  productSchema?: {
    name: string
    description: string
    image: string
    offers: {
      price: string
      priceCurrency: string
      availability: string
    }
  }
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Premium handcrafted banana snacks made with carefully selected Kerala bananas and pure coconut oil. Order authentic Banana Chips and Sharkara Upperi online.',
  canonicalUrl = window.location.origin,
  ogImage = `${window.location.origin}/logo-tagline.png`,
  productSchema,
}) => {
  const fullTitle = title ? `${title} | ${BRAND_NAME}` : `${BRAND_NAME} - ${BRAND_TAGLINE}`

  // Structured Data (JSON-LD)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FoodBusiness',
    '@id': `${window.location.origin}/#organization`,
    'name': BRAND_NAME,
    'url': window.location.origin,
    'logo': `${window.location.origin}/logo-clean.png`,
    'image': ogImage,
    'description': description,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO',
      'addressLocality': 'Thiruvananthapuram',
      'addressRegion': 'Kerala',
      'postalCode': '695571',
      'addressCountry': 'IN',
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': CONTACT_DETAILS.phone,
      'contactType': 'sales',
      'email': CONTACT_DETAILS.email,
      'areaServed': 'IN',
      'availableLanguage': ['en', 'ml'],
    },
    'sameAs': [
      'https://facebook.com/crimsonsnacks',
      'https://instagram.com/crimsonsnacks',
    ],
  }

  const activeProductSchema = productSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': productSchema.name,
        'image': productSchema.image,
        'description': productSchema.description,
        'brand': {
          '@type': 'Brand',
          'name': BRAND_NAME,
        },
        'offers': {
          '@type': 'Offer',
          'url': canonicalUrl,
          'priceCurrency': productSchema.offers.priceCurrency,
          'price': productSchema.offers.price,
          'availability': productSchema.offers.availability,
        },
      }
    : null

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:type" content={productSchema ? 'og:product' : 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={BRAND_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Security & Accessability */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Structured Data Scripts */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {activeProductSchema && (
        <script type="application/ld+json">
          {JSON.stringify(activeProductSchema)}
        </script>
      )}
    </Helmet>
  )
}
