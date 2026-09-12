import React from 'react';

interface SoleVaultLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * SOLEVAULT UK Official Vector Brand Logo
 * Recreates the exact premium luxury aesthetic uploaded by the user:
 * - Geometric dual-tone metallic Monogram: Platinum/Chrome 'S' overlapping Champagne Gold 'V'
 * - Minimalist athletic sneaker silhouette nestled into the monogram junction
 * - "SOLEVAULT" with dual-metal typography: "SOLE" in platinum-silver, "VAULT" in brushed champagne gold
 * - "UK" framed by crisp gold dividers
 * - "PREMIUM FOOTWEAR & LIFESTYLE" subtitled below
 */
export const SoleVaultLogo: React.FC<SoleVaultLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  // Dimension mapping
  const dimensions = {
    sm: { width: 36, height: 36, fontSize: 'text-xs' },
    md: { width: 44, height: 44, fontSize: 'text-sm' },
    lg: { width: 60, height: 60, fontSize: 'text-base' },
    xl: { width: 88, height: 88, fontSize: 'text-xl' },
  }[size];

  // The Pure Vector Monogram Mark (SV + embedded shoe)
  const MonogramMark = (
    <svg
      viewBox="0 0 200 150"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Platinum / Chrome Gradient for 'S' */}
        <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Champagne Luxury Gold Gradient for 'V' */}
        <linearGradient id="goldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#997028" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="65%" stopColor="#F5D77F" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>

        {/* Sneaker Accent Gold */}
        <linearGradient id="sneakerGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5D77F" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        {/* Inner subtle shadow */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Luxury Gold 'V' Right Stem */}
      <polygon
        points="120,68 158,35 178,35 125,92 110,92"
        fill="url(#goldGradient)"
        filter="url(#logoShadow)"
      />

      {/* Chrome 'S' Upper Arch & Spine */}
      <path
        d="M 125 35 
           L 78 35 
           C 54 35, 40 48, 40 64 
           C 40 80, 54 88, 76 90 
           L 108 92 
           C 120 93, 126 98, 126 106 
           C 126 116, 116 122, 98 122 
           L 46 122 
           L 35 137 
           L 98 137 
           C 128 137, 146 124, 146 105 
           C 146 87, 130 79, 106 77 
           L 76 75 
           C 65 74, 59 70, 59 63 
           C 59 55, 68 50, 82 50 
           L 125 50 
           Z"
        fill="url(#chromeGradient)"
        filter="url(#logoShadow)"
      />

      {/* Connecting Left Stem of Gold/Chrome Junction */}
      <polygon
        points="86,92 125,137 143,137 105,92"
        fill="url(#chromeGradient)"
        filter="url(#logoShadow)"
      />

      {/* Minimalist Running Shoe Silhouette */}
      <g transform="translate(103, 44) scale(0.48)" filter="url(#logoShadow)">
        {/* Sneaker Sole */}
        <path
          d="M 5 28 C 15 29, 32 29, 45 27 C 55 25, 65 24, 72 26 C 75 27, 76 29, 74 31 C 70 34, 40 35, 12 34 C 4 33, 2 31, 5 28 Z"
          fill="url(#sneakerGold)"
        />
        {/* Sneaker Upper & Collar Profile */}
        <path
          d="M 10 27 C 12 21, 16 18, 24 18 C 30 18, 35 21, 42 21 C 48 21, 56 16, 62 17 C 68 18, 71 22, 72 25 L 70 26 C 68 23, 64 20, 58 20 C 52 20, 46 24, 38 24 C 30 24, 26 21, 20 21 C 15 21, 12 24, 10 27 Z"
          fill="url(#sneakerGold)"
        />
        {/* Subtle Cushion Pod Accent */}
        <ellipse cx="28" cy="27" rx="3.5" ry="1.2" fill="#1C1917" />
        <ellipse cx="44" cy="26" rx="3.5" ry="1.2" fill="#1C1917" />
      </g>
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div
        className={`relative inline-flex items-center justify-center aspect-square shrink-0 ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black p-1 border border-stone-800/80 shadow-lg flex items-center justify-center">
          {MonogramMark}
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {/* Monogram Badge */}
        <div
          className="relative rounded-xl bg-gradient-to-b from-stone-900 via-stone-950 to-black p-1 border border-stone-800 shadow-md shrink-0 flex items-center justify-center"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {MonogramMark}
        </div>

        {/* Wordmark */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline tracking-tight">
            <span className="font-black text-lg md:text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-stone-300">
              SOLE
            </span>
            <span className="font-black text-lg md:text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600 ml-0.5">
              VAULT
            </span>
            <span className="ml-2 font-black text-xs px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 tracking-wider">
              UK
            </span>
          </div>

          <span className="text-[9px] font-semibold text-stone-400 tracking-[0.2em] uppercase">
            Premium Footwear
          </span>
        </div>
      </div>
    );
  }

  // Full Hero Emblem (exact replica of the user image)
  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* Monogram */}
      <div className="w-24 md:w-32 aspect-[4/3] flex items-center justify-center">
        {MonogramMark}
      </div>

      {/* Main Brand Name */}
      <div className="mt-1 flex items-baseline tracking-wider">
        <span className="text-2xl md:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-stone-300">
          SOLE
        </span>
        <span className="text-2xl md:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600">
          VAULT
        </span>
      </div>

      {/* UK with divider lines */}
      <div className="w-full max-w-[200px] flex items-center justify-center gap-3 my-1.5">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
        <span className="text-sm md:text-base font-black tracking-[0.25em] text-amber-400">
          UK
        </span>
        <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-500" />
      </div>

      {/* Subtitle */}
      <div className="text-[9px] md:text-[10px] font-semibold tracking-[0.3em] uppercase text-stone-300/90">
        PREMIUM FOOTWEAR & LIFESTYLE
      </div>
    </div>
  );
};
