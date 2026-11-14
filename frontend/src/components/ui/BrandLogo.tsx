import React from 'react';

export const BrandLogo: React.FC<{
  dark?: boolean;
  size?: 'sm' | 'md';
}> = ({ dark = false, size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconSize}
        aria-hidden="true"
      >
        <rect
          width="32"
          height="32"
          rx="8"
          fill={dark ? '#2563EB' : '#0F172A'}
        />
        <path
          d="M9 11.5H23M16 11.5V22.5"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M19.5 18.5L21.5 20.5L25 16.5"
          stroke={dark ? '#93C5FD' : '#38BDF8'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display font-bold tracking-tight ${textSize} ${
          dark ? 'text-white' : 'text-slate-950'
        }`}
      >
        TradeProof
      </span>
    </span>
  );
};
