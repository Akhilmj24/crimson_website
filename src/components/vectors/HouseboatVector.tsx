import React from 'react'

interface VectorProps {
  className?: string
  style?: React.CSSProperties
}

export const HouseboatVector: React.FC<VectorProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Soft Glow */}
      <circle cx="200" cy="200" r="160" fill="url(#boatGlow)" opacity="0.12" />

      {/* Sun/Background Circle */}
      <circle cx="250" cy="160" r="70" fill="#FFC72C" opacity="0.3" />

      {/* Coconut Palms Silhouette (Background) */}
      {/* Left Palm 1 */}
      <path
        d="M 120 280 Q 115 190 70 140"
        stroke="#1A1A1A"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left Palm Fronds */}
      <path d="M 70 140 Q 40 120 20 135 M 70 140 Q 45 155 35 175 M 70 140 Q 75 110 90 100 M 70 140 Q 90 135 110 145 M 70 140 Q 80 160 85 190 M 70 140 Q 55 110 50 95" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* Right Palm 2 */}
      <path
        d="M 280 280 Q 295 180 340 130"
        stroke="#1A1A1A"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right Palm Fronds */}
      <path d="M 340 130 Q 365 110 385 125 M 340 130 Q 360 145 365 170 M 340 130 Q 330 100 315 90 M 340 130 Q 315 125 295 135 M 340 130 Q 325 150 315 175 M 340 130 Q 350 95 360 85" stroke="#1A1A1A" strokeWidth="5.5" strokeLinecap="round" fill="none" />

      {/* Middle Palm 3 (Smaller/Further back) */}
      <path
        d="M 190 280 Q 185 220 170 180"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.75"
        fill="none"
      />
      {/* Middle Palm Fronds */}
      <path d="M 170 180 Q 150 165 135 175 M 170 180 Q 150 190 145 205 M 170 180 Q 175 160 185 150 M 170 180 Q 185 175 200 185 M 170 180 Q 180 195 180 215" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75" />

      {/* Water Horizon Land */}
      <path
        d="M 40 280 L 360 280"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <path
        d="M 40 280 Q 200 290 360 280 Z"
        fill="#1A1A1A"
        opacity="0.1"
      />

      {/* Traditional Houseboat (Kettuvallam) */}
      {/* Main Hull */}
      <path
        d="M 80 260 C 80 260 90 285 150 285 C 210 285 250 285 290 285 C 310 285 330 270 330 250 C 330 230 300 232 290 235 L 90 235 C 80 235 75 245 80 260 Z"
        fill="#1A1A1A"
      />
      
      {/* Boat Curved Roof Canopy (Valavara - Bamboo Matting) */}
      <path
        d="M 100 235 C 100 180 150 165 210 165 C 270 165 305 180 305 235 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="4.5"
      />
      
      {/* Arched Windows inside canopy */}
      <path d="M 125 235 L 125 205 A 15 15 0 0 1 155 205 L 155 235 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3.5" />
      <path d="M 175 235 L 175 200 A 18 18 0 0 1 211 200 L 211 235 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3.5" />
      <path d="M 230 235 L 230 205 A 15 15 0 0 1 260 205 L 260 235 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3.5" />

      {/* Decorative Golden Band / Roof Stripes */}
      <path
        d="M 100 235 C 100 180 150 165 210 165 C 270 165 305 180 305 235"
        fill="none"
        stroke="#FFC72C"
        strokeWidth="3"
        strokeDasharray="6 25"
      />

      {/* Houseboat Steering Oar/Paddle */}
      <path d="M 85 242 L 55 265" stroke="#1A1A1A" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 58 262 L 40 275 L 45 280 L 63 267 Z" fill="#1A1A1A" />

      {/* Bow ornament (Wooden carving curve) */}
      <path
        d="M 305 235 C 315 220 325 215 330 220 C 335 225 320 240 310 245"
        fill="#FFC72C"
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />

      {/* Water Ripples & Reflection */}
      {/* Boat reflection */}
      <path
        d="M 100 295 L 300 295 M 120 303 L 280 303 M 150 311 L 250 311 M 180 319 L 220 319"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Sun/Sky reflections */}
      <path
        d="M 70 300 L 95 300 M 305 300 L 330 300 M 60 308 L 105 308 M 295 308 L 340 308 M 90 316 L 140 316 M 260 316 L 310 316 M 125 324 L 275 324"
        stroke="#FFC72C"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Small floating ripples */}
      <path d="M 40 335 L 80 335 M 320 335 L 360 335 M 100 343 L 160 343 M 240 343 L 300 343 M 150 351 L 250 351" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      <defs>
        <radialGradient id="boatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
