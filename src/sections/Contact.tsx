import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { contactFormSchema, ContactFormInput } from '../types'
import { CONTACT_DETAILS } from '../constants'
import { submitContactForm } from '../services/sheet-service'
import { Toast } from '../components/Toast'

export const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ isVisible: boolean; type: 'success' | 'error'; message: string }>({
    isVisible: false,
    type: 'success',
    message: '',
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true)
    try {
      const result = await submitContactForm(data)
      if (result.success) {
        setToast({
          isVisible: true,
          type: 'success',
          message: 'Thank you! Your message has been saved and our team will contact you shortly.',
        })
        reset()
      } else {
        setToast({
          isVisible: true,
          type: 'error',
          message: result.message || 'Failed to submit form. Please try again.',
        })
      }
    } catch (err) {
      setToast({
        isVisible: true,
        type: 'error',
        message: 'A network error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="bg-transparent py-20 md:py-28 select-none relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute left-[-100px] bottom-[-100px] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Contact Us
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Get In Touch With <span className="text-primary">Crimson</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
            Have queries about retail outlets, wholesale distribution, or custom corporate gifting combo boxes? Drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-stretch">
          
          {/* Details Column (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-soft flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
                  Corporate Offices
                </h3>

                {/* Details list */}
                <div className="space-y-5">
                  <a
                    href={CONTACT_DETAILS.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group focus:outline-none"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Address</p>
                      <p className="text-xs md:text-sm text-neutral-600 font-semibold group-hover:text-primary transition-colors mt-0.5 leading-relaxed">
                        {CONTACT_DETAILS.address}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${CONTACT_DETAILS.phone}`}
                    className="flex items-start gap-4 group focus:outline-none"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Phone / WhatsApp</p>
                      <p className="text-xs md:text-sm text-neutral-600 font-semibold group-hover:text-primary transition-colors mt-0.5">
                        {CONTACT_DETAILS.displayPhone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    className="flex items-start gap-4 group focus:outline-none"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Email</p>
                      <p className="text-xs md:text-sm text-neutral-600 font-semibold group-hover:text-primary transition-colors mt-0.5 truncate max-w-[220px] md:max-w-none">
                        {CONTACT_DETAILS.email}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Business Hours
                </h4>
                <p className="text-xs text-neutral-500 font-semibold mt-2">
                  Monday – Saturday: 9:00 AM – 6:00 PM (IST)
                </p>
                <p className="text-xs text-neutral-400 font-medium mt-1">
                  Sunday: Closed
                </p>
              </div>

            </div>
          </div>

          {/* Form Column (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-soft">
              <h3 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-4 mb-6">
                Send Us a Message
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-neutral-700 uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name')}
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-xs md:text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-neutral-200 focus:border-primary focus:ring-primary/10'
                      }`}
                      placeholder="Your Full Name"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-neutral-700 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-xs md:text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-neutral-200 focus:border-primary focus:ring-primary/10'
                      }`}
                      placeholder="e.g. +91XXXXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-neutral-700 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`mt-2 block w-full rounded-xl border px-4 py-3 text-xs md:text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-neutral-200 focus:border-primary focus:ring-primary/10'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Message field */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-neutral-700 uppercase">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    {...register('message')}
                    className={`mt-2 block w-full rounded-xl border px-4 py-3 text-xs md:text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.message
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-neutral-200 focus:border-primary focus:ring-primary/10'
                    }`}
                    placeholder="Tell us about your requirements..."
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-light disabled:bg-primary/70 px-6 py-4 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:-translate-y-0 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>

      {/* Floating success/error toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </section>
  )
}
