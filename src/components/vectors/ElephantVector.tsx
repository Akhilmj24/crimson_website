import React from 'react'

interface VectorProps {
  className?: string
  style?: React.CSSProperties
}

export const ElephantVector: React.FC<VectorProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Soft Glow */}
      <circle cx="200" cy="200" r="160" fill="url(#elephantGlow)" opacity="0.1" />

      {/* Decorative Traditional Umbrella (Muthukkuda) */}
      {/* Umbrella Dome */}
      <path
        d="M 140 100 C 140 50, 260 50, 260 100 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      
      {/* Umbrella Stripes */}
      <path d="M 200 50 L 200 100" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M 200 50 Q 170 70 160 100" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      <path d="M 200 50 Q 230 70 240 100" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />

      {/* Golden beads/fringes hanging from umbrella */}
      <path
        d="M 140 100 L 260 100"
        stroke="#FFC72C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="0 8"
      />
      <path
        d="M 140 105 L 260 105"
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />

      {/* Umbrella Rod/Pole */}
      <line x1="200" y1="100" x2="200" y2="180" stroke="#1A1A1A" strokeWidth="5.5" strokeLinecap="round" />

      {/* Elephant Body Line Art */}
      {/* Back and Tail */}
      <path
        d="M 145 220 Q 175 190 225 190 C 265 190, 290 220, 295 240 Q 300 255, 298 280 C 298 280, 292 290, 285 285 L 280 230"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Elephant Tail */}
      <path
        d="M 145 220 C 135 235, 130 260, 132 290"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="132" cy="295" r="3.5" fill="#1A1A1A" />

      {/* Head and Trunk */}
      {/* Head Dome */}
      <path
        d="M 225 190 Q 255 170, 280 185 C 290 190, 295 200, 295 210"
        stroke="#1A1A1A"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Tusk */}
      <path
        d="M 292 235 C 310 240, 325 230, 335 215 C 320 222, 305 222, 292 220"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Trunk curving up or down */}
      <path
        d="M 295 210 Q 315 215, 308 245 C 302 270, 318 290, 325 295 C 330 300, 333 293, 328 287 C 322 280, 310 270, 314 250 Q 320 220, 295 222"
        fill="#1A1A1A"
        opacity="0.1"
      />
      <path
        d="M 295 210 Q 315 215, 308 245 C 302 270, 318 290, 325 295 C 330 300, 333 293, 328 287 C 322 280, 310 270, 314 250 Q 320 220, 295 222 Z"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Ear (Large and stylized) */}
      <path
        d="M 255 190 C 240 200, 235 225, 245 240 C 255 250, 270 245, 272 230 C 275 210, 265 195, 255 190 Z"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M 250 205 Q 242 220, 248 230" stroke="#1A1A1A" strokeWidth="2" fill="none" />

      {/* Feet & Legs */}
      {/* Front Leg 1 */}
      <path
        d="M 270 240 L 270 340 L 290 340 L 292 310 L 285 240"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Toe nails front 1 */}
      <path d="M 270 340 C 275 332, 285 332, 290 340" stroke="#1A1A1A" strokeWidth="3" />

      {/* Front Leg 2 (Behind) */}
      <path
        d="M 285 245 L 290 330 L 305 330 L 305 280"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />

      {/* Back Leg 1 */}
      <path
        d="M 160 220 L 160 340 L 180 340 L 182 300 Q 185 250, 185 220"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Toe nails back 1 */}
      <path d="M 160 340 C 165 332, 175 332, 180 340" stroke="#1A1A1A" strokeWidth="3" />

      {/* Back Leg 2 (Behind) */}
      <path
        d="M 175 222 L 180 330 L 195 330 L 195 260"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />

      {/* Underbelly curve */}
      <path
        d="M 180 245 Q 220 260, 270 240"
        stroke="#1A1A1A"
        strokeWidth="4"
        fill="none"
      />

      {/* Golden Head Caparison (Nettipattam) */}
      {/* Base triangular hanging shape */}
      <path
        d="M 280 185 C 285 195, 292 205, 292 215 C 286 218, 278 210, 278 200 Z"
        fill="#FFC72C"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Intricate Nettipattam details */}
      <path d="M 280 185 Q 284 195, 285 208 M 279 193 Q 285 198, 288 203" stroke="#990F02" strokeWidth="2" />
      <circle cx="280" cy="189" r="2.5" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx="283" cy="196" r="2.5" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx="286" cy="203" r="2.5" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx="288" cy="210" r="2" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1" />

      {/* Festival Body Blanket (Howdah/Saddle cloth - Cushioned cloth on back) */}
      <path
        d="M 170 205 Q 200 200, 235 205 L 230 240 Q 200 248, 175 240 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Decorative embroidery border */}
      <path
        d="M 175 210 Q 200 206, 230 210 L 225 235 Q 200 242, 180 235 Z"
        fill="none"
        stroke="#FFC72C"
        strokeWidth="2.5"
      />
      {/* Decorative Tassels */}
      <path d="M 170 240 L 170 246 M 180 242 L 180 248 M 190 244 L 190 250 M 200 245 L 200 251 M 210 244 L 210 250 M 220 242 L 220 248 M 230 240 L 230 246" stroke="#FFC72C" strokeWidth="3.5" strokeLinecap="round" />

      {/* Bell hanging around neck */}
      <path d="M 245 220 Q 252 250, 252 265" stroke="#1A1A1A" strokeWidth="3" fill="none" />
      <circle cx="252" cy="268" r="5" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1.5" />

      <defs>
        <radialGradient id="elephantGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
