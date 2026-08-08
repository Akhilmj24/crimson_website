/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#990F02',
          light: '#C21807',
          dark: '#660A01',
          glow: 'rgba(153, 15, 2, 0.15)',
        },
        secondary: {
          DEFAULT: '#FFC72C',
          glow: 'rgba(255, 199, 44, 0.2)',
        },
        'bg-dark': '#0D0C0A',
        'bg-card': {
          DEFAULT: 'rgba(26, 24, 21, 0.75)',
          hover: 'rgba(38, 35, 30, 0.85)',
        },
        'text-primary': '#F5F2EB',
        'text-secondary': '#B5AFA5',
        'text-muted': '#7F796F',
        border: {
          DEFAULT: 'rgba(229, 224, 216, 0.1)',
          focus: 'rgba(153, 15, 2, 0.4)',
        },
        success: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        error: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.15)',
        },
        warning: '#F59E0B',
        info: {
          DEFAULT: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
