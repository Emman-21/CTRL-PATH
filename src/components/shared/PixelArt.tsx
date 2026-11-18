import React from 'react';

export interface PixelArtProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-32 h-20 sm:w-36 sm:h-22',
  md: 'w-40 h-26 sm:w-44 sm:h-28',
  lg: 'w-52 h-32',
} as const;

/**
 * Networking Technology (NT) SVG Illustration
 * Infrastructure, Cloud Datacenter, Network Topology & Cybersecurity Defense
 */
export const NtPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 160 96" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nt-rack-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="nt-glow-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="nt-shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="nt-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Soft Pulse Circle */}
      <circle cx="80" cy="48" r="44" className="fill-[#E8F1FF] dark:fill-[#1B3161] transition-colors" />
      <circle cx="80" cy="48" r="36" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 3" />

      {/* Datacenter Server Rack (Left) */}
      <g transform="translate(18, 14)">
        {/* Server Outer Frame */}
        <rect x="0" y="0" width="38" height="68" rx="5" fill="url(#nt-rack-grad)" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Rack Header */}
        <rect x="4" y="4" width="30" height="5" rx="1.5" fill="#3B82F6" fillOpacity="0.3" />
        <circle cx="8" cy="6.5" r="1" fill="#60A5FA" />
        <circle cx="12" cy="6.5" r="1" fill="#34D399" />

        {/* Blade Server 1 */}
        <rect x="4" y="13" width="30" height="9" rx="2" fill="#1E40AF" stroke="#2563EB" strokeWidth="1" />
        <line x1="7" y1="17.5" x2="19" y2="17.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="17.5" r="1.5" fill="#34D399" />
        <circle cx="28" cy="17.5" r="1.5" fill="#60A5FA" />

        {/* Blade Server 2 */}
        <rect x="4" y="25" width="30" height="9" rx="2" fill="#1E40AF" stroke="#2563EB" strokeWidth="1" />
        <line x1="7" y1="29.5" x2="19" y2="29.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="29.5" r="1.5" fill="#60A5FA" />
        <circle cx="28" cy="29.5" r="1.5" fill="#34D399" />

        {/* Blade Server 3 (Active) */}
        <rect x="4" y="37" width="30" height="9" rx="2" fill="#1E40AF" stroke="#2563EB" strokeWidth="1" />
        <line x1="7" y1="41.5" x2="19" y2="41.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="41.5" r="1.5" fill="#FBBF24" />
        <circle cx="28" cy="41.5" r="1.5" fill="#34D399" />

        {/* Switch / Cable Port Row */}
        <rect x="4" y="49" width="30" height="13" rx="2" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
        <rect x="7" y="53" width="4" height="4" rx="1" fill="#2563EB" />
        <rect x="13" y="53" width="4" height="4" rx="1" fill="#2563EB" />
        <rect x="19" y="53" width="4" height="4" rx="1" fill="#3B82F6" />
        <rect x="25" y="53" width="4" height="4" rx="1" fill="#10B981" />
      </g>

      {/* Network Cables & Transmission Topology */}
      <path d="M56 46 C68 46, 68 32, 78 32" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M56 58 C72 58, 70 64, 82 64" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M106 32 C116 32, 116 46, 126 46" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M106 64 C116 64, 116 54, 126 54" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 2" />

      {/* Central Cloud & Routing Switch Hub */}
      <g transform="translate(68, 20)">
        {/* Router Base */}
        <rect x="4" y="16" width="38" height="14" rx="3" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Router Antennas */}
        <line x1="12" y1="16" x2="8" y2="4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="3" r="2" fill="#60A5FA" />
        <line x1="34" y1="16" x2="38" y2="4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="3" r="2" fill="#60A5FA" />
        {/* Wi-Fi Waves */}
        <path d="M18 10 A7 7 0 0 1 28 10" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M15 7 A11 11 0 0 1 31 7" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Port Status LEDs */}
        <circle cx="11" cy="23" r="1.5" fill="#10B981" />
        <circle cx="17" cy="23" r="1.5" fill="#3B82F6" />
        <circle cx="23" cy="23" r="1.5" fill="#10B981" />
        <circle cx="29" cy="23" r="1.5" fill="#60A5FA" />
        <circle cx="35" cy="23" r="1.5" fill="#34D399" />
      </g>

      {/* Cybersecurity Defense Shield (Center-Right Front) */}
      <g transform="translate(108, 22)" filter="url(#nt-glow)">
        <path
          d="M20 0 L36 6 C36 22, 28 34, 20 40 C12 34, 4 22, 4 6 Z"
          fill="url(#nt-shield-grad)"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />
        {/* Security Keyhole / Lock */}
        <rect x="15" y="18" width="10" height="9" rx="2" fill="#FFFFFF" />
        <circle cx="20" cy="15" r="4" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="20" cy="21.5" r="1.2" fill="#1D4ED8" />
        <line x1="20" y1="22.5" x2="20" y2="25" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Terminal Node / Workstation (Far Right) */}
      <g transform="translate(122, 44)">
        <rect x="0" y="0" width="24" height="18" rx="2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
        <rect x="2" y="2" width="20" height="12" rx="1" fill="#0F172A" />
        <line x1="4" y1="5" x2="12" y2="5" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="8" x2="16" y2="8" stroke="#34D399" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="11" x2="10" y2="11" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />
        <rect x="9" y="18" width="6" height="5" fill="#2563EB" />
        <rect x="5" y="23" width="14" height="2" rx="1" fill="#1E3A8A" />
      </g>

      {/* Glowing Packets */}
      <circle cx="68" cy="39" r="2.5" fill="#38BDF8" filter="url(#nt-glow)" />
      <circle cx="118" cy="38" r="2.5" fill="#34D399" filter="url(#nt-glow)" />

      {/* Corner Tech Accents */}
      <path d="M12 12 L8 12 L8 16" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M148 12 L152 12 L152 16" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="144,22 145,18 146,22 150,23 146,24 145,28 144,24 140,23" fill="#60A5FA" />
    </svg>
  </div>
);

