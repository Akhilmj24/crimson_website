import React from 'react'

interface VectorProps {
  className?: string
  style?: React.CSSProperties
}

export const LandscapeVector: React.FC<VectorProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Soft Sunset Sky Glow */}
      <circle cx="200" cy="200" r="170" fill="url(#skyGlow)" opacity="0.25" />

      {/* Massive Golden Rising/Setting Sun */}
      <circle cx="270" cy="180" r="85" fill="#FFC72C" />

      {/* Sun Ray Band Textures (horizontal line cuts) */}
      <line x1="185" y1="130" x2="355" y2="130" stroke="#FAF7F2" strokeWidth="2.5" />
      <line x1="185" y1="150" x2="355" y2="150" stroke="#FAF7F2" strokeWidth="3" />
      <line x1="185" y1="170" x2="355" y2="170" stroke="#FAF7F2" strokeWidth="3.5" />
      <line x1="185" y1="195" x2="355" y2="195" stroke="#FAF7F2" strokeWidth="4.5" />
      <line x1="185" y1="220" x2="355" y2="220" stroke="#FAF7F2" strokeWidth="5.5" />

      {/* Far Background Hills / Shoreline */}
      <path
        d="M 40 240 C 90 230, 140 235, 190 240 C 240 245, 290 240, 360 240 L 360 250 L 40 250 Z"
        fill="#C21807"
        opacity="0.15"
      />

      {/* Traditional Church / Nalukettu house on the left shore */}
      {/* House structure */}
      <path
        d="M 60 215 L 105 215 L 105 240 L 60 240 Z"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />
      {/* Slanted Roof */}
      <path
        d="M 52 215 L 82.5 190 L 113 215 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Tower / Cross spire */}
      <rect x="75" y="165" width="15" height="25" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5" />
      <path d="M 70 165 L 82.5 150 L 95 165 Z" fill="#990F02" stroke="#1A1A1A" strokeWidth="2.5" />
      {/* Spire Cross */}
      <line x1="82.5" y1="150" x2="82.5" y2="138" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="77.5" y1="143" x2="87.5" y2="143" stroke="#1A1A1A" strokeWidth="2" />
      {/* Doors/Windows */}
      <rect x="80" y="222" width="10" height="18" fill="#1A1A1A" rx="2" />
      <circle cx="82.5" cy="177" r="2.5" fill="#1A1A1A" />

      {/* House 2 (Small hut next to it) */}
      <path
        d="M 115 225 L 140 225 L 140 240 L 115 240 Z"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <path
        d="M 110 225 L 127.5 215 L 145 225 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="2"
      />

      {/* Serene Water Backwaters (Foreground Area) */}
      <path
        d="M 40 240 L 360 240"
        stroke="#1A1A1A"
        strokeWidth="3.5"
      />
      
      {/* Flying Birds in Sky */}
      {/* Bird 1 */}
      <path d="M 130 110 Q 138 100 145 110 Q 152 100 160 110" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Bird 2 */}
      <path d="M 180 90 Q 186 82 192 90 Q 198 82 204 90" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bird 3 */}
      <path d="M 230 115 Q 235 109 240 115 Q 245 109 250 115" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Bird 4 */}
      <path d="M 210 135 Q 214 130 218 135 Q 222 130 226 135" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* Houseboat Silhouette 1 cruising on river (Scale down for distance) */}
      <g transform="translate(130, 215) scale(0.4)">
        {/* Boat hull */}
        <path d="M 50 50 C 50 50 60 70 120 70 C 180 70 210 70 240 70 C 260 70 270 58 270 42 C 270 26 240 28 230 30 L 60 30 Z" fill="#1A1A1A" />
        {/* Canopy */}
        <path d="M 70 30 C 70 -15 110 -25 160 -25 C 210 -25 240 -15 240 30 Z" fill="#1A1A1A" />
      </g>

      {/* Houseboat Silhouette 2 (Larger, in midground) */}
      <g transform="translate(70, 245) scale(0.65)">
        {/* Boat hull */}
        <path d="M 80 40 C 80 40 90 60 140 60 C 190 60 230 60 260 60 C 280 60 295 50 295 35 C 295 20 270 22 260 25 L 90 25 Z" fill="#1A1A1A" />
        {/* Canopy */}
        <path d="M 100 25 C 100 -20 140 -30 190 -30 C 240 -30 275 -20 275 25 Z" fill="#990F02" stroke="#1A1A1A" strokeWidth="3" />
        <path d="M 120 25 L 120 5 A 10 10 0 0 1 140 5 L 140 25 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2" />
        <path d="M 165 25 L 165 0 A 13 13 0 0 1 191 0 L 191 25 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2" />
        <path d="M 215 25 L 215 5 A 10 10 0 0 1 235 5 L 235 25 Z" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2" />
        {/* Bow ornament */}
        <path d="M 295 35 Q 310 15 315 25 Q 305 38 295 40" fill="#FFC72C" />
      </g>

      {/* Palm Trees framing the sides */}
      {/* Tall Left Coconut Palm */}
      <path
        d="M 50 360 Q 40 230 80 140"
        stroke="#1A1A1A"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left Palm rings texture */}
      <path d="M 47 280 Q 45 276 43 274 M 46 250 Q 44 246 42 244 M 48 210 Q 47 206 46 204 M 52 175 Q 52 171 52 169" stroke="#FFC72C" strokeWidth="3.5" strokeLinecap="round" />
      {/* Left Palm Leaves */}
      <path d="M 80 140 Q 40 135 15 150 M 80 140 Q 50 165 40 195 M 80 140 Q 95 105 110 85 M 80 140 Q 110 130 135 140 M 80 140 Q 100 165 105 200 M 80 140 Q 60 105 45 90" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Tall Right Coconut Palm */}
      <path
        d="M 350 360 Q 360 220 310 120"
        stroke="#1A1A1A"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right Palm Leaves */}
      <path d="M 310 120 Q 270 115 240 125 M 310 120 Q 280 145 265 180 M 310 120 Q 325 80 345 60 M 310 120 Q 345 105 375 115 M 310 120 Q 335 150 345 185 M 310 120 Q 290 85 270 70" stroke="#1A1A1A" strokeWidth="5.5" strokeLinecap="round" fill="none" />

      {/* Water Lilies and Reflections in Foreground */}
      {/* Reflections */}
      <path d="M 120 295 L 280 295 M 100 305 L 180 305 M 220 305 L 300 305 M 80 315 L 140 315 M 240 315 L 320 315" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M 140 300 L 260 300 M 150 310 L 250 310" stroke="#FFC72C" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Water Lily Pads & Flowers (Bottom Right and Bottom Left) */}
      {/* Left Pad */}
      <ellipse cx="90" cy="335" rx="15" ry="4" fill="#1A1A1A" opacity="0.3" />
      <path d="M 75 335 C 75 332, 105 332, 105 335 C 105 338, 93 339, 90 338 C 87 339, 75 338, 75 335 Z" stroke="#1A1A1A" strokeWidth="2.5" fill="#FAF7F2" />
      {/* Lily Flower Left */}
      <path d="M 85 332 L 90 324 L 95 332 Z" fill="#990F02" stroke="#1A1A1A" strokeWidth="1.5" />
      <path d="M 81 332 Q 90 326 99 332 Z" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />

      {/* Right Pad */}
      <ellipse cx="300" cy="340" rx="22" ry="5.5" fill="#1A1A1A" opacity="0.3" />
      <path d="M 278 340 C 278 336, 322 336, 322 340 C 322 344, 305 345, 300 344 C 295 345, 278 344, 278 340 Z" stroke="#1A1A1A" strokeWidth="3" fill="#FAF7F2" />
      {/* Lily Flower Right */}
      <path d="M 293 336 L 300 325 L 307 336 Z" fill="#990F02" stroke="#1A1A1A" strokeWidth="2" />
      <path d="M 288 336 Q 300 328 312 336 Z" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1.5" />

      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC72C" />
          <stop offset="60%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#990F02" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
