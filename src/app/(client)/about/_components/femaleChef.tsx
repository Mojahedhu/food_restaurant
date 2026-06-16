import React from "react";

export const FemaleChef = ({
  size = 150,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wooden Spoon */}
      <g transform="translate(25, 10)">
        <path
          d="M110 135 L125 90 C128 80, 140 80, 143 90 L130 135 Z"
          fill="#D2B48C"
        />
        <rect x="123" y="130" width="6" height="50" rx="3" fill="#C1A47E" />
      </g>

      {/* Female Hair (Back/Sides) */}
      <path
        d="M70 90 C65 105, 65 125, 76 130 C74 115, 74 95, 74 90 Z"
        fill="#D4AF37"
      />
      <path
        d="M130 90 C135 105, 135 125, 124 130 C126 115, 126 95, 126 90 Z"
        fill="#D4AF37"
      />

      {/* Chef Uniform/Body */}
      <path
        d="M50 190 C50 160, 70 140, 100 140 C130 140, 150 160, 150 190"
        fill="#EAEAEA"
      />
      <path d="M90 140 L100 155 L110 140" fill="#CBD5E1" />
      {/* Buttons */}
      <circle cx="93" cy="165" r="3" fill="#94A3B8" />
      <circle cx="107" cy="165" r="3" fill="#94A3B8" />
      <circle cx="93" cy="180" r="3" fill="#94A3B8" />
      <circle cx="107" cy="180" r="3" fill="#94A3B8" />

      {/* Neck */}
      <rect x="88" y="120" width="24" height="25" rx="4" fill="#F0C75E" />

      {/* Face & Ears */}
      <circle cx="74" cy="105" r="7" fill="#F0C75E" />
      <circle cx="126" cy="105" r="7" fill="#F0C75E" />
      <rect x="75" y="80" width="50" height="50" rx="20" fill="#F0C75E" />

      {/* Female Hair (Bangs/Top) */}
      <path
        d="M75 82 C75 75, 85 70, 100 70 C115 70, 125 75, 125 82 L125 86 C115 80, 85 80, 75 86 Z"
        fill="#D4AF37"
      />

      {/* Eyes */}
      <circle cx="90" cy="100" r="3.5" fill="#334155" />
      <circle cx="110" cy="100" r="3.5" fill="#334155" />

      {/* Eyebrows */}
      <path
        d="M84 93 Q90 91 96 94"
        stroke="#B8860B"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M104 94 Q110 91 116 93"
        stroke="#B8860B"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Smile */}
      <path
        d="M92 114 Q100 120 108 114"
        stroke="#334155"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Chef Hat */}
      <path
        d="M68 76 C55 60, 80 40, 90 52 C95 38, 115 42, 115 54 C130 44, 142 65, 132 76 Z"
        fill="#E2E8F0"
      />
      <path d="M72 70 L128 70 L124 80 L76 80 Z" fill="#E2E8F0" />
      <line x1="74" y1="75" x2="126" y2="75" stroke="#CBD5E1" strokeWidth="2" />
    </svg>
  );
};
