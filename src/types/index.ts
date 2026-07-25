import { z } from 'zod'

export interface FAQItem {
  question: string
  answer: string
}

export interface Review {
  id: string
  name: string
  location: string
  rating: number
  text: string
  date: string
}

export interface GalleryItem {
  id: string
  title: string
  category: 'packaging' | 'closeup' | 'culture'
  imageUrl: string
}

export interface NutritionInfo {
  calories: string
  totalFat: string
  saturatedFat: string
  transFat: string
  cholesterol: string
  sodium: string
  totalCarbohydrate: string
  dietaryFiber: string
  totalSugars: string
  protein: string
}

export interface Product {
  id: string
  name: string
  tagline: string
  shortDescription: string
  description: string
  weight: string
  price?: number
  ingredients: string[]
  shelfLife: string
  storageInstructions: string
  packagingInfo: string
  nutritionInfo: NutritionInfo
  features: string[]
  imageUrl: string
  detailsImageUrl?: string
  whatsappMessage: string
}

// Contact form schemas
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
