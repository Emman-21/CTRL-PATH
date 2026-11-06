import React from 'react';

export interface PixelArtProps {
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-24 h-16',
  md: 'w-28 h-20',
} as const;

export const NtPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-end justify-center select-none ${className}`}>
    <svg viewBox="0 0 96 64" className="w-full h-full drop-shadow-sm pixelated" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="10" width="34" height="48" rx="2" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
      <rect x="56" y="16" width="26" height="5" rx="1" fill="#2563EB" />
      <circle cx="76" cy="18.5" r="1.5" fill="#60A5FA" />
      <circle cx="79" cy="18.5" r="1.5" fill="#34D399" />
      <rect x="56" y="24" width="26" height="5" rx="1" fill="#2563EB" />
      <circle cx="76" cy="26.5" r="1.5" fill="#60A5FA" />
      <circle cx="79" cy="26.5" r="1.5" fill="#34D399" />
      <rect x="56" y="32" width="26" height="5" rx="1" fill="#2563EB" />
      <circle cx="76" cy="34.5" r="1.5" fill="#60A5FA" />
      <circle cx="79" cy="34.5" r="1.5" fill="#F87171" />
      <rect x="56" y="40" width="26" height="5" rx="1" fill="#2563EB" />
      <circle cx="76" cy="42.5" r="1.5" fill="#60A5FA" />
      <circle cx="79" cy="42.5" r="1.5" fill="#34D399" />
      <rect x="56" y="48" width="26" height="6" rx="1" fill="#1D4ED8" />
      <path d="M42 46 C48 46, 48 52, 54 52" stroke="#60A5FA" strokeWidth="2" strokeDasharray="2 2" />
      <rect x="10" y="22" width="32" height="24" rx="2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
      <rect x="14" y="26" width="24" height="16" fill="#1E40AF" />
      <rect x="17" y="29" width="10" height="2" fill="#93C5FD" />
      <rect x="17" y="33" width="16" height="2" fill="#60A5FA" />
      <rect x="17" y="37" width="12" height="2" fill="#34D399" />
      <rect x="23" y="46" width="6" height="6" fill="#2563EB" />
      <rect x="18" y="52" width="16" height="3" rx="1" fill="#1E3A8A" />
      <polygon points="46,12 48,6 50,12 56,14 50,16 48,22 46,16 40,14" fill="#93C5FD" />
      <polygon points="8,16 9,12 10,16 14,17 10,18 9,22 8,18 4,17" fill="#60A5FA" />
    </svg>
  </div>
);

export const BaPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-end justify-center select-none ${className}`}>
    <svg viewBox="0 0 96 64" className="w-full h-full drop-shadow-sm pixelated" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="44" height="30" rx="2" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
      <rect x="16" y="20" width="36" height="22" fill="#4C1D95" />
      <polygon points="6,46 62,46 58,52 10,52" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
      <rect x="28" y="47" width="12" height="2" rx="1" fill="#DDD6FE" />
      <rect x="20" y="34" width="4" height="6" fill="#A78BFA" />
      <rect x="26" y="29" width="4" height="11" fill="#C4B5FD" />
      <rect x="32" y="25" width="4" height="15" fill="#8B5CF6" />
      <rect x="38" y="22" width="4" height="18" fill="#F472B6" />
      <path d="M22 33 L28 28 L34 24 L40 21" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
      <rect x="62" y="32" width="7" height="20" rx="1" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1.5" />
      <rect x="71" y="24" width="7" height="28" rx="1" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.5" />
      <rect x="80" y="14" width="7" height="38" rx="1" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
      <path d="M63 26 L73 18 L83 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="85,6 87,13 80,11" fill="#10B981" />
      <polygon points="66,8 67,4 68,8 72,9 68,10 67,14 66,10 62,9" fill="#DDD6FE" />
    </svg>
  </div>
);

export const SmPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-end justify-center select-none ${className}`}>
    <svg viewBox="0 0 96 64" className="w-full h-full drop-shadow-sm pixelated" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="10" width="38" height="46" rx="2" fill="#D1FAE5" stroke="#059669" strokeWidth="2" />
      <rect x="30" y="6" width="14" height="8" rx="2" fill="#047857" stroke="#065F46" strokeWidth="1.5" />
      <circle cx="37" cy="10" r="1.5" fill="#A7F3D0" />
      <circle cx="26" cy="22" r="3" fill="#10B981" />
      <path d="M24.5 22 L25.5 23 L27.5 21" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="32" y="20.5" width="18" height="3" rx="1" fill="#065F46" />
      <circle cx="26" cy="30" r="3" fill="#10B981" />
      <path d="M24.5 30 L25.5 31 L27.5 29" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="32" y="28.5" width="16" height="3" rx="1" fill="#065F46" />
      <circle cx="26" cy="38" r="3" fill="#10B981" />
      <path d="M24.5 38 L25.5 39 L27.5 37" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="32" y="36.5" width="20" height="3" rx="1" fill="#065F46" />
      <circle cx="26" cy="46" r="3" fill="#A7F3D0" />
      <rect x="32" y="44.5" width="14" height="3" rx="1" fill="#6EE7B7" />
      <g transform="translate(64, 30)">
        <circle cx="10" cy="10" r="10" fill="#059669" />
        <circle cx="10" cy="10" r="4" fill="#ECFDF5" />
        <rect x="8" y="-2" width="4" height="24" rx="1" fill="#059669" />
        <rect x="-2" y="8" width="24" height="4" rx="1" fill="#059669" />
      </g>
      <rect x="58" y="10" width="22" height="16" rx="4" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
      <path d="M64 26 L67 29 L68 26 Z" fill="#10B981" />
      <path d="M64 17 C64 15, 66 14, 68 15 C70 14, 72 15, 72 17 C72 20, 68 22, 68 22 C68 22, 64 20, 64 17 Z" fill="#FEE2E2" />
      <polygon points="12,14 13,10 14,14 18,15 14,16 13,20 12,16 8,15" fill="#34D399" />
    </svg>
  </div>
);