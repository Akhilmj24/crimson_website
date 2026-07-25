import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(26,26,26,0.1)] border border-neutral-100"
          role="alert"
          aria-live="assertive"
        >
          {type === 'success' ? (
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-primary flex-shrink-0" />
          )
          }
          <div className="flex-grow pr-2">
            <h4 className="text-sm font-semibold text-neutral-900">
              {type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p className="mt-0.5 text-xs text-neutral-600 font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
