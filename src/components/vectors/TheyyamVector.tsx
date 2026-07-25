import React from 'react'

interface VectorProps {
  className?: string
  style?: React.CSSProperties
}

export const TheyyamVector: React.FC<VectorProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Shadow Glow */}
      <circle cx="200" cy="200" r="160" fill="url(#theyyamGlow)" opacity="0.15" />

      {/* Main Headgear (Mudi) - Outer Ring */}
      <circle cx="200" cy="180" r="150" fill="#990F02" stroke="#1A1A1A" strokeWidth="6" />
      
      {/* Headgear - White Circles Row */}
      <circle cx="200" cy="180" r="132" stroke="#FFFFFF" strokeWidth="12" strokeDasharray="16 11.5" />
      
      {/* Headgear - Inner Red Ring */}
      <circle cx="200" cy="180" r="116" fill="#C21807" stroke="#1A1A1A" strokeWidth="4" />
      
      {/* Headgear - Golden/Orange Concentric Section */}
      <circle cx="200" cy="180" r="98" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="200" cy="180" r="88" fill="#E65100" stroke="#1A1A1A" strokeWidth="3" />

      {/* Headgear - White Triangles Border */}
      <circle cx="200" cy="180" r="76" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="10 8" />

      {/* Face Frame Base */}
      <path
        d="M 120 180 C 120 280, 280 280, 280 180 C 280 120, 120 120, 120 180 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="6"
      />

      {/* Face Red Paint Area */}
      <path
        d="M 130 180 C 130 265, 270 265, 270 180 C 270 135, 130 135, 130 180 Z"
        fill="#E64A19"
      />

      {/* Intricate White Forehead Patterns */}
      <path
        d="M 200 135 C 190 145, 190 155, 200 165 C 210 155, 210 145, 200 135 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <circle cx="200" cy="130" r="4" fill="#FFFFFF" />
      <circle cx="200" cy="172" r="3" fill="#FFFFFF" />

      {/* Stylized Eyes Paint (Winged Eye Writing - Eyezhuthi) */}
      {/* Left Eye Black Area */}
      <path
        d="M 150 180 C 150 160, 195 160, 195 185 C 180 190, 155 190, 150 180 Z"
        fill="#1A1A1A"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      {/* Left Eye White eyeball */}
      <ellipse cx="172" cy="178" rx="8" ry="4" fill="#FFFFFF" />
      <circle cx="172" cy="178" r="3.5" fill="#1A1A1A" />

      {/* Right Eye Black Area */}
      <path
        d="M 250 180 C 250 160, 205 160, 205 185 C 220 190, 245 190, 250 180 Z"
        fill="#1A1A1A"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      {/* Right Eye White eyeball */}
      <ellipse cx="228" cy="178" rx="8" ry="4" fill="#FFFFFF" />
      <circle cx="228" cy="178" r="3.5" fill="#1A1A1A" />

      {/* White cheek-lines/mustache paint */}
      <path
        d="M 150 200 C 170 215, 195 210, 195 200"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 250 200 C 230 215, 205 210, 205 200"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Long nose line */}
      <path
        d="M 200 165 L 200 208 M 194 208 L 206 208"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Lips */}
      <path
        d="M 182 220 C 182 220, 200 230, 218 220 C 210 232, 190 232, 182 220 Z"
        fill="#990F02"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <path
        d="M 180 220 C 190 216, 210 216, 220 220"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Chin ornaments */}
      <path
        d="M 190 235 L 200 245 L 210 235 Z"
        fill="#FFC72C"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <circle cx="200" cy="252" r="3" fill="#FFFFFF" />

      {/* Large Circular Ear Ornaments (Kadhila) */}
      {/* Left Upper Ear Ornament */}
      <circle cx="120" cy="195" r="28" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="120" cy="195" r="16" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="120" cy="195" r="6" fill="#990F02" />
      {/* Inner dots */}
      <circle cx="120" cy="195" r="22" stroke="#1A1A1A" strokeWidth="4" strokeDasharray="4 4" />

      {/* Right Upper Ear Ornament */}
      <circle cx="280" cy="195" r="28" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="280" cy="195" r="16" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="280" cy="195" r="6" fill="#990F02" />
      {/* Inner dots */}
      <circle cx="280" cy="195" r="22" stroke="#1A1A1A" strokeWidth="4" strokeDasharray="4 4" />

      {/* Left Lower Ear Ornament */}
      <circle cx="110" cy="250" r="26" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="110" cy="250" r="14" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="110" cy="250" r="5" fill="#990F02" />
      <circle cx="110" cy="250" r="20" stroke="#1A1A1A" strokeWidth="3" strokeDasharray="3 3" />

      {/* Right Lower Ear Ornament */}
      <circle cx="290" cy="250" r="26" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="290" cy="250" r="14" fill="#FFC72C" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="290" cy="250" r="5" fill="#990F02" />
      <circle cx="290" cy="250" r="20" stroke="#1A1A1A" strokeWidth="3" strokeDasharray="3 3" />

      {/* Neck Collar / Ornament (Bottom Part) */}
      <path
        d="M 130 280 C 130 330, 270 330, 270 280"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M 130 280 C 130 330, 270 330, 270 280"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="round"
        strokeDasharray="12 10"
      />
      <path
        d="M 130 280 C 130 330, 270 330, 270 280"
        fill="none"
        stroke="#FFC72C"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <defs>
        <radialGradient id="theyyamGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#990F02" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
