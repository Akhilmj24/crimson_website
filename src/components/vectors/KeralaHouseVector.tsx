import React from 'react'

interface VectorProps {
  className?: string
  style?: React.CSSProperties
}

export const KeralaHouseVector: React.FC<VectorProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Soft Glow */}
      <circle cx="200" cy="200" r="160" fill="url(#houseGlow)" opacity="0.08" />

      {/* Main Ground/Basement Platform */}
      <path
        d="M 60 310 L 340 310 L 310 330 L 90 330 Z"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M 90 330 L 310 330 L 290 345 L 110 345 Z"
        fill="#FAF7F2"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Steps at the center */}
      <path
        d="M 170 310 L 230 310 L 235 320 L 165 320 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <path
        d="M 165 320 L 235 320 L 240 330 L 160 330 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <path
        d="M 160 330 L 240 330 L 245 345 L 155 345 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="3"
      />

      {/* Pillars - Ground Floor */}
      {/* Pillar 1 (Left) */}
      <rect x="98" y="220" width="10" height="90" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M 93 220 L 113 220 L 108 226 L 98 226 Z" fill="#1A1A1A" />
      <path d="M 95 305 L 111 305 L 111 310 L 95 310 Z" fill="#1A1A1A" />

      {/* Pillar 2 */}
      <rect x="148" y="220" width="10" height="90" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M 143 220 L 163 220 L 158 226 L 148 226 Z" fill="#1A1A1A" />
      <path d="M 145 305 L 161 305 L 161 310 L 145 310 Z" fill="#1A1A1A" />

      {/* Pillar 3 */}
      <rect x="242" y="220" width="10" height="90" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M 237 220 L 257 220 L 252 226 L 242 226 Z" fill="#1A1A1A" />
      <path d="M 239 305 L 255 305 L 255 310 L 239 310 Z" fill="#1A1A1A" />

      {/* Pillar 4 (Right) */}
      <rect x="292" y="220" width="10" height="90" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M 287 220 L 307 220 L 302 226 L 292 226 Z" fill="#1A1A1A" />
      <path d="M 289 305 L 305 305 L 305 310 L 289 310 Z" fill="#1A1A1A" />

      {/* Ground Floor Walls and Door */}
      <rect x="112" y="220" width="176" height="90" fill="#FFFFFF" opacity="0.4" />
      
      {/* Entrance Doorway in middle */}
      <rect x="180" y="240" width="40" height="70" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3.5" />
      <line x1="200" y1="240" x2="200" y2="310" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="193" cy="275" r="3" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx="207" cy="275" r="3" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="1" />

      {/* Ground Floor Windows */}
      <rect x="122" y="250" width="18" height="30" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <line x1="131" y1="250" x2="131" y2="280" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="122" y1="265" x2="140" y2="265" stroke="#1A1A1A" strokeWidth="2" />

      <rect x="260" y="250" width="18" height="30" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3" />
      <line x1="269" y1="250" x2="269" y2="280" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="260" y1="265" x2="278" y2="265" stroke="#1A1A1A" strokeWidth="2" />

      {/* Floor Divider / Balcony Base */}
      <rect x="70" y="205" width="260" height="15" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round" />
      {/* Balcony Railings */}
      <line x1="80" y1="205" x2="80" y2="175" stroke="#1A1A1A" strokeWidth="3.5" />
      <line x1="320" y1="205" x2="320" y2="175" stroke="#1A1A1A" strokeWidth="3.5" />
      <path d="M 80 185 L 320 185" stroke="#1A1A1A" strokeWidth="3.5" />
      
      {/* Repeating small vertical lines for railing */}
      <path d="M 80 185 L 320 185" stroke="#1A1A1A" strokeWidth="4" strokeDasharray="3 8" />
      <path d="M 80 205 L 320 205" stroke="#1A1A1A" strokeWidth="4" strokeDasharray="3 8" />

      {/* First Floor Walls */}
      <rect x="110" y="140" width="180" height="35" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="3" />
      
      {/* First Floor Windows */}
      <rect x="140" y="145" width="20" height="20" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5" />
      <line x1="150" y1="145" x2="150" y2="165" stroke="#1A1A1A" strokeWidth="1.5" />
      <line x1="140" y1="155" x2="160" y2="155" stroke="#1A1A1A" strokeWidth="1.5" />

      <rect x="240" y="145" width="20" height="20" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5" />
      <line x1="250" y1="145" x2="250" y2="165" stroke="#1A1A1A" strokeWidth="1.5" />
      <line x1="240" y1="155" x2="260" y2="155" stroke="#1A1A1A" strokeWidth="1.5" />

      <rect x="190" y="145" width="20" height="20" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5" />
      <line x1="200" y1="145" x2="200" y2="165" stroke="#1A1A1A" strokeWidth="1.5" />
      <line x1="190" y1="155" x2="210" y2="155" stroke="#1A1A1A" strokeWidth="1.5" />

      {/* Lower Slanted Roof (Left and Right wings) */}
      <path
        d="M 50 220 L 110 175 L 290 175 L 350 220 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Clay tile texture lines on lower roof */}
      <path d="M 65 210 L 115 175 M 100 210 L 140 175 M 140 210 L 175 175 M 180 210 L 210 175 M 220 210 L 245 175 M 260 210 L 280 175 M 300 210 L 290 175 M 335 210 L 285 175" stroke="#1A1A1A" strokeWidth="2" opacity="0.3" />

      {/* Main Upper Sloping Roof */}
      <path
        d="M 90 145 L 200 60 L 310 145 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Small Gable in the Center of Upper Roof */}
      <path
        d="M 160 115 L 200 85 L 240 115 Z"
        fill="#FFC72C"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="200" cy="103" r="5" fill="#990F02" stroke="#1A1A1A" strokeWidth="1.5" />

      {/* Upper Roof Tile details (vertical lines) */}
      <path d="M 120 145 L 200 83 M 150 145 L 200 106 M 180 145 L 200 130 M 220 145 L 200 130 M 250 145 L 200 106 M 280 145 L 200 83" stroke="#1A1A1A" strokeWidth="2" opacity="0.3" />

      {/* Traditional Wooden Finial (Pinnacle/Kalasam) at top of roof */}
      <path d="M 200 60 L 200 45" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="200" cy="42" r="4" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="200" cy="50" r="6" fill="#990F02" stroke="#1A1A1A" strokeWidth="2" />

      {/* Hanging Garlands (Jasmin/Marigold - Orange and Gold dots) */}
      {/* Under Lower Roof */}
      <path d="M 60 225 C 75 235, 95 235, 110 225 C 125 235, 145 235, 160 225 C 175 235, 195 235, 210 225 C 225 235, 245 235, 260 225 C 275 235, 295 235, 310 225 C 325 235, 335 235, 340 225" fill="none" stroke="#FFC72C" strokeWidth="5" strokeDasharray="0 8" strokeLinecap="round" />
      <path d="M 60 225 C 75 235, 95 235, 110 225 C 125 235, 145 235, 160 225 C 175 235, 195 235, 210 225 C 225 235, 245 235, 260 225 C 275 235, 295 235, 310 225 C 325 235, 335 235, 340 225" fill="none" stroke="#990F02" strokeWidth="5" strokeDasharray="0 8" strokeDashoffset="4" strokeLinecap="round" opacity="0.8" />

      {/* Vertically hanging garlands on columns */}
      <path d="M 103 230 L 103 295" fill="none" stroke="#FFC72C" strokeWidth="4" strokeDasharray="0 6" strokeLinecap="round" />
      <path d="M 153 230 L 153 295" fill="none" stroke="#FFC72C" strokeWidth="4" strokeDasharray="0 6" strokeLinecap="round" />
      <path d="M 247 230 L 247 295" fill="none" stroke="#FFC72C" strokeWidth="4" strokeDasharray="0 6" strokeLinecap="round" />
      <path d="M 297 230 L 297 295" fill="none" stroke="#FFC72C" strokeWidth="4" strokeDasharray="0 6" strokeLinecap="round" />

      <defs>
        <radialGradient id="houseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#990F02" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