/**
 * Business Analytics (BA) SVG Illustration
 * Big Data, KPI Predictive Growth, Bar Charts, Donut Telemetry & Intelligence
 */
export const BaPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 160 96" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ba-bg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E1065" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="ba-bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="ba-bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
        <linearGradient id="ba-bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>
        <linearGradient id="ba-bar4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ba-line-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <filter id="ba-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Soft Aura Circle */}
      <circle cx="80" cy="48" r="44" className="fill-[#F4ECFF] dark:fill-[#2E1E59] transition-colors" />
      <circle cx="80" cy="48" r="36" stroke="#EDE9FE" strokeWidth="1" strokeDasharray="3 3" />

      {/* Main Analytics Window Board */}
      <g transform="translate(18, 12)">
        {/* Glass Dashboard Base */}
        <rect x="0" y="0" width="88" height="72" rx="7" fill="url(#ba-bg-grad)" stroke="#8B5CF6" strokeWidth="1.5" />
        {/* Window Chrome Header */}
        <rect x="0" y="0" width="88" height="14" rx="7" fill="#4C1D95" fillOpacity="0.7" />
        <circle cx="8" cy="7" r="2" fill="#F43F5E" />
        <circle cx="15" cy="7" r="2" fill="#FBBF24" />
        <circle cx="22" cy="7" r="2" fill="#10B981" />
        <line x1="32" y1="7" x2="60" y2="7" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />

        {/* Grid Background Lines */}
        <line x1="10" y1="26" x2="78" y2="26" stroke="#4C1D95" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="10" y1="38" x2="78" y2="38" stroke="#4C1D95" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="10" y1="50" x2="78" y2="50" stroke="#4C1D95" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="10" y1="62" x2="78" y2="62" stroke="#6D28D9" strokeWidth="1.5" />

        {/* 3D-styled Data Columns */}
        {/* Bar 1 */}
        <rect x="14" y="44" width="9" height="18" rx="2" fill="url(#ba-bar1)" />
        {/* Bar 2 */}
        <rect x="28" y="34" width="9" height="28" rx="2" fill="url(#ba-bar2)" />
        {/* Bar 3 */}
        <rect x="42" y="24" width="9" height="38" rx="2" fill="url(#ba-bar3)" />
        {/* Bar 4 */}
        <rect x="56" y="18" width="9" height="44" rx="2" fill="url(#ba-bar4)" />

        {/* Upward Growth Trendline */}
        <path
          d="M14 50 Q 28 42, 42 30 T 72 16"
          stroke="url(#ba-line-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#ba-glow)"
        />
        {/* Trendline Arrowhead */}
        <polygon points="76,14 77,21 71,18" fill="#10B981" />

        {/* Glowing Data Point Nodes */}
        <circle cx="18" cy="49" r="2" fill="#FBBF24" />
        <circle cx="32" cy="37" r="2" fill="#F43F5E" />
        <circle cx="46" cy="27" r="2.5" fill="#A855F7" />
        <circle cx="60" cy="19" r="3" fill="#38BDF8" />
      </g>

      {/* Radial Donut Telemetry Gauge (Right Side) */}
      <g transform="translate(112, 16)">
        {/* Outer Donut Ring */}
        <circle cx="20" cy="20" r="18" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1.5" />
        {/* Progress Arc */}
        <circle
          cx="20"
          cy="20"
          r="13"
          stroke="#38BDF8"
          strokeWidth="4"
          fill="none"
          strokeDasharray="60 30"
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
        <circle
          cx="20"
          cy="20"
          r="13"
          stroke="#EC4899"
          strokeWidth="4"
          fill="none"
          strokeDasharray="25 65"
          strokeDashoffset="-60"
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
        {/* Center Percentage Display */}
        <text x="20" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
          92%
        </text>

        {/* Floating Mini KPI Metric Card */}
        <g transform="translate(-2, 44)">
          <rect x="0" y="0" width="44" height="22" rx="4" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="1" />
          <path d="M4 14 L12 8 L18 11 L28 4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="32" y="10" fill="#059669" fontSize="7" fontWeight="bold">+28%</text>
          <text x="32" y="18" fill="#64748B" fontSize="6" fontWeight="medium">ROI</text>
        </g>
      </g>

      {/* Predictive Sparkles */}
      <polygon points="18,10 19,6 20,10 24,11 20,12 19,16 18,12 14,11" fill="#FBBF24" />
      <polygon points="146,8 147,4 148,8 152,9 148,10 147,14 146,10 142,9" fill="#A855F7" />
      <circle cx="106" cy="74" r="2" fill="#F43F5E" />
    </svg>
  </div>
);

