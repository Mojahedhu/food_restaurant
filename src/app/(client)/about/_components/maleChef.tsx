import React from "react";

export const MaleChef = ({
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
      {/* Background Circle */}
      {/* Wooden Spoon */}
      <g transform="translate(25, 10)">
        <path
          d="M110 135 L125 90 C128 80, 140 80, 143 90 L130 135 Z"
          fill="#D2B48C"
        />
        <rect x="123" y="130" width="6" height="50" rx="3" fill="#C1A47E" />
      </g>
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
      <circle cx="74" cy="105" r="8" fill="#F0C75E" /> {/* Left Ear */}
      <circle cx="126" cy="105" r="8" fill="#F0C75E" /> {/* Right Ear */}
      <rect x="75" y="80" width="50" height="50" rx="20" fill="#F0C75E" />
      {/* Male Hair */}
      <path
        d="M75 82 C75 75, 85 72, 100 72 C115 72, 125 75, 125 82 L125 88 L75 88 Z"
        fill="#654321"
      />
      {/* Eyes */}
      <circle cx="90" cy="100" r="3.5" fill="#334155" />
      <circle cx="110" cy="100" r="3.5" fill="#334155" />
      {/* Eyebrows */}
      <path
        d="M84 92 Q90 90 96 93"
        stroke="#654321"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M104 93 Q110 90 116 92"
        stroke="#654321"
        strokeWidth="2.5"
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
