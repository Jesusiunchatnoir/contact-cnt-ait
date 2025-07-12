import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cercle anarchiste */}
      <circle
        cx="25"
        cy="30"
        r="20"
        fill="none"
        stroke="#DC2626"
        strokeWidth="3"
      />
      
      {/* A anarchiste */}
      <path
        d="M15 40 L25 15 L35 40 M19 32 L31 32"
        stroke="#DC2626"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Texte "CommuneCast" */}
      <text
        x="55"
        y="25"
        fontSize="16"
        fontWeight="bold"
        fill="#DC2626"
        fontFamily="Inter, sans-serif"
      >
        CommuneCast
      </text>
      
      {/* Sous-titre anarchiste */}
      <text
        x="55"
        y="40"
        fontSize="9"
        fill="#B91C1C"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        LIBRE • AUTONOME • SOLIDAIRE
      </text>
      
      {/* Étoile anarchiste */}
      <path
        d="M175 20l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"
        fill="#DC2626"
      />
      
      {/* Flamme révolutionnaire */}
      <path
        d="M185 35c1-3 3-5 5-2 1 2-1 4-2 5 2-1 5 1 4 3-1 2-3 3-5 2 1 2-1 4-3 3-2-1-2-3-1-5-2 1-4-1-3-3 1-2 3-2 4-1-1-1 1-2 1-2z"
        fill="#B91C1C"
      />
      
      {/* Réseau P2P anarchiste */}
      <g stroke="#DC2626" strokeWidth="2" opacity="0.8">
        <circle cx="12" cy="50" r="2" fill="#DC2626" />
        <circle cx="25" cy="55" r="2" fill="#DC2626" />
        <circle cx="38" cy="50" r="2" fill="#DC2626" />
        <line x1="12" y1="50" x2="25" y2="55" />
        <line x1="25" y1="55" x2="38" y2="50" />
        <line x1="38" y1="50" x2="12" y2="50" />
      </g>
    </svg>
  );
};

export default Logo;