/**
 * Service Management (SM) SVG Illustration
 * ITIL Operations, Quality SLA, Precision Synchronized Gears, Customer CX & Tech Delivery
 */
export const SmPixelArt: React.FC<PixelArtProps> = ({ size = 'sm', className = '' }) => (
  <div className={`relative ${SIZE_MAP[size]} shrink-0 flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 160 96" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sm-gear-grad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="sm-gear-grad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="sm-board-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="sm-badge-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="sm-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Soft Emerald Aura */}
      <circle cx="80" cy="48" r="44" className="fill-[#E6FAF0] dark:fill-[#143D2B] transition-colors" />
      <circle cx="80" cy="48" r="36" stroke="#D1FAE5" strokeWidth="1" strokeDasharray="3 3" />

      {/* Synchronized ITIL Process Gears (Left Side) */}
      {/* Large Gear */}
      <g transform="translate(14, 18)" filter="url(#sm-glow)">
        <g transform="translate(22, 22)">
          {/* Gear Teeth (8 teeth) */}
          <rect x="-4" y="-22" width="8" height="44" rx="2" fill="url(#sm-gear-grad1)" />
          <rect x="-4" y="-22" width="8" height="44" rx="2" fill="url(#sm-gear-grad1)" transform="rotate(45)" />
          <rect x="-4" y="-22" width="8" height="44" rx="2" fill="url(#sm-gear-grad1)" transform="rotate(90)" />
          <rect x="-4" y="-22" width="8" height="44" rx="2" fill="url(#sm-gear-grad1)" transform="rotate(135)" />
          {/* Gear Body Circle */}
          <circle cx="0" cy="0" r="17" fill="url(#sm-gear-grad1)" stroke="#A7F3D0" strokeWidth="1.5" />
          {/* Inner Axle Bearing */}
          <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#047857" strokeWidth="2" />
          <circle cx="0" cy="0" r="2.5" fill="#047857" />
        </g>
      </g>

      {/* Small Intermeshing Gear */}
      <g transform="translate(48, 48)">
        {/* Teeth (6 teeth) */}
        <rect x="-3" y="-14" width="6" height="28" rx="1.5" fill="url(#sm-gear-grad2)" />
        <rect x="-3" y="-14" width="6" height="28" rx="1.5" fill="url(#sm-gear-grad2)" transform="rotate(60)" />
        <rect x="-3" y="-14" width="6" height="28" rx="1.5" fill="url(#sm-gear-grad2)" transform="rotate(120)" />
        <circle cx="0" cy="0" r="11" fill="url(#sm-gear-grad2)" stroke="#D1FAE5" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
      </g>

      {/* SLA Quality & IT Service Delivery Clipboard (Center) */}
      <g transform="translate(68, 12)">
        {/* Clipboard Wooden / Tech Board */}
        <rect x="0" y="4" width="46" height="66" rx="5" fill="#064E3B" stroke="#059669" strokeWidth="1.5" />
        {/* Paper Sheet */}
        <rect x="3" y="10" width="40" height="56" rx="3" fill="url(#sm-board-grad)" stroke="#A7F3D0" strokeWidth="1" />
        {/* Top Metallic Clip */}
        <rect x="14" y="1" width="18" height="9" rx="2.5" fill="#10B981" stroke="#065F46" strokeWidth="1" />
        <circle cx="23" cy="5.5" r="2" fill="#FFFFFF" />

        {/* SLA Item 1 (Done) */}
        <circle cx="10" cy="22" r="4" fill="#10B981" />
        <path d="M8 22 L9.5 23.5 L12 21" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="17" y1="22" x2="38" y2="22" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />

        {/* SLA Item 2 (Done) */}
        <circle cx="10" cy="32" r="4" fill="#10B981" />
        <path d="M8 32 L9.5 33.5 L12 31" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="17" y1="32" x2="35" y2="32" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />

        {/* SLA Item 3 (Done) */}
        <circle cx="10" cy="42" r="4" fill="#10B981" />
        <path d="M8 42 L9.5 43.5 L12 41" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="17" y1="42" x2="39" y2="42" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />

        {/* Service Progress Meter */}
        <rect x="7" y="52" width="32" height="6" rx="3" fill="#E2E8F0" />
        <rect x="7" y="52" width="28" height="6" rx="3" fill="#10B981" />
      </g>

      {/* Customer Experience (CX) & 5-Star Service Badge (Right) */}
      <g transform="translate(118, 16)" filter="url(#sm-glow)">
        {/* Shield / Badge Shape */}
        <path
          d="M18 0 L32 5 C32 18, 25 28, 18 33 C11 28, 4 18, 4 5 Z"
          fill="url(#sm-badge-gold)"
          stroke="#FDE68A"
          strokeWidth="1.5"
        />
        {/* Star Icon in Badge */}
        <polygon
          points="18,8 20.5,13.5 26.5,14 22,18 23.5,24 18,20.8 12.5,24 14,18 9.5,14 15.5,13.5"
          fill="#FFFFFF"
        />
      </g>

      {/* Customer Satisfaction Feedback Bubble (Bottom Right) */}
      <g transform="translate(116, 52)">
        <rect x="0" y="0" width="36" height="24" rx="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5" />
        <path d="M8 24 L12 28 L14 24 Z" fill="#FFFFFF" />
        {/* Happy Face */}
        <circle cx="12" cy="11" r="1.5" fill="#059669" />
        <circle cx="24" cy="11" r="1.5" fill="#059669" />
        <path d="M14 15 Q 18 19, 22 15" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Sparkles */}
      <polygon points="14,10 15,6 16,10 20,11 16,12 15,16 14,12 10,11" fill="#34D399" />
      <polygon points="146,8 147,4 148,8 152,9 148,10 147,14 146,10 142,9" fill="#FBBF24" />
    </svg>
  </div>
);

/**
 * Compact Track Badges (40x40) for card headers, topbars, and pills
 */
export const NtTrackBadge: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#2563EB" />
    <circle cx="20" cy="20" r="15" stroke="#93C5FD" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    {/* Router / Network node mesh */}
    <circle cx="13" cy="15" r="2" fill="#93C5FD" />
    <circle cx="27" cy="15" r="2" fill="#93C5FD" />
    <circle cx="20" cy="27" r="2.5" fill="#60A5FA" />
    <line x1="13" y1="15" x2="27" y2="15" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
    <line x1="13" y1="15" x2="20" y2="27" stroke="#60A5FA" strokeWidth="1.5" />
    <line x1="27" y1="15" x2="20" y2="27" stroke="#60A5FA" strokeWidth="1.5" />
    {/* Shield Lock in Center */}
    <path d="M20 11 L25 13 C25 18, 22 21, 20 23 C18 21, 15 18, 15 13 Z" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1" />
    <circle cx="20" cy="16" r="1.5" fill="#FFFFFF" />
    <text x="20" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" letterSpacing="0.5">NT</text>
  </svg>
);

export const BaTrackBadge: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#7C3AED" />
    <circle cx="20" cy="20" r="15" stroke="#DDD6FE" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    {/* Rising Bar Chart */}
    <rect x="11" y="20" width="3" height="7" rx="1" fill="#C4B5FD" />
    <rect x="16" y="16" width="3" height="11" rx="1" fill="#A78BFA" />
    <rect x="21" y="12" width="3" height="15" rx="1" fill="#F472B6" />
    <rect x="26" y="8" width="3" height="19" rx="1" fill="#38BDF8" />
    {/* Upward Line */}
    <path d="M11 20 L16 16 L21 12 L27 8" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
    <polygon points="28,6 29,10 25,8" fill="#FDE047" />
    <text x="20" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" letterSpacing="0.5">BA</text>
  </svg>
);

export const SmTrackBadge: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#059669" />
    <circle cx="20" cy="20" r="15" stroke="#A7F3D0" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    {/* ITIL Gear */}
    <g transform="translate(16, 17)">
      <rect x="-2" y="-9" width="4" height="18" rx="1" fill="#A7F3D0" />
      <rect x="-2" y="-9" width="4" height="18" rx="1" fill="#A7F3D0" transform="rotate(45)" />
      <rect x="-2" y="-9" width="4" height="18" rx="1" fill="#A7F3D0" transform="rotate(90)" />
      <rect x="-2" y="-9" width="4" height="18" rx="1" fill="#A7F3D0" transform="rotate(135)" />
      <circle cx="0" cy="0" r="7" fill="#047857" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
    </g>
    {/* SLA Checkmark Shield */}
    <path d="M26 9 L31 11 C31 15, 29 18, 26 20 C23 18, 21 15, 21 11 Z" fill="#FBBF24" />
    <path d="M24 14 L25.5 15.5 L28.5 12.5" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="20" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" letterSpacing="0.5">SM</text>
  </svg>
